import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "./config";

const FaceAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return alert("Selecciona una imagen primero");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
  const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
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

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Resultados:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FaceAnalyzer;
