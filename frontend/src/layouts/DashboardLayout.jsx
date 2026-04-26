import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  // Ambil user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Sidebar toggle state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Jika belum login, redirect ke halaman login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Area kanan - margin left hanya di desktop */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        {/* Navbar */}
        <Navbar
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Konten halaman - padding responsif */}
        <main className="flex-1 mt-16 md:mt-20 overflow-y-auto scrollbar-hide min-w-0">
          {/* Container dengan max-width untuk konsistensi */}
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}