import { useState } from "react";
import { changePassword } from "../api/changePassword";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const response = await changePassword(currentPassword, newPassword);
      setSuccessMessage(response.message);
      setTimeout(() => {
        navigate("/users/dashboard");  // Redirigir al dashboard o a la página que desees
      }, 2000);
    } catch (error) {
      setErrorMessage("Error al cambiar la contraseña. Intenta de nuevo.");
    }
  };

  return (
    <div>
      <h1>Cambiar Contraseña</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="currentPassword">Contraseña Actual:</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="newPassword">Nueva Contraseña:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button type="submit">Cambiar Contraseña</button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default ChangePassword;
