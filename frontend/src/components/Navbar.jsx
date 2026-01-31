import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useLocation } from "react-router-dom";

export default function Navbar({ user }) {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/aset": "Data Aset",
    "/users": "Manajemen User",
    "/laporan": "Laporan",
  };

  return (
    <header
      className="
        h-20 px-8 flex items-center justify-between
        bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900
        backdrop-blur-xl
        border-b border-blue-400
        shadow-[0_10px_35px_rgba(30,64,175,0.35)]
      "
    >
      {/* Kiri */}
      <div>
        <h1
          className="
            text-2xl font-extrabold
            text-white tracking-wide
            drop-shadow-md
          "
        >
          Sistem Inventaris Aset
        </h1>
        <p className="text-sm text-blue-200 mt-0.5">
          {pageTitles[location.pathname] || ""}
        </p>
      </div>

      {/* Kanan */}
      <div
        className="
          flex items-center gap-3
          px-4 py-2 rounded-xl
          bg-white/10 backdrop-blur-md
          border border-white/20
          shadow-lg
        "
      >
        <UserCircleIcon className="w-10 h-10 text-white" />
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-white">
            {user.username}
          </p>
          <p className="text-xs text-blue-200">
            {user.role}
          </p>
        </div>
      </div>
    </header>
  );
}
