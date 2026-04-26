import { UserCircleIcon, XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useToast } from "./Toast";

export default function Navbar({ user, onToggleSidebar }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/aset": "Kelola Aset",
    "/user": "Kelola User",
    "/lokasi": "Kelola Lokasi",
    "/laporan": "Laporan",
    "/penilaian": "Penilaian Aset",
    "/pemeliharaan": "Pemeliharaan Aset",
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className="
          fixed top-0 right-0 z-30
          w-full md:w-[calc(100%-16rem)]
          h-16 md:h-20 px-4 md:px-8 flex items-center justify-between
          bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900
          border-b border-blue-400 shadow-lg
        "
      >
        {/* KIRI */}
        <div className="flex items-center gap-3">
          {/* Hamburger menu (mobile only) */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition md:hidden"
          >
            <Bars3Icon className="w-6 h-6 text-white" />
          </button>

          <div>
            <h1 className="text-lg md:text-2xl font-extrabold text-white">
              Sistem Manajemen Aset
            </h1>
            <p className="text-xs md:text-sm text-blue-200 hidden sm:block">
              {pageTitles[location.pathname] || ""}
            </p>
          </div>
        </div>

        {/* KANAN */}
        <div
          onClick={() => setOpen(true)}
          className="
            cursor-pointer flex items-center gap-2 md:gap-3
            px-3 md:px-4 py-1.5 md:py-2 rounded-xl
            bg-white/10 hover:bg-white/20
            border border-white/20
            transition
          "
        >
          <UserCircleIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {user.username}
            </p>
            <p className="text-xs text-blue-200">
              {user.role}
            </p>
          </div>
        </div>
      </header>

      {/* ================= MODAL ================= */}
      {open && (
        <UserProfileModal
          user={user}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* ================================================= */
/* ================= MODAL PROFIL ================== */
/* ================================================= */

function UserProfileModal({ user, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast("Password minimal 6 karakter", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Password dan konfirmasi tidak sama", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: user.nama,
            username: user.username,
            role: user.role,
            password: password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        showToast(result.message || "Gagal mengubah password", "error");
        return;
      }

      showToast("Password berhasil diubah", "success");
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      showToast("Terjadi kesalahan server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl"></div>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-b border-white/10 px-8 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 transition-all duration-200 hover:bg-red-500/30 hover:text-white active:scale-95"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/20">
              <UserCircleIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Profil User</h2>
              <p className="text-xs text-white/50 mt-0.5">Informasi akun & pengaturan password</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5 relative">
          {/* Detail User Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-blue-500/50">
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Nama</p>
              <p className="text-white font-semibold text-sm mt-1">{user.nama}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-indigo-500/50">
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Username</p>
              <p className="text-white font-semibold text-sm mt-1">{user.username}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-purple-500/50">
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Role</p>
              <p className="text-white font-semibold text-sm mt-1">{user.role}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-cyan-500/50">
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Dibuat</p>
              <p className="text-white font-semibold text-sm mt-1">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>

          {/* Form Ganti Password */}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Ganti Password</p>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Password Baru</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 rounded-lg bg-white/5 text-white placeholder-white/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-white/60 mb-1 block">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full px-3 py-2 rounded-lg bg-white/5 text-white placeholder-white/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition text-sm"
              />
            </div>

            {/* Error */}
            {password &&
              confirmPassword &&
              password !== confirmPassword && (
                <p className="text-sm text-red-400">
                  Password dan konfirmasi tidak sama
                </p>
              )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || password !== confirmPassword}
                className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-white text-sm transition"
              >
                {loading ? "Menyimpan..." : "Ganti Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}