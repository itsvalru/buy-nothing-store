"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
      }
    );

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message || "Signup failed");
      return;
    }

    let avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${displayName}`;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `avatars/${signUpData.user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }
    }

    const { error: insertError } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        avatar_url: avatarUrl,
      })
      .eq("id", signUpData.user.id);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/");
  };

  return (
    <form
      onSubmit={handleSignup}
      className="space-y-4 bg-white p-6 rounded shadow max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold text-black">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        className="w-full"
      />
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
      >
        Create Account
      </button>
    </form>
  );
}
