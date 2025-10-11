import "server-only";
import bcrypt from "bcrypt";
import logger, { maskValue } from "@utils/logger";
import { createUser, getUserByEmail } from "@models/user";
import { uploadTemplates } from "@utils/s3-client";

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

    if (await getUserByEmail(email)) {
      return {
        success: false,
        error: "Email already exists",
        reason: "conflict",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      email,
      username: username || email.split("@")[0],
      role: "user",
      provider: "credentials",
      password: hashed,
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
