import { croppedAreaPixelsType } from "@/types";

export default function getCroppedImg(
  imageSrc: string,
  pixelCrop: croppedAreaPixelsType
) {
  console.log("Cropping image:", imageSrc, pixelCrop);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas context not available");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject("Canvas blob creation failed");
      }, "image/png");
    };
    image.onerror = () => reject("Image loading failed");
  });
}
