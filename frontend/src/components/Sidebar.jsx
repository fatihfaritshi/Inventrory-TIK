import { NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  UsersIcon,
  DocumentChartBarIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  SignalIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/solid";

export default function Sidebar({ role, isOpen, onClose }) {
  const menus = {
    Administrator: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Kelola User", path: "/user", icon: UsersIcon },
      { name: "Kelola Lokasi", path: "/lokasi", icon: MapPinIcon },
      { name: "Kelola Aset", path: "/aset", icon: ArchiveBoxIcon },
      { name: "Scan RFID", path: "/riwayat-scan", icon: SignalIcon },
      { name: "Penilaian Aset", path: "/penilaian", icon: ClipboardDocumentCheckIcon },
      { name: "Pemeliharaan", path: "/pemeliharaan", icon: WrenchScrewdriverIcon },
      { name: "Laporan", path: "/laporan", icon: DocumentChartBarIcon },
    ],
    Petugas: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Data Aset", path: "/aset", icon: ArchiveBoxIcon },
      { name: "Scan RFID", path: "/riwayat-scan", icon: SignalIcon },
      { name: "Penilaian Aset", path: "/penilaian", icon: ClipboardDocumentCheckIcon },
    ],
    Pimpinan: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Pemeliharaan", path: "/pemeliharaan", icon: WrenchScrewdriverIcon },
      { name: "Laporan", path: "/laporan", icon: DocumentChartBarIcon },
    ],
  };

  return (
    <>
      {/* ==================== OVERLAY (mobile only) ==================== */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          w-64 h-screen
          bg-gradient-to-b from-[#020617]/100 via-[#0f172a]/90 to-[#0f172a]
          backdrop-blur-2xl
          border-r border-white/30
          shadow-[0_0_60px_rgba(37,99,235,0.15)]
          text-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Neon glow accent */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-800/70 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-800/50 rounded-full blur-[100px] pointer-events-none" />

        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition md:hidden z-10"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>

        {/* ==================== SCROLLABLE CONTENT AREA ==================== */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-8">
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
                  onClick={onClose}
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
        </div>

        {/* ==================== FOOTER (STICKY BOTTOM) ==================== */}
        <div className="px-6 py-6 flex flex-col items-center gap-3 border-t border-white/10">
          
          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="
              group relative w-full flex items-center justify-center gap-2.5
              px-4 py-2.5 rounded-xl overflow-hidden
              border border-red-500/50 bg-red-500/[0.2]
              text-red-300 text-sm font-medium tracking-wide
              transition-all duration-250
              hover:bg-red-500/[0.34] hover:border-red-500/60 hover:text-white hover:-translate-y-px
              active:scale-[0.97]
            "
          >
            {/* Radial glow on hover */}
            <span className="
              absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
              transition-opacity duration-300
              bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.2),transparent_70%)]
              pointer-events-none
            " />

            {/* Icon box */}
            <span className="
              relative flex items-center justify-center
              w-7 h-7 rounded-lg
              border border-red-500/50 bg-red-500/30
              group-hover:bg-red-500/25 group-hover:border-red-500/50
              transition-all duration-250
            ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>

            <span className="relative">Logout</span>

            {/* Arrow */}
            <svg
              className="relative w-3.5 h-3.5 transition-transform duration-250 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <span className="text-[12px] text-white/25 tracking-wide">
            © Bidang TIK Polda Sumbar
          </span>
        </div>
      </aside>
    </>
  );
}