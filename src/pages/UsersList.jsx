// src/pages/UsersList.jsx
import { useEffect, useState } from "react";
import { fetchUsers } from "../api/users";
import { logoutUser } from "../api/logout";
import Layout from "../components/layout/Layout";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (err) {
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      alert("Sesión cerrada");
      window.location.href = "/login";
    } catch {
      alert("Error al cerrar sesión");
    }
  };

  return (
    <Layout title="Usuarios" onLogout={handleLogout} userName="Usuario">
      <section className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Usuarios registrados</h2>

        {loading && <p className="text-gray-600">Cargando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {users.length === 0 ? (
              <p className="text-gray-600">No hay usuarios registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-b-0">
                        <td className="py-2 pr-4">{u.id}</td>
                        <td className="py-2 pr-4">{u.username}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

export default UsersList;
