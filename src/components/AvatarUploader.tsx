"use client";

import React, { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import getCroppedImg from "@/lib/cropImage";

interface AvatarUploaderProps {
  displayName: string;
  avatarUrl?: string;
  onImageCropped: (file: File) => void;
}

export default function AvatarUploader({
  displayName,
  avatarUrl,
  onImageCropped,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(avatarUrl || "");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const triggerFileSelect = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setImageSrc(reader.result as string);
    }
  };

  const onCropComplete = useCallback((_: any, cropped: any) => {
    setCroppedAreaPixels(cropped);
  }, []);

  const uploadCroppedAvatar = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);

    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);

    const file = new File([blob], `${uuidv4()}.png`, { type: "image/png" });

    // Preview the cropped image
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Pass cropped file to parent
    onImageCropped(file);

    setImageSrc(null);
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div onClick={triggerFileSelect} className="cursor-pointer">
        <Image
          src={
            previewUrl ||
            `https://api.dicebear.com/7.x/thumbs/png?seed=${displayName}`
          }
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full"
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
              onClick={uploadCroppedAvatar}
              className="bg-white text-black px-4 py-2 rounded"
            >
              {uploading ? "Saving..." : "Save"}
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
