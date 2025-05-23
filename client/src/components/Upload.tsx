import React, { useState, useEffect } from "react";

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
    <div style={{ padding: "2rem" }}>
      <h2>Upload your MP3</h2>
      <input
        type="file"
        accept="audio/mpeg"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload}>Upload</button>
      {audioUrl && (
        <div>
          <h3>Your uploaded audio:</h3>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
};

export default Upload;
