// frontend/pages/Asets.jsx
import React, { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Asets() {
  const [asets, setAsets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kode_aset: "",
    nama_aset: "",
    jenis_aset: "",
    detail_aset: "",
    kondisi: "Baik",
    nilai_aset: "",
    lokasi_id: "",
    rfid_tag: "",
    tanggal_masuk: "",
    status: "Aktif",
    status_inventaris: "INTRA",
    foto_aset: null,
  });
  const [isEdit, setIsEdit] = useState(false);

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user")) || { username: "Guest", role: "Petugas" };

  useEffect(() => {
    fetchAsets();
  }, []);

  const fetchAsets = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/asets")
      .then((res) => res.json())
      .then((result) => {
        setAsets(result.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus aset ini?")) return;

    fetch(`http://127.0.0.1:8000/api/asets/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((result) => {
        alert(result.message);
        fetchAsets();
      })
      .catch((err) => console.error(err));
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setFormData({
      id: null,
      kode_aset: "",
      nama_aset: "",
      jenis_aset: "",
      detail_aset: "",
      kondisi: "Baik",
      nilai_aset: "",
      lokasi_id: "",
      rfid_tag: "",
      tanggal_masuk: "",
      status: "Aktif",
      status_inventaris: "INTRA",
      foto_aset: null,
    });
    setModalOpen(true);
  };

  const openEditModal = (aset) => {
    setIsEdit(true);
    setFormData({
      ...aset,
      foto_aset: null, // foto baru jika diupload
      lokasi_id: aset.lokasi_id || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) form.append(key, formData[key]);
    }

    const url = isEdit
      ? `http://127.0.0.1:8000/api/asets/${formData.id}`
      : "http://127.0.0.1:8000/api/asets";

    const method = isEdit ? "POST" : "POST"; // Laravel PUT bisa diganti via FormData
    if (isEdit) form.append("_method", "PUT"); // Laravel method spoofing

    fetch(url, {
      method: method,
      body: form,
    })
      .then((res) => res.json())
      .then((result) => {
        alert(result.message);
        setModalOpen(false);
        fetchAsets();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Aset</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-600
              hover:from-yellow-500 hover:to-yellow-700 font-semibold text-white rounded-lg shadow hover:bg-blue-500 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Aset
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading data aset...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Kode</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Jenis</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Kondisi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nilai</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Lokasi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Foto</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase">Status Inventaris</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {asets.map((aset) => (
                <tr key={aset.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm text-gray-700">{aset.kode_aset}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{aset.nama_aset}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{aset.jenis_aset}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{aset.kondisi}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">Rp {aset.nilai_aset.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{aset.lokasi?.nama_lokasi || "-"}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{new Date(aset.tanggal_masuk).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {aset.foto_aset ? (
                      <img src={`http://127.0.0.1:8000/storage/${aset.foto_aset}`} alt={aset.nama_aset} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <span className="text-gray-400">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{aset.status_inventaris}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      aset.status.toLowerCase() === "aktif"
                        ? "bg-lime-300 text-lime-900"
                        : "bg-red-300 text-red-900"
                    }`}>
                      {aset.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm flex gap-2">
                    <button
                      onClick={() => openEditModal(aset)}
                      className="p-2 bg-yellow-400 text-white rounded hover:bg-yellow-300 transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(aset.id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-400 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
          
              ))}
              {asets.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data aset
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 p-2 hover:bg-gray-200 rounded-full">
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Aset" : "Tambah Aset"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col">
                <label>Kode Aset</label>
                <input type="text" name="kode_aset" value={formData.kode_aset} onChange={handleChange} className="border px-3 py-2 rounded" required />
              </div>
              <div className="flex flex-col">
                <label>Nama Aset</label>
                <input type="text" name="nama_aset" value={formData.nama_aset} onChange={handleChange} className="border px-3 py-2 rounded" required />
              </div>
              <div className="flex flex-col">
                <label>Jenis Aset</label>
                <input type="text" name="jenis_aset" value={formData.jenis_aset} onChange={handleChange} className="border px-3 py-2 rounded" required />
              </div>
              <div className="flex flex-col">
                <label>Kondisi</label>
                <select name="kondisi" value={formData.kondisi} onChange={handleChange} className="border px-3 py-2 rounded" required>
                  <option>Baik</option>
                  <option>Rusak Ringan</option>
                  <option>Rusak Berat</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label>Nilai Aset</label>
                <input type="number" name="nilai_aset" value={formData.nilai_aset} onChange={handleChange} className="border px-3 py-2 rounded" required />
              </div>
              <div className="flex flex-col">
                <label>Lokasi ID</label>
                <input type="number" name="lokasi_id" value={formData.lokasi_id} onChange={handleChange} className="border px-3 py-2 rounded" required />
              </div>
              <div className="flex flex-col">
                <label>RFID Tag</label>
                <input type="text" name="rfid_tag" value={formData.rfid_tag} onChange={handleChange} className="border px-3 py-2 rounded" required />
              </div>
              <div className="flex flex-col">
                <label>Tanggal Masuk</label>
                <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleChange} className="border px-3 py-2 rounded" required />
              </div>
              <div className="flex flex-col">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="border px-3 py-2 rounded" required>
                  <option>Aktif</option>
                  <option>Non-Aktif</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label>Status Inventaris</label>
                <select name="status_inventaris" value={formData.status_inventaris} onChange={handleChange} className="border px-3 py-2 rounded" required>
                  <option>INTRA</option>
                  <option>EXTRA</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label>Foto Aset</label>
                <input type="file" name="foto_aset" onChange={handleChange} className="border px-3 py-2 rounded" />
              </div>
              <button type="submit" className="w-full py-2 bg-gradient-to-r from-yellow-300 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-lg mt-3 transition">
                {isEdit ? "Update Aset" : "Tambah Aset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
