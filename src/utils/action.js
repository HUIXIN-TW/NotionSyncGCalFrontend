"use server";

import bcrypt from 'bcrypt';

import { connectToDatabase } from "./database";
import User from "@models/user";

export const register = async (prevState, formData) => {
  // Destructure the form data
  const { email, password, passwordRepeat } = Object.fromEntries(formData);

  // Check if the password and passwordRepeat match
  if (password !== passwordRepeat) {
    return { error: "Passwords do not match" };
  }

  // Interact with the database
  try {
    await connectToDatabase();

    // Check if the user already exists
    const user = await User.findOne({ email });

    if (user) {
      return { error: "Email already exists" };
    }

    console.log("Creating new user...");

    // If the user does not exist
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();
    console.log("Created new users into db!");
    return { success: true };
  } catch (error) {
    console.log(error.message);
    return { error: error.message };
  }
};
