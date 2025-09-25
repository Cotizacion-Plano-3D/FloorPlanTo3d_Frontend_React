import { apiClient } from "./axiosApi";

export const fetchMembresias = async () => {
  try {
    const response = await apiClient.get("/membresias");
    return response.data.membresias;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
