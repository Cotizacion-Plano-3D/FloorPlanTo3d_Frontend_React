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
      // Adaptar los datos al nuevo modelo Usuario
      return {
        usuarios: response.data.users.map(u => ({
          id: u.id,
          correo: u.correo,
          nombre: u.nombre,
          fecha_creacion: u.fecha_creacion
        }))
      };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
