import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_: any, cropped: any) => {
    setCroppedAreaPixels(cropped);
  }, []);

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

    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const file = new File([blob], "avatar.png", { type: "image/png" });

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageSrc(null);
  };

  const handleSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const sessionUser = data.session?.user;
    if (!sessionUser) {
      alert("No session returned");
      setLoading(false);
      return;
    }

    let avatarUrl = `https://api.dicebear.com/7.x/thumbs/png?seed=${displayName}`;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${sessionUser.id}/avatar.${fileExt}`;
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

    const { error: insertError } = await supabase.from("users").insert({
      id: sessionUser.id,
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
    <div className="flex items-center justify-center px-4">
      <div className="bg-gray-900 text-white w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-extrabold text-center">Create Account</h1>

        <div className="flex flex-col items-center space-y-2">
          <div
            onClick={triggerFileSelect}
            className="cursor-pointer w-24 h-24 rounded-full overflow-hidden"
          >
            <Image
              src={
                previewUrl ||
                `https://api.dicebear.com/7.x/thumbs/png?seed=${
                  displayName || email
                }`
              }
              alt="Avatar"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </div>

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
