"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { croppedAreaPixelsType } from "@/types";

export default function SettingsPage() {
  const user = useUser();
  const router = useRouter();
  console.log("User:", user);
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<croppedAreaPixelsType | null>(null);

  const onCropComplete = useCallback(
    (_: croppedAreaPixelsType, cropped: croppedAreaPixelsType) => {
      setCroppedAreaPixels(cropped);
    },
    []
  );

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else {
      setDisplayName(user.display_name || "");
      setPreviewUrl(
        user.avatar_url ||
          `https://api.dicebear.com/7.x/thumbs/png?seed=${user.email}`
      );
    }
  }, [router, user]);

  const triggerFileSelect = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
    }
  };

  const applyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const blob = (await getCroppedImg(imageSrc, croppedAreaPixels)) as Blob;
    const file = new File([blob], "avatar.png", { type: "image/png" });
    setAvatarFile(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result) setPreviewUrl(result);
    };

    setImageSrc(null);
  };

  const handleSave = async () => {
    setLoading(true);

    let avatarUrl = user?.avatar_url;

    if (avatarFile) {
      const filePath = `${user?.id}/avatar-${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = urlData?.publicUrl || avatarUrl;
      }
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        avatar_url: avatarUrl,
      })
      .eq("id", user?.id);

    if (updateError) {
      alert(updateError.message);
      setLoading(false);
      return;
    }

    alert("Profile updated!");
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        ⚙️ Account Settings
      </h1>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div onClick={triggerFileSelect} className="cursor-pointer">
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Avatar"
              width={100}
              height={100}
              className="rounded-full border border-gray-700 shadow-lg"
            />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Email</label>
        <p className="bg-gray-800 text-white p-2 rounded border border-gray-600">
          {user.email}
        </p>
      </div>

      <p className="text-sm text-gray-400 underline cursor-not-allowed mb-8 text-center">
        Reset Password (coming soon)
      </p>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-white text-black px-6 py-3 font-bold rounded-xl hover:bg-gray-200 transition w-full"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
          <div className="relative w-80 h-80 bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={applyCrop}
              className="bg-white text-black px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setImageSrc(null)}
              className="text-white underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
