"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      // Check if user already exists in `users` table
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id);

      if (!existing || existing.length === 0) {
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          display_name: displayName,
          avatar_url: avatarUrl || null,
        });
      }
    }

    alert("Signup successful! Check your email to confirm.");
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Avatar URL (optional)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800"
      >
        Sign Up
      </button>
    </form>
  );
}
