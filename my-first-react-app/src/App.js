import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { ResultProvider } from "./ResultContext";
import "./App.css";
import Auth from "./Auth";
import CameraStress from "./CameraStress";
import TextDetection from "./TextDetection";
import ResultsPage from "./ResultsPage";
import axios from "axios";

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || "http://localhost:5000";

// ✅ Helper function to format name
function formatName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const Navbar = ({ onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const name = localStorage.getItem("name");
  const userId = localStorage.getItem("userId");
  const [image, setImage] = useState("/images/default-profile.png");

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_ORIGIN}/api/profile-image/${userId}`);
        if (!res.ok) throw new Error(`No image for user ${userId}`);
        const { imageUrl } = await res.json();
        setImage(`${API_ORIGIN}${imageUrl}`);
      } catch (e) {
        console.warn(e.message);
        setImage("/images/default-profile.png");
      }
    }
    fetchProfile();
  }, [userId]);

  const toggleProfile = () => setShowProfile(prev => !prev);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("profile", file);
    form.append("userId", userId);

    try {
      const { data } = await axios.post(`${API_ORIGIN}/api/upload-profile`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImage(`${API_ORIGIN}${data.imageUrl}`);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        Stress <span className="orange-text">Level Detection</span>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/camera-stress">Camera Stress</Link>
        </li>
        <li>
          <Link to="/text-detection">Text Detection</Link>
        </li>
        <li>
          <Link to="/results">Results</Link>
        </li>
        
      </ul>
      {name && (
        <div className="profile-wrapper">
          <button onClick={toggleProfile} className="profile-btn">
            <img src={image} alt="Profile" className="profile-icon" />
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-photo-preview">
                <img src={image} alt="Preview" className="profile-preview-img" />
              </div>
              <label htmlFor="upload-photo">Upload Photo:</label>
              <input
                id="upload-photo"
                type="file"
                onChange={handlePhotoUpload}
                accept="image/*"
              />
              <div>ID: user_{userId}</div>
              <div>Name: {formatName(name)}</div>
              <div>Email: {localStorage.getItem("email")}</div>
              <button onClick={onLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// ✅ Updated Home Component
const Home = () => {
  const name = localStorage.getItem("name");

  return (
    <div className="home-container">
      <div className="hero-section">
        <img src="/images/photo1.jpg" alt="Stress Detection" className="hero-image" />
        <div className="hero-overlay">
          <h1 className="hero-heading">Stress Level Detection</h1>
          {name && <h2 className="hero-welcome">Welcome, {formatName(name)}!</h2>}
          <p className="hero-description">
            Discover your emotional state through real-time stress level detection. Our smart system analyzes your facial expressions and mood indicators to help you stay mentally aware and healthier every day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("authToken"));

  const handleAuth = ({ token, userId, name, email }) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthed(false);
  };

  return (
    <ResultProvider>
      {/* Only render Navbar if the user is authenticated */}
      {authed && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/auth" element={!authed ? <Auth onAuth={handleAuth} /> : <Navigate to="/" />} />
        <Route path="/" element={authed ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/camera-stress" element={authed ? <CameraStress /> : <Navigate to="/auth" />} />
        <Route path="/text-detection" element={authed ? <TextDetection /> : <Navigate to="/auth" />} />
        <Route path="/results" element={authed ? <ResultsPage /> : <Navigate to="/auth" />} />
      </Routes>
    </ResultProvider>
  );
}
