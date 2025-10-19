"use server";

import { registerCore } from "@/utils/server/register-core";

export async function registerAction(prevState, formData) {
  const data = Object.fromEntries(formData);
  const { email, password, passwordRepeat, username, image } = data;
  const result = await registerCore({
    email,
    password,
    passwordRepeat,
    username,
    image,
  });
  return result;
}
