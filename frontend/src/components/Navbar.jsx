import { UserCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar({ user }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/aset": "Kelola Aset",
    "/user": "Kelola User",
    "/lokasi": "Kelola Lokasi",
    "/laporan": "Laporan",
    "/penilaian": "Penilaian Aset",
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className="
          fixed top-0 right-0 z-30
          w-[calc(100%-16rem)]
          h-20 px-8 flex items-center justify-between
          bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900
          border-b border-blue-400 shadow-lg
        "
      >
        {/* KIRI */}
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Sistem Inventaris Aset
          </h1>
          <p className="text-sm text-blue-200">
            {pageTitles[location.pathname] || ""}
          </p>
        </div>

        {/* KANAN */}
        <div
          onClick={() => setOpen(true)}
          className="
            cursor-pointer flex items-center gap-3
            px-4 py-2 rounded-xl
            bg-white/10 hover:bg-white/20
            border border-white/20
            transition
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

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password dan konfirmasi tidak sama");
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
        alert(result.message || "Gagal mengubah password");
        return;
      }

      alert("Password berhasil diubah");
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div
        className="
          relative w-full max-w-md p-8 rounded-2xl
          backdrop-blur-2xl
          border border-white/30
          shadow-[0_0_80px_rgba(59,130,246,0.25)]
          text-white
        "
      >
        {/* GLOW LAYER */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-700/30 via-transparent to-blue-500/10 pointer-events-none" />

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="
                absolute top-3 right-3
                p-2 rounded-full
                text-white
                transition-all duration-200
                hover:bg-red-500/30 hover:text-red-300
                active:scale-95
              "
        >
          <XMarkIcon className="w-5 h-5 text-white" />
        </button>

        {/* HEADER */}
        <div className="relative mb-6">
          <h2 className="text-xl font-bold text-white">
            Profil User
          </h2>
          <p className="text-sm text-white/70">
            Informasi akun & pengaturan password
          </p>
        </div>

        {/* DETAIL USER */}
        <div
          className="
            relative grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl
            bg-white/10 backdrop-blur-md
            border border-white/20
          "
        >
          <div>
            <p className="text-white/60 text-xs">Nama</p>
            <p className="font-semibold">{user.nama}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Username</p>
            <p className="font-semibold">{user.username}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Role</p>
            <p className="font-semibold">{user.role}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Dibuat</p>
            <p className="font-semibold">
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

        {/* FORM */}
        <form onSubmit={handleChangePassword} className="relative space-y-4">
          <div>
            <label className="text-sm text-white/80">
              Password Baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="
                w-full mt-1 px-3 py-2 rounded-lg
                bg-white/10 text-white placeholder-white/40
                border border-white/20
                backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-blue-400/60
              "
            />
          </div>

          <div>
            <label className="text-sm text-white/80">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="
                w-full mt-1 px-3 py-2 rounded-lg
                bg-white/10 text-white placeholder-white/40
                border border-white/20
                backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-blue-400/60
              "
            />
          </div>

          {/* ERROR */}
          {password &&
            confirmPassword &&
            password !== confirmPassword && (
              <p className="text-sm text-red-400">
                Password dan konfirmasi tidak sama
              </p>
            )}

          {/* ACTION */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 rounded-lg
                bg-white/10 hover:bg-white/40
                border border-white/20
                transition
              "
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || password !== confirmPassword}
              className="
                px-4 py-2 rounded-lg font-semibold
                bg-gradient-to-r from-blue-500 to-blue-700
              hover:from-yellow-500 hover:to-yellow-600
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg
              "
            >
              {loading ? "Menyimpan..." : "Ganti Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}