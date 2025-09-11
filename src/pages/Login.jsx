import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/login";
import '../style/Login.css';
// import Logo from '../assets/images.jpeg'; //arquitectura-3d-mmatt.webp
import Logo from '../assets/arquitectura-3d-mmatt.webp'; //

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(username, password);
      alert("Login exitoso");
      navigate("/users/dashboard");
    } catch (error) {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-left">
          <h1>Bienvenido !!!</h1>
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              className="input-field"
              placeholder="usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="forgot-password">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
            <button className="login-btn" type="submit">
              INGRESAR
            </button>
          </form>
          {/* <div className="social-login">
            <span>Ingresar con</span>
            <div className="social-icons">
              <button className="social-btn">G</button>
              <button className="social-btn">F</button>
              <button className="social-btn">GH</button>
            </div>
          </div> */}
          <div className="signup-footer">
            <span>¿No tienes cuenta? </span>
            <a href="/signup">Crear Cuenta</a>
          </div>
        </div>
        <div className="login-right">
          <img src={Logo} alt="Login Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
