import React, { useState, useEffect } from "react";
import "./../App.css";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("http://localhost:5000/audio", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const blob = await res.blob();
        setAudioUrl(URL.createObjectURL(blob));
      }
    };
    fetchAudio();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("Upload successful");
      const blob = await fetch("http://localhost:5000/audio", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.blob());
      setAudioUrl(URL.createObjectURL(blob));
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className="container">
      <div className="left-image" />
      <div className="auth-wrapper">
        <div
          style={{
            position: "absolute",
            top: "7rem",
            textAlign: "center",
            width: "20%",
          }}
        >
          <h1 style={{ fontSize: "2rem", color: "#fff" }}>
            Mechatroniczny Projekt Zespołowy
          </h1>
        </div>
        <div className="auth-box">
          <h2 className="auth-title">Upload MP3</h2>
          <p className="auth-subtitle">Choose a file to upload.</p>

          <input
            className="auth-input"
            type="file"
            accept="audio/mpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#2a2a2d" }}
          />

          <button className="auth-button" onClick={handleUpload}>
            Upload
          </button>

          {audioUrl && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Your uploaded audio:</h3>
              <audio controls src={audioUrl} style={{ width: "100%" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
