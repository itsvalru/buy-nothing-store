"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Sign up failed");
      setLoading(false);
      return;
    }

    let avatar_url = null;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

      if (!uploadError) {
        const publicUrlResponse = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        console.log("Public URL Response:", publicUrlResponse);

        avatar_url = publicUrlResponse.data.publicUrl;
      }
    }

    const insertRes = await supabase.from("users").insert([
      {
        id: data.user.id,
        email: data.user.email,
        display_name: displayName,
        avatar_url,
      },
    ]);

    if (insertRes.error) {
      console.error("User insert failed:", insertRes.error.message);
    }

    router.refresh();
    router.push("/");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="flex justify-center">
        <label htmlFor="avatar">
          <img
            src={
              avatarFile
                ? URL.createObjectURL(avatarFile)
                : "https://api.dicebear.com/7.x/thumbs/svg?seed=default"
            }
            alt="Avatar Preview"
            className="w-20 h-20 rounded-full cursor-pointer object-cover"
          />
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setAvatarFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </label>
      </div>

      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
