// src/components/layout/Layout.jsx
import { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, title, onLogout, userName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar con ESC
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setSidebarOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-dvh flex bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={title}
          onOpenSidebar={() => setSidebarOpen(true)}
          userName={userName}
        />
        <main className="p-4 md:p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
