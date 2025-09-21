// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";

const Brand = ({ compact = false }) => (
  <div className="p-4">
    <div className="text-2xl font-extrabold tracking-tight">Mi App</div>
    {!compact && (
      <div className="text-xs text-white/70 mt-1">Panel de administración</div>
    )}
  </div>
);

const Nav = ({ onClickItem }) => {
  const base =
    "block px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30";
  const inactive = "hover:bg-white/10";
  const active = "bg-white/15 bg-white/10";
  const cls = ({ isActive }) => `${base} ${isActive ? active : inactive}`;

  return (
    <nav className="flex-1 p-4 space-y-1 text-sm">
      <NavLink to="/users/dashboard" className={cls} onClick={onClickItem}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/users/list" className={cls} onClick={onClickItem}>
        👥 Usuarios
      </NavLink>
      <NavLink to="/change-password" className={cls} onClick={onClickItem}>
        🔒 Cambiar contraseña
      </NavLink>
      <NavLink to="/settings" className={cls} onClick={onClickItem}>
        ⚙️ Configuración
      </NavLink>
    </nav>
  );
};

export default function Sidebar({ open, onClose, onLogout }) {
  // Sidebar fijo (md+)
  const Desktop = () => (
    <aside className="hidden md:flex md:w-64 md:flex-col md:bg-gray-900 md:text-white md:shadow-xl">
      <Brand />
      <Nav onClickItem={() => {}} />
      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  // Sidebar off-canvas (móvil)
  const Mobile = () => (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú lateral"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white shadow-2xl transition-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Brand compact />
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
        <Nav onClickItem={onClose} />
        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <Desktop />
      <Mobile />
    </>
  );
}
