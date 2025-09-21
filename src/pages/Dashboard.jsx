// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { fetchDashboard } from "../api/dashboard";
import { logoutUser } from "../api/logout";
import Layout from "../components/layout/Layout";

const Dashboard = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDashboard();
        setMessage(data.message);
      } catch (error) {
        setMessage("No autorizado");
      }
    };
    getData();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      alert("Sesión cerrada");
      window.location.href = "/login";
    } catch (error) {
      alert("Error al cerrar sesión");
    }
  };

  return (
    <Layout title="Dashboard" onLogout={handleLogout} userName="Usuario">
      <section className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Bienvenido</h2>
        <p className="text-gray-700">{message}</p>
      </section>
    </Layout>
  );
};

export default Dashboard;
