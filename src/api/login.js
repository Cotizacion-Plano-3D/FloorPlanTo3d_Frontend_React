import { apiClient } from "./axiosApi";

export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post("/login", { username, password });
    localStorage.setItem("token", response.data.access_token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
