// frontend/pages/User.jsx
import React, { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, username: "", password: "", role: "Petugas" });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/users")
      .then((res) => res.json())
      .then((result) => {
        setUsers(result || []); // pastikan sesuai response JSON
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
    setFormData({ id: null, username: "", password: "", role: "Petugas" });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEdit(true);
    setFormData({ ...user, password: "" }); // kosongkan password saat edit
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

    // Jangan kirim password kosong saat edit
    const payload = { ...formData };
    if (isEdit && !payload.password) delete payload.password;

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          console.error("Error:", data);
          alert("Gagal menyimpan user. Periksa console.");
          return;
        }
        alert(data.message);
        setModalOpen(false);
        fetchUsers();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar User</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-600
              hover:from-yellow-500 hover:to-yellow-700 text-white rounded-lg shadow transition"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah User
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading data user...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm text-gray-700">{user.username}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{user.role}</td>
                  <td className="px-6 py-3 text-sm flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 bg-yellow-400 text-white rounded hover:bg-yellow-300 transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-400 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit User" : "Tambah User"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
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
                <label>Password {isEdit && "(biarkan kosong jika tidak diubah)"}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  placeholder={isEdit ? "••••••" : ""}
                  required={!isEdit} // wajib saat create
                />
              </div>
              <div className="flex flex-col">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  required
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Petugas">Petugas</option>
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
