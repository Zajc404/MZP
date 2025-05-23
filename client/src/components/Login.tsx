import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/upload");
    } else {
      alert("Login failed");
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
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Welcome back. Please log in.</p>
          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="auth-button" onClick={handleLogin}>
            Log In
          </button>
          <p className="auth-footer">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
