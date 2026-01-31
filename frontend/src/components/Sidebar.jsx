import { NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  UsersIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ role }) {
  const menus = {
    Administrator: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Data Aset", path: "/aset", icon: ArchiveBoxIcon },
      { name: "Manajemen User", path: "/users", icon: UsersIcon },
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
      <div className="relative mb-14 text-center">
        <h1 className="text-xl font-bold tracking-[0.3em] text-white">
          INVENTORY
        </h1>
        <p className="text-xs text-blue-400 mt-2 tracking-widest">
          ASSET MANAGEMENT
        </p>
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
                    ? "bg-blue-600/20 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.35)]"
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
      <div className="absolute bottom-6 left-0 w-full text-center text-xs text-white/40 tracking-wide">
        © 2026 Inventory System
      </div>
    </aside>
  );
}
