import { useState } from "react";
import {
  ArchiveBoxIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login gagal");
        return;
      }

      // Simpan user & token (sementara)
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Redirect sesuai role
      if (data.user.role === "Administrator") {
        window.location.href = "/dashboard";
      } else if (data.user.role === "Petugas") {
        window.location.href = "/dashboard";
      } else if (data.user.role === "Pimpinan") {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div
      className="
        relative min-h-screen flex items-center justify-center overflow-hidden px-4
        bg-gradient-to-br from-[#0f172a] via-[#1e208b] to-[#2643a3]
        font-['Poppins']
      "
    >
      {/* Background blur animation */}
      <div className="absolute top-[-120px] left-[-120px] w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-floatSlow" />
      <div className="absolute bottom-[-150px] right-[-150px] w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-floatFast" />

      {/* Glass Card */}
      <div
        className="
          relative z-10 w-full max-w-md
          bg-white/20 backdrop-blur-xl
          border border-white/40
          p-10 rounded-2xl
          shadow-[0_25px_60px_rgba(0,0,0,0.35)]
        "
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-60 rounded-full"></div>
            <div className="relative bg-blue-950 p-4 rounded-full shadow-lg">
              <ArchiveBoxIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white">
            Sistem Inventaris Aset
          </h2>
          <p className="text-sm text-blue-100/70 mt-1">
            Bidang TIK Polda Sumbar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm text-blue-100 mb-1">
              Username
            </label>

            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                  w-full pl-11 pr-4 py-2.5 rounded-lg
                  bg-white/90 text-gray-800
                  border border-white/40
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-blue-100 mb-1">
              Password
            </label>

            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full pl-11 pr-4 py-2.5 rounded-lg
                  bg-white/90 text-gray-800
                  border border-white/40
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                "
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="
              w-full py-2.5 mt-4 rounded-lg font-semibold text-gray-900
              bg-gradient-to-r from-yellow-300 to-yellow-600
              hover:from-yellow-400 hover:to-yellow-500
              transition duration-200 shadow-md
            "
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-blue-100/60 mt-6">
          © 2026 Kepolisian Daerah Sumatera Barat
        </p>
      </div>
    </div>
  );
}
