// frontend/pages/User.jsx
import React, { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  UsersIcon,
  UserGroupIcon,
  CommandLineIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");

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
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    fetch(`http://127.0.0.1:8000/api/users/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((result) => {
        alert(result.message);
        fetchUsers();
      })
      .catch((err) => console.error(err));
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
          alert(result.message || "Gagal menyimpan user");
          console.error(result);
          return;
        }
        alert(result.message);
        setModalOpen(false);
        fetchUsers();
      })
      .catch((err) => console.error(err));
  };

  // 🔍 SEARCH FILTER
  const filteredUsers = users.filter(
    (user) =>
      user.nama.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UsersIcon className="w-7 h-7 text-blue-600" />
          Daftar User
        </h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Cari username / role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              px-4 py-2
              border border-gray-600
              rounded-lg
              focus:outline-none
              focus:border-blue-600
              focus:ring-1 focus:ring-blue-600"
          />

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700
              hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg shadow transition whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah User
          </button>
        </div>
      </div>

      {/* ================= TABEL ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-900 overflow-x-auto">
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
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "Petugas"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm flex justify-center gap-2">
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
      </div>

      {/* ================= MODAL ================= */}
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
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg mt-4 transition"
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