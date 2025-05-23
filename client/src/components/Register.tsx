import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert("Registration successful");
      navigate("/");
    } else {
      alert("Registration failed");
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
          <h2 className="auth-title">Register</h2>
          <p className="auth-subtitle">Create your new account.</p>
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
          <button className="auth-button" onClick={handleRegister}>
            Register
          </button>
          <p className="auth-footer">
            Already have an account? <a href="/">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
