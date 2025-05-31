"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AvatarUploader from "@/components/AvatarUploader";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("No user returned");
      setLoading(false);
      return;
    }

    let avatarUrl = `https://api.dicebear.com/7.x/thumbs/png?seed=${displayName}`;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = urlData?.publicUrl || avatarUrl;
      }
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email,
      display_name: displayName,
      total_spent: 0,
      avatar_url: avatarUrl,
    });

    if (insertError) {
      alert(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/settings");
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <div className="mb-6">
        <AvatarUploader
          displayName={displayName || email}
          onImageCropped={setAvatarFile}
        />
      </div>

      <button
        onClick={handleSignup}
        disabled={loading}
        className="bg-white text-black px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition w-full"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </div>
  );
}
