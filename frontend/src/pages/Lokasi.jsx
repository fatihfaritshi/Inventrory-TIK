// frontend/pages/Lokasi.jsx
import React, { useEffect, useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  CubeIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

export default function Lokasi() {
  const [lokasis, setLokasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nama_lokasi: "",
    deskripsi: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLokasis();
  }, []);

  const fetchLokasis = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/lokasis")
      .then((res) => res.json())
      .then((result) => {
        setLokasis(result.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus lokasi ini?"))
      return;

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
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        const result = await res.json();

        if (!res.ok) {
          alert(result.message || "Gagal menyimpan data");
          return;
        }

        alert(result.message);
        setModalOpen(false);
        fetchLokasis();
      })
      .catch((err) => console.error(err));
  };

  // 🔍 FILTER SEARCH
  const filteredLokasis = lokasis.filter((lokasi) =>
    lokasi.nama_lokasi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL LOKASI */}
        <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Total Lokasi</p>
            <p className="text-4xl font-bold mt-2">{lokasis.length}</p>
          </div>
          <MapPinIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* LOKASI BERASET */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Lokasi Beraset</p>
            <p className="text-4xl font-bold mt-2">
              {lokasis.filter((l) => (l.asets_count ?? 0) > 0).length}
            </p>
          </div>
          <ArchiveBoxIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* TOTAL ASET */}
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Total Aset</p>
            <p className="text-4xl font-bold mt-2">
              {lokasis.reduce((total, l) => total + (l.asets_count ?? 0), 0)}
            </p>
          </div>
          <CubeIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* LOKASI KOSONG */}
        <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Lokasi Kosong</p>
            <p className="text-4xl font-bold mt-2">
              {lokasis.filter((l) => (l.asets_count ?? 0) === 0).length}
            </p>
          </div>
          <XCircleIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MapPinIcon className="w-7 h-7 text-blue-600" />
              Daftar Lokasi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola dan pantau lokasi penyimpanan aset
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-64"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700
                hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg shadow-lg 
                hover:shadow-xl transition-all duration-300 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Tambah Lokasi
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABEL ================= */}
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-blue-600 overflow-hidden">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading data lokasi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* TABLE HEAD */}
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Nama Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase">
                    Jumlah Aset
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-200">
                {filteredLokasis.map((lokasi) => (
                  <tr key={lokasi.id} className="hover:bg-gray-50 transition">
                    {/* NAMA LOKASI */}
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                      {lokasi.nama_lokasi}
                    </td>

                    {/* DESKRIPSI */}
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {lokasi.deskripsi || "-"}
                    </td>

                    {/* JUMLAH ASET */}
                    <td className="px-6 py-3 text-sm text-center font-semibold">
                      {lokasi.asets_count ?? 0}
                    </td>

                    {/* AKSI */}
                    <td className="px-6 py-3 text-sm flex justify-center gap-2">
                      {/* EDIT */}
                      <button
                        onClick={() => openEditModal(lokasi)}
                        className="p-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(lokasi.id)}
                        className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                        title="Hapus"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}
                {filteredLokasis.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <MapPinIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">
                        Belum ada data lokasi
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Tambahkan lokasi baru untuk memulai
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE FOOTER */}
        {filteredLokasis.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan{" "}
              <span className="font-semibold text-gray-900">
                {filteredLokasis.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-900">
                {lokasis.length}
              </span>{" "}
              lokasi
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL (Tidak Diubah) ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-[#0f172a]/70 backdrop-blur-xl border border-white/30 p-8 rounded-2xl shadow-2xl relative">
            {/* CLOSE */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-white transition-all duration-200 hover:bg-red-500/30 hover:text-red-300 active:scale-95"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* TITLE */}
            <h2 className="text-xl font-bold text-white mb-4">
              {isEdit ? "Edit Lokasi" : "Tambah Lokasi"}
            </h2>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAMA LOKASI */}
              <div>
                <label className="text-white/80 text-sm">Nama Lokasi</label>
                <input
                  type="text"
                  name="nama_lokasi"
                  value={formData.nama_lokasi}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="text-white/80 text-sm">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full py-2 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg transition"
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