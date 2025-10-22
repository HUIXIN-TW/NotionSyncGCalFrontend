import "server-only";
import bcrypt from "bcrypt";
import logger from "@utils/logger";
import { createUser, getUserByEmail } from "@models/user";
import { uploadTemplates } from "@/utils/server/s3-client";
import { normalizeEmail } from "@/utils/server/normalize-email";

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
};

export async function registerCore({
  email,
  password,
  passwordRepeat,
  username,
  image,
}) {
  try {
    const validation = validateRegistrationData(
      email,
      password,
      passwordRepeat,
    );
    if (!validation.isValid) {
      return { success: false, error: validation.error, reason: "validation" };
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return {
        success: false,
        error: "Invalid email format",
        reason: "validation",
      };
    }

    if (await getUserByEmail(normalizedEmail)) {
      return {
        success: false,
        error: "Email already exists",
        reason: "conflict",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      email: normalizedEmail,
      username: username || normalizedEmail.split("@")[0],
      role: "user",
      provider: "credentials",
      passwordHash: hashed,
      ...(image && { image }),
    });

    if (newUser?.uuid) {
      uploadTemplates(newUser.uuid).catch((err) =>
        logger.error("Template upload error", err?.message || err),
      );
    } else {
      logger.error("Cannot resolve uuid from created user", {
        id: newUser?.id || null,
      });
    }

    return { success: true };
  } catch (error) {
    logger.error("Registration error", error);
    return {
      success: false,
      error: "Registration failed. Please try again later.",
      reason: "server",
    };
  }
}

export default registerCore;
