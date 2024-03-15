import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
  },
  username: {
    type: String,
    default: function () {
      // Generates a default username based on the email before the "@" character
      // This is a simple example, ensure it meets your requirements for uniqueness or format
      return this.email.split("@")[0];
    },
    match: [
      /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
      "Username invalid, it should contain 8-20 alphanumeric letters and be unique!",
    ],
  },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
  image: { type: String, required: true, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = models.User || model("User", UserSchema, 'test_users');

export default User;
