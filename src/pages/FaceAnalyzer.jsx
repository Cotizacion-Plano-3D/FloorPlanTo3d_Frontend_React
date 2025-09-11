import { useState } from "react";
import axios from "axios";
import FaceCanvas from "../components/FaceCanvas";

export default function FaceAnalyzer() {
  const [file, setFile] = useState(null);
  const [faceBox, setFaceBox] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFaceBox(null);
  };

  const handleSubmit = async () => {
    if (!file) return alert("Selecciona una imagen primero");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // backend debe devolver algo como: { x:0, y:0, w:100, h:100 }
      setFaceBox(response.data.faceBox);

    } catch (error) {
      console.error(error);
      alert("Error al analizar la imagen");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reconocimiento Facial</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={loading} style={{ marginLeft: "10px" }}>
        {loading ? "Analizando..." : "Analizar"}
      </button>

      {file && <FaceCanvas imageFile={file} faceBox={faceBox} />}
    </div>
  );
}
