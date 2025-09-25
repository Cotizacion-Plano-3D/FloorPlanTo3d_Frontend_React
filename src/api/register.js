// src/api/register.js
import { apiClient } from "./axiosApi";

export const registerUser = async (correo, contrasena, nombre) => {
  try {
    const response = await apiClient.post("/register", { correo, contrasena, nombre });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
