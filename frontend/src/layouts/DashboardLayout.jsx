import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  // Ambil user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Jika belum login, redirect ke halaman login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar - Fixed */}
      <Sidebar role={user.role} />

      {/* Area kanan - dengan margin left untuk sidebar */}
      <div className="flex-1 flex flex-col ml-64">

        {/* Navbar - Fixed */}
        <Navbar user={user} />

        {/* Konten halaman - dengan padding konsisten */}
        <main className="flex-1 mt-20 overflow-y-auto scrollbar-hide">
          {/* Container dengan max-width untuk konsistensi */}
          <div className="max-w-[1600px] mx-auto px-8 py-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}