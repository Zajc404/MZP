import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Upload from "./components/Upload";

const App = () => (
  <Router>
    <TokenRefresher />
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/upload" element={<Upload />} />
    </Routes>
  </Router>
);

const TokenRefresher = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return;

      const res = await fetch("http://localhost:5000/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("accessToken", data.accessToken);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
      }
    }, 60 * 1000 * 10); // co 10 minut
    return () => clearInterval(interval);
  }, [navigate]);
  return null;
};

export default App;
