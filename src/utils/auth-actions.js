"use server";

import bcrypt from "bcrypt";
import User from "@models/user";
import { connectToDatabase } from "@utils/db-connection";
import { uploadTemplates } from "@utils/s3-client";

/**
 * Validates user registration data
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} passwordRepeat - Password confirmation
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
const validateRegistrationData = (email, password, passwordRepeat) => {
  if (!email || !password || !passwordRepeat) {
    return { isValid: false, error: "All fields are required" };
  }

  if (password !== passwordRepeat) {
    return { isValid: false, error: "Passwords do not match" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
};

/**
 * Registers a new user for credential‑based sign‑ups
 * @param {Object} prevState - Previous state
 * @param {FormData} formData - Form data containing user registration information
 * @returns {Promise<Object>} Result of the registration attempt
 */
export const register = async (_prevState, formData) => {
  try {
    // Ensure database connection
    await connectToDatabase();

    // Extract and validate form data
    const { email, password, passwordRepeat, username, image } =
      Object.fromEntries(formData);

    const validation = validateRegistrationData(
      email,
      password,
      passwordRepeat,
    );
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Duplicate check
    if (await User.findOne({ email })) {
      return { success: false, error: "Email already exists" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Create new user data
    console.log("Creating New User");
    const newUser = await User.create({
      email,
      username: username || email.split("@")[0],
      role: "user",
      provider: "credentials",
      password: hashed,
      ...(image && { image }),
    });

    // Upload Template
    if (!newUser.uuid) {
      console.error("Cannot resolve uuid from created user:", newUser);
    } else {
      console.log("Creating Templates");
      uploadTemplates(newUser.uuid).catch((err) =>
        console.error("Template upload error:", err),
      );
    }
    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Registration failed. Please try again later.",
    };
  }
};
