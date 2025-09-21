// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import FaceAnalyzer from "./pages/FaceAnalyzer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UsersList from "./pages/UsersList"; // Añadimos la página de usuarios
import ChangePassword from "./pages/ChangePassword";  // Importamos ChangePassword

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<FaceAnalyzer />} /> */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users/dashboard" element={<Dashboard />} />
        <Route path="/users/list" element={<UsersList />} /> {/* Ruta para ver usuarios */}
        <Route path="/change-password" element={<ChangePassword />} />  {/* Ruta para cambiar contraseña */}
      </Routes>
    </Router>
  );
}

export default App;
