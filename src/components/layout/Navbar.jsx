// src/components/layout/Navbar.jsx
export default function Navbar({ title = "Dashboard", onOpenSidebar, userName = "Usuario" }) {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Botón para abrir sidebar en móvil */}
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-gray-600">{userName}</span>
          <div className="size-8 rounded-full bg-gray-200" />
        </div>
      </div>
    </header>
  );
}
