import { useEffect, useRef } from "react";

export default function FaceCanvas({ imageFile, faceBox }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!imageFile) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (faceBox) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        const { x, y, w, h } = faceBox;
        ctx.strokeRect(x, y, w, h);
      }
    };

    img.src = URL.createObjectURL(imageFile);

    return () => URL.revokeObjectURL(img.src);
  }, [imageFile, faceBox]);

  return <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />;
}
