// src/api/login.js
import { apiClient } from "./axiosApi";

export const loginUser = async (correo, contrasena) => {
  try {
    const response = await apiClient.post("/login", { correo, contrasena });
    localStorage.setItem("token", response.data.access_token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
