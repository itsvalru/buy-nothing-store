"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AvatarUploader from "@/components/AvatarUploader";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log("Logged in user ID:", user?.id);
    });
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("id, display_name, avatar_url, email")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUser(data);
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    let finalAvatarUrl = avatarUrl;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists and stored in the same user folder
      if (avatarUrl?.includes(`/avatars/${user.id}/`)) {
        const pathParts = avatarUrl.split(`/avatars/`)[1];
        if (pathParts) {
          await supabase.storage.from("avatars").remove([pathParts]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return alert("Avatar upload failed: " + uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      finalAvatarUrl = urlData?.publicUrl || finalAvatarUrl;
      setAvatarUrl(finalAvatarUrl);
    }

    const { error } = await supabase
      .from("users")
      .update({ display_name: displayName, avatar_url: finalAvatarUrl })
      .eq("id", user.id);

    if (!error) alert("Settings saved!");
  };

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (!error) alert("Password reset email sent!");
  };

  if (loading) return <p className="text-center py-10">Loading settings...</p>;

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">
        ⚙️ Account Settings
      </h1>

      <div className="flex flex-col items-center gap-4 mb-6">
        <AvatarUploader
          displayName={displayName}
          avatarUrl={avatarUrl}
          onImageCropped={setAvatarFile}
        />
        <p className="text-sm text-gray-400 text-center">
          Click avatar to change
        </p>
      </div>

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
          value={user.email}
          disabled
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 opacity-60 cursor-not-allowed"
        />
      </div>

      <div className="mb-6">
        <button
          onClick={handleResetPassword}
          className="text-sm text-blue-400 hover:underline"
        >
          Reset password
        </button>
      </div>

      <button
        onClick={handleSave}
        className="bg-white text-black px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition w-full"
      >
        Save Changes
      </button>
    </div>
  );
}
