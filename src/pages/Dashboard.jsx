// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchDashboard } from "../api/dashboard";
import { fetchMembresias } from "../api/membresia";
import { logoutUser } from "../api/logout";
import Layout from "../components/layout/Layout";
import '../style/Dashboard.css';
import StripeButton from '../components/StripeButton';

const Dashboard = () => {
  const [subscripcionActiva, setSubscripcionActiva] = useState(false);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membresias, setMembresias] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
    }
    const getData = async () => {
      try {
        const data = await fetchDashboard();
        setSubscripcionActiva(data.subscripcion);
        setPlan(data.plan);
        setUserEmail(data.email || localStorage.getItem("userEmail") || "");
        const membresiasData = await fetchMembresias();
        setMembresias(membresiasData);
      } catch (error) {
        setSubscripcionActiva(false);
        setPlan(null);
        setMembresias([]);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [location.search]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      alert("Sesión cerrada");
      window.location.href = "/login";
    } catch (error) {
      alert("Error al cerrar sesión");
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Cargando...</div>;
  }

  return (
    <Layout title="Dashboard" onLogout={handleLogout} userName="Usuario">
      <section className="bg-white rounded-xl shadow p-4 md:p-6">
        {showSuccess && (
          <div className="dashboard-success-message">
            <p className="text-green-700 font-semibold mb-4">¡Pago realizado con éxito! Tu suscripción está activa.</p>
          </div>
        )}
        <h2 className="text-xl md:text-2xl font-bold mb-2">Bienvenido</h2>
        {subscripcionActiva ? (
          <div>
            <p className="text-green-700 font-semibold mb-4">Subscripción activa: <span className="font-bold">{plan}</span></p>
            <div className="dashboard-features-grid">
              {/* Mockups visuales de funcionalidades */}
              <div className="feature-card">
                <h3>Generar Plano 3D</h3>
                <p>Convierte tu plano en un modelo 3D interactivo.</p>
                <button className="feature-btn">Ir a Generador</button>
              </div>
              <div className="feature-card">
                <h3>Analizador Facial</h3>
                <p>Accede a la herramienta de análisis facial avanzada.</p>
                <button className="feature-btn">Ir a Analizador</button>
              </div>
              <div className="feature-card">
                <h3>Descargas Ilimitadas</h3>
                <p>Descarga tus modelos y reportes sin límites.</p>
                <button className="feature-btn">Ver Descargas</button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-red-700 font-semibold mb-4">No tienes una subscripción activa.</p>
            <h3 className="text-lg font-bold mb-2">Elige un plan para activar tu subscripción:</h3>
            {Array.isArray(membresias) && membresias.length > 0 ? (
              <div className="dashboard-features-grid">
                {membresias.map((m) => (
                  <div className="feature-card" key={m.id}>
                    <h4>{m.nombre}</h4>
                    <p>{m.descripcion}</p>
                    <p>Precio: ${m.precio} / {m.duracion} días</p>
                    <StripeButton membresiaId={m.id} email={userEmail} nombre={m.nombre} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay membresías disponibles para adquirir.</p>
            )}
            {/* El botón de pago ahora está integrado en cada plan */}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Dashboard;
