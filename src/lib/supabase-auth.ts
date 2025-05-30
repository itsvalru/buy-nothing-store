import bcrypt from "bcrypt";
import { supabase } from "./supabase";

export async function createUser(
  email: string,
  password: string,
  displayName: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from("users").insert([
    {
      email,
      password: hashedPassword,
      display_name: displayName,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
