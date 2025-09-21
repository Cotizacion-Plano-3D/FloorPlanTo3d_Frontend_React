import { apiClient } from "./axiosApi";  // Suponiendo que tienes esta configuración

export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem("token");

  try {
    const response = await apiClient.post(
      "/change-password",
      { current_password: currentPassword, new_password: newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw error;
  }
};
