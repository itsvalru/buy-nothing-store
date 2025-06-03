"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import Image from "next/image";
import getCroppedImg from "@/lib/cropImage";

interface AvatarUploaderProps {
  displayName: string;
  initialAvatarUrl?: string; // for settings page
  onImageCropped: (file: File) => void;
}

export default function AvatarUploader({
  displayName,
  initialAvatarUrl,
  onImageCropped,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // ✅ Initialize avatar preview with cache-busting param
  useEffect(() => {
    if (initialAvatarUrl) {
      setPreviewUrl(`${initialAvatarUrl}?t=${Date.now()}`);
    } else {
      setPreviewUrl(
        `https://api.dicebear.com/7.x/thumbs/png?seed=${displayName}`
      );
    }
  }, [initialAvatarUrl, displayName]);

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

  const onCropComplete = useCallback((_: any, cropped: any) => {
    setCroppedAreaPixels(cropped);
  }, []);

  const applyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const file = new File([blob], "avatar.png", { type: "image/png" });

    // ✅ Show cropped preview (with cache-busting)
    const url = URL.createObjectURL(file);
    setPreviewUrl(`${url}?t=${Date.now()}`);

    // ✅ Pass file to parent for uploading
    onImageCropped(file);

    // ✅ Close cropper
    setImageSrc(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div onClick={triggerFileSelect} className="cursor-pointer">
        <Image
          src={previewUrl}
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

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
