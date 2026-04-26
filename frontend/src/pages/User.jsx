// frontend/pages/User.jsx
import React, { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  UsersIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import { useToast } from "../components/Toast";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { showToast, showConfirm } = useToast();
  const [filterRole, setFilterRole] = useState("Semua");

  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    username: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/users")
      .then((res) => res.json())
      .then((result) => {
        setUsers(result.data || result || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    showConfirm("Apakah Anda yakin ingin menghapus user ini?", () => {
      fetch(`http://127.0.0.1:8000/api/users/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((result) => {
          showToast(result.message, "success");
          fetchUsers();
        })
        .catch((err) => console.error(err));
    });
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setFormData({ id: null, nama: "", username: "", password: "", role: "" });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEdit(true);
    setFormData({ ...user, password: "" });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = isEdit
      ? `http://127.0.0.1:8000/api/users/${formData.id}`
      : "http://127.0.0.1:8000/api/users";

    const method = isEdit ? "PUT" : "POST";

    let payload = {
      nama: formData.nama,
      username: formData.username,
      role: formData.role,
    };

    if (!isEdit || formData.password) {
      payload.password = formData.password;
    }

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) {
          showToast(result.message || "Gagal menyimpan user", "error");
          console.error(result);
          return;
        }
        showToast(result.message, "success");
        setModalOpen(false);
        fetchUsers();
      })
      .catch((err) => console.error(err));
  };

  // 🔍 SEARCH FILTER
  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const matchSearch = user.nama.toLowerCase().includes(keyword) || user.username.toLowerCase().includes(keyword) || user.role.toLowerCase().includes(keyword);
    const matchRole = filterRole === "Semua" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  const inputClass = `
    w-full
    bg-white/5 text-white
    border border-white/20
    rounded-lg px-3 py-2
    backdrop-blur-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-400/50
    placeholder-white/40
    transition
  `;

  return (
    <div className="space-y-6">
      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TOTAL USER */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Total User</p>
            <p className="text-4xl font-bold mt-2">{users.length}</p>
          </div>
          <UserGroupIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* ADMINISTRATOR */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Administrator</p>
            <p className="text-4xl font-bold mt-2">
              {users.filter((u) => u.role === "Administrator").length}
            </p>
          </div>
          <ShieldCheckIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* PETUGAS */}
        <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Petugas</p>
            <p className="text-4xl font-bold mt-2">
              {users.filter((u) => u.role === "Petugas").length}
            </p>
          </div>
          <ClipboardDocumentListIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* PIMPINAN */}
        <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Pimpinan</p>
            <p className="text-4xl font-bold mt-2">
              {users.filter((u) => u.role === "Pimpinan").length}
            </p>
          </div>
          <BriefcaseIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UsersIcon className="w-7 h-7 text-blue-600" />
              Daftar User
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola dan pantau data user (pengguna)
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-64"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-800 
                hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg shadow-lg 
                hover:shadow-xl transition-all duration-300 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Tambah User
            </button>
          </div>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-800">Filter & Pencarian</h3>
          {filterRole !== "Semua" && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Filter Aktif</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Cari User</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Ketik nama, username..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Filter Role</label>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
              <option value="Semua">Semua Role</option>
              <option value="Administrator">Administrator</option>
              <option value="Petugas">Petugas</option>
              <option value="Pimpinan">Pimpinan</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setSearch(""); setFilterRole("Semua"); }} className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1">
              <XMarkIcon className="w-4 h-4" /> Reset Filter
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan <span className="font-bold text-gray-800">{filteredUsers.length}</span> dari <span className="font-bold">{users.length}</span> user
        </div>
      </div>

      {/* ================= TABEL ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-blue-600 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-600">
            Loading data user...
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {user.username}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {user.nama}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "Administrator"
                          ? "bg-purple-200 text-purple-800"
                          : user.role === "Petugas"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-lime-200 text-lime-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm flex justify-center gap-2">
                    {/* DETAIL */}
                    <button
                      onClick={() => { setSelectedUser(user); setDetailOpen(true); }}
                      className="p-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition"
                      title="Detail"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>

                    {/* EDIT */}
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                      title="Hapus"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Data user tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* TABLE FOOTER */}
        {filteredUsers.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan{" "}
              <span className="font-semibold text-gray-900">
                {filteredUsers.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-900">
                {users.length}
              </span>{" "}
              user
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL DETAIL ================= */}
      {detailOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] relative overflow-hidden">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl"></div>

            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-b border-white/10 px-8 py-5">
              <button
                onClick={() => setDetailOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-white/70 transition-all duration-200 hover:bg-red-500/30 hover:text-white active:scale-95"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/20">
                  <UsersIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Detail User</h2>
                  <p className="text-xs text-white/50 mt-0.5">{selectedUser.username}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5 relative">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-blue-500/50">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Nama</p>
                  <p className="text-white font-semibold text-sm mt-1">{selectedUser.nama}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-indigo-500/50">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Username</p>
                  <p className="text-white font-semibold text-sm mt-1">{selectedUser.username}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-purple-500/50">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Role</p>
                  <div className="mt-1.5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${selectedUser.role === "Administrator" ? "bg-purple-500/20 text-purple-400" : selectedUser.role === "Petugas" ? "bg-yellow-500/20 text-yellow-400" : "bg-lime-500/20 text-lime-400"}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-cyan-500/50">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Dibuat</p>
                  <p className="text-white font-semibold text-sm mt-1">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FORM ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-[#0f172a]/70 backdrop-blur-xl border border-white/30 p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-white transition-all duration-200 hover:bg-red-500/30 hover:text-red-300 active:scale-95"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              {isEdit ? "Edit User" : "Tambah User"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/80 text-sm">Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className={inputClass}
                  autoComplete="off"
                  required
                />
              </div>

              <div>
                <label className="text-white/80 text-sm">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClass}
                  autoComplete="new-username"
                  required
                />
              </div>

              <div>
                <label className="text-white/80 text-sm">
                  Password {isEdit && "(opsional)"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  autoComplete="new-password"
                  required={!isEdit}
                />
              </div>

              <div>
                <label className="text-white/80 text-sm">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">-- Pilih Role --</option>
                  <option className="text-black">Administrator</option>
                  <option className="text-black">Petugas</option>
                  <option className="text-black">Pimpinan</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg mt-4 transition"
              >
                {isEdit ? "Update User" : "Tambah User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}