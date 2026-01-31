// frontend/pages/Lokasi.jsx
import React, { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Lokasi() {
  const [lokasis, setLokasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_lokasi: "", deskripsi: "" });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchLokasis();
  }, []);

  const fetchLokasis = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/lokasis")
      .then((res) => res.json())
      .then((result) => {
        setLokasis(result || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) return;

    fetch(`http://127.0.0.1:8000/api/lokasis/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((result) => {
        alert(result.message);
        fetchLokasis();
      })
      .catch((err) => console.error(err));
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setFormData({ id: null, nama_lokasi: "", deskripsi: "" });
    setModalOpen(true);
  };

  const openEditModal = (lokasi) => {
    setIsEdit(true);
    setFormData({ ...lokasi });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = isEdit
      ? `http://127.0.0.1:8000/api/lokasis/${formData.id}`
      : "http://127.0.0.1:8000/api/lokasis";

    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((result) => {
        alert(result.message);
        setModalOpen(false);
        fetchLokasis();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Lokasi</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-600
              hover:from-yellow-500 hover:to-yellow-700 text-white rounded-lg shadow transition"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Lokasi
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading data lokasi...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nama Lokasi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Deskripsi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lokasis.map((lokasi) => (
                <tr key={lokasi.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm text-gray-700">{lokasi.nama_lokasi}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{lokasi.deskripsi || "-"}</td>
                  <td className="px-6 py-3 text-sm flex gap-2">
                    <button
                      onClick={() => openEditModal(lokasi)}
                      className="p-2 bg-yellow-400 text-white rounded hover:bg-yellow-300 transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lokasi.id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-400 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {lokasis.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data lokasi
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
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col">
                <label>Nama Lokasi</label>
                <input
                  type="text"
                  name="nama_lokasi"
                  value={formData.nama_lokasi}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label>Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-yellow-300 to-yellow-600
              hover:from-yellow-500 hover:to-yellow-700 text-white rounded-lg mt-3 transition"
              >
                {isEdit ? "Update Lokasi" : "Tambah Lokasi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}