// frontend/pages/User.jsx
import React, { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  UsersIcon,
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
    role: "Petugas",
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
    setFormData({ id: null, nama: "", username: "", password: "", role: "Petugas" });
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

  return (
    <div className="p-6 bg-gray-100 min-h-full space-y-6">
      {/* ================= STAT CARD ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL USER */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl shadow-lg p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total User</p>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <UsersIcon className="w-10 h-10 opacity-80" />
        </div>

        {/* ADMINISTRATOR */}
        <div className="bg-gradient-to-r from-lime-500 to-lime-700 rounded-2xl shadow-lg p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Administrator</p>
            <p className="text-3xl font-bold">
              {users.filter((u) => u.role === "Administrator").length}
            </p>
          </div>
          <UsersIcon className="w-10 h-10 opacity-80" />
        </div>

        {/* PETUGAS */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-2xl shadow-lg p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Petugas</p>
            <p className="text-3xl font-bold">
              {users.filter((u) => u.role === "Petugas").length}
            </p>
          </div>
          <UsersIcon className="w-10 h-10 opacity-80" />
        </div>

        {/* PIMPINAN */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl shadow-lg p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Pimpinan</p>
            <p className="text-3xl font-bold">
              {users.filter((u) => u.role === "Pimpinan").length}
            </p>
          </div>
          <UsersIcon className="w-10 h-10 opacity-80" />
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Daftar User</h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Cari username / role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
          />

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-600
              hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold rounded-lg shadow transition"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah User
          </button>
        </div>
      </div>

      {/* ================= TABEL ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-800 overflow-x-auto">
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
                    {user.role}
                  </td>
                  <td className="px-6 py-3 text-sm flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit User" : "Tambah User"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <div className="flex flex-col">
                  <label>Nama</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded"
                    required
                  />
                </div>

              <div className="flex flex-col">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label>Password {isEdit && "(kosongkan jika tidak diubah)"}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  required={!isEdit}
                />
              </div>

              <div className="flex flex-col">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Petugas">Petugas</option>
                  <option value="Pimpinan">Pimpinan</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-400 to-blue-600
                  hover:from-blue-500 hover:to-blue-700 text-white rounded-lg mt-3 transition"
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