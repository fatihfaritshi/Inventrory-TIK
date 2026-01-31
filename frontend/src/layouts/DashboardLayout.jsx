import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  // Ambil user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Jika belum login, tendang ke login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar role={user.role} />

      {/* Area kanan */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <Navbar user={user} />

        {/* Konten halaman */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
