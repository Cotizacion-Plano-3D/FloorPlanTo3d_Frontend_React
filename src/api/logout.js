import { apiClient } from "./axiosApi";

export const logoutUser = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await apiClient.post("/logout", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Eliminar el token del localStorage
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};
