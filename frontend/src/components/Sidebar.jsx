import { NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  UsersIcon,
  DocumentChartBarIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/solid";

export default function Sidebar({ role }) {
  const menus = {
    Administrator: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Kelola User", path: "/user", icon: UsersIcon },
      { name: "Kelola Lokasi", path: "/lokasi", icon: MapPinIcon },
      { name: "Kelola Aset", path: "/aset", icon: ArchiveBoxIcon },
      { name: "Penilaian Aset", path: "/penilaian", icon: ClipboardDocumentCheckIcon },
      { name: "Laporan", path: "/laporan", icon: DocumentChartBarIcon },
    ],
    Petugas: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Data Aset", path: "/aset", icon: ArchiveBoxIcon },
    ],
    Pimpinan: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Laporan", path: "/laporan", icon: DocumentChartBarIcon },
    ],
  };

  return (
    <aside
      className="
        relative w-64 min-h-screen px-6 py-8
        bg-gradient-to-b from-[#020617]/100 via-[#0f172a]/90 to-[#0f172a]
        backdrop-blur-2xl
        border-r border-white/30
        shadow-[0_0_60px_rgba(37,99,235,0.15)]
        text-white
      "
    >
      {/* Neon glow accent */}
      <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-800/70 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-800/50 rounded-full blur-[100px]" />

      {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
        <div className="relative mb-4">
            {/* Blur circle background */}
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-60 rounded-full"></div>

            {/* Icon container */}
            <div className="relative bg-blue-800 p-4 rounded-full shadow-lg">
            <ArchiveBoxIcon className="w-8 h-8 text-white" />
            </div>
        </div>

        {/* Teks kecil */}
        <p className="text-xs text-white tracking-widest">INVENTORY</p>
        <p className="text-xs text-blue-400 tracking-widest">TIK POLDA SUMBAR</p>
        </div>

      {/* Menu */}
      <nav className="relative space-y-2">
        {menus[role]?.map((menu) => {
          const Icon = menu.icon;
          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `
                group flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-600/40 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                    : "hover:bg-white/5"
                }
                `
              }
            >
              <Icon
                className="
                  w-5 h-5 text-blue-400
                  group-hover:text-blue-300 transition
                "
              />
              <span className="text-sm font-medium tracking-wide">
                {menu.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center text-xs text-white/40 tracking-wide gap-4">
        <button
          onClick={() => {
            // Hapus session/token dan redirect ke login
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="
            flex items-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/40
            text-red-400 hover:text-white rounded-xl transition
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"
            />
          </svg>
          Logout
        </button>
        <span>© Bidang TIK Polda Sumbar</span>
      </div>
    </aside>
  );
}
