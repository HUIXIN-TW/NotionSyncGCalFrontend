"use server";

import bcrypt from "bcrypt";
import User from "@models/user";
import { connectToDatabase } from "@utils/db-connection";

/**
 * Validates user registration data
 * @param {Object} data - User registration data
 * @returns {Object} Validation result with error message if invalid
 */
const validateRegistrationData = (data) => {
  const { email, password, passwordRepeat } = data;
  
  if (!email || !password || !passwordRepeat) {
    return { isValid: false, error: "All fields are required" };
  }
  
  if (password !== passwordRepeat) {
    return { isValid: false, error: "Passwords do not match" };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }
  
  return { isValid: true };
};

/**
 * Registers a new user
 * @param {Object} prevState - Previous state
 * @param {FormData} formData - Form data containing user registration information
 * @returns {Promise<Object>} Result of the registration attempt
 */
export const register = async (prevState, formData) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    // Extract and validate form data
    const formDataObj = Object.fromEntries(formData);
    const validation = validateRegistrationData(formDataObj);
    
    if (!validation.isValid) {
      return { error: validation.error };
    }
    
    const { email, password } = formDataObj;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "Email already exists" };
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user in DynamoDB
    await User.create({
      email,
      password: hashedPassword,
    });
    
    console.log("✅ User created successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    return { error: "Registration failed. Please try again later." };
  }
};
