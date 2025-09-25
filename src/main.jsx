import React from "react";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Landing from './Landing.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UsersList from "./pages/UsersList";
import ChangePassword from "./pages/ChangePassword";
import FaceAnalyzer from "./pages/FaceAnalyzer";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/users/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/face-analyzer" element={<FaceAnalyzer />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
