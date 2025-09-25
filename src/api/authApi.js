import axios from "axios";
import { API_URL } from "./config";

// ---------------- LOGIN ----------------
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    // Guardar token
    localStorage.setItem("token", response.data.access_token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ---------------- REGISTER ----------------
export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, password });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ---------------- DASHBOARD ----------------
export const fetchDashboard = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token");

  try {
    const response = await axios.get(`${API_URL}/users/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
