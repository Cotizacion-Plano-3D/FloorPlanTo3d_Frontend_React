import React from "react";
import { useNavigate } from "react-router-dom";
import './style/Landing.css';

const plans = [
  {
    name: "Plan Básico",
    features: [
      "1 usuario",
      "1 proyecto",
      "5 renders 2D a 3D"
    ]
  },
  {
    name: "Plan Estándar",
    features: [
      "1 usuario",
      "1 proyecto",
      "20 renders 2D a 3D",
      "Presupuestación automática"
    ]
  },
  {
    name: "Plan Ultra",
    features: [
      "1 usuario",
      "Proyectos ilimitados",
      "5 renders 3D",
      "Soporte técnico por chat IA"
    ]
  }
];

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>FloorPlanTo3D</h1>
        <p>
          Desarrolla tu proyecto arquitectónico desde planos 2D o bocetos y obtén modelos 3D visualizables, estimaciones de presupuesto y optimiza tu diseño y planificación.
        </p>
      </header>
      <section className="plans-section">
        <h2>Elige tu plan</h2>
        <div className="plans-list">
          {plans.map((plan, idx) => (
            <div key={idx} className="plan-card">
              <h3>{plan.name}</h3>
              <ul>
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <button onClick={() => navigate("/register")}>Registrarse</button>
            </div>
          ))}
        </div>
      </section>
      <footer className="landing-footer">
        <button className="login-btn" onClick={() => navigate("/login")}>Iniciar Sesión</button>
      </footer>
    </div>
  );
};

export default Landing;
