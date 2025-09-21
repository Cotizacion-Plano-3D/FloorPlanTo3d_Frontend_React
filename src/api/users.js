import { apiClient } from "./axiosApi";

export const fetchUsers = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token");

  try {
    const response = await apiClient.get("/users", {
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
