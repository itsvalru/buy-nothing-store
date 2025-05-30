"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      console.log("Signed up user:", user);

      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("Inserting user:", {
        id: user.id,
        email: user.email,
        display_name: displayName,
        avatar_url: avatarUrl,
      });

      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        display_name: displayName,
        avatar_url: avatarUrl || null,
      });

      if (insertError) {
        console.error("Insert user error:", insertError.message);
        alert("User insert failed: " + insertError.message);
        return;
      }

      alert("Signup successful! Check your email to confirm.");
      router.push("/");
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="space-y-4 bg-white p-6 rounded-xl shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-bold">Sign Up</h2>

      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Avatar URL (optional)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Sign Up
      </button>
    </form>
  );
}
