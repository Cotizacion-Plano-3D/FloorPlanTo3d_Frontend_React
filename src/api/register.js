// src/api/register.js
import { apiClient } from "./axiosApi";

export const registerUser = async (username, password) => {
  try {
    const response = await apiClient.post("/register", { username, password });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
