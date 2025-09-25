import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/register";
import '../style/Register.css';

const Register = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();  // Inicializamos navigate para redirección

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
  const data = await registerUser(correo, contrasena, nombre);
      alert(data.message);
      // Redirigir automáticamente al Dashboard después del registro
      navigate("/users/dashboard");
    } catch (error) {
      alert("Error al registrar usuario");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>
        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-field">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              placeholder="ejemplo@email.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="register-field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="register-field">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              placeholder="Contraseña segura"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button className="register-btn" type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
