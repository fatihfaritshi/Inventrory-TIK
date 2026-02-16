// frontend/pages/Asets.jsx
import React, { useEffect, useState } from "react";
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
  Squares2X2Icon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";

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
  const [lokasiList, setLokasiList] = useState([]);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAset, setSelectedAset] = useState(null);

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
    role: "Petugas",
  };

  useEffect(() => {
    fetchAsets();
    fetchLokasi();
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

  const fetchLokasi = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/lokasis");
      const json = await res.json();
      console.log("DATA LOKASI:", json.data);
      setLokasiList(json.data || []);
    } catch (err) {
      console.error("Gagal fetch lokasi:", err);
    }
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

  const openDetailModal = (aset) => {
    setSelectedAset(aset);
    setDetailOpen(true);
  };

  const openEditModal = (aset) => {
    setSelectedAset(aset);
    setIsEdit(true);
    setFormData({
      ...aset,
      foto_aset: null,
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
      if (formData[key] !== null && formData[key] !== "" && key !== "id") {
        form.append(key, formData[key]);
      }
    }

    const url = isEdit
      ? `http://127.0.0.1:8000/api/asets/${formData.id}`
      : "http://127.0.0.1:8000/api/asets";

    const method = isEdit ? "POST" : "POST";
    if (isEdit) form.append("_method", "PUT");

    fetch(url, {
      method,
      body: form,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.error("VALIDATION ERROR:", data);
          alert(
            data.message || Object.values(data.errors || {}).flat().join("\n")
          );
          return;
        }

        alert(data.message);
        setModalOpen(false);
        fetchAsets();
      })
      .catch((err) => console.error(err));
  };

  const filteredAsets = asets.filter((aset) => {
    const keyword = search.toLowerCase();

    return (
      aset.nama_aset?.toLowerCase().includes(keyword) ||
      aset.jenis_aset?.toLowerCase().includes(keyword) ||
      aset.detail_aset?.toLowerCase().includes(keyword) ||
      aset.kode_aset?.toLowerCase().includes(keyword) ||
      aset.lokasi?.nama_lokasi?.toLowerCase().includes(keyword)
    );
  });

  const inputGlass = `
  w-full mt-1 px-3 py-2 rounded-lg
  bg-white/10 text-white
  border border-white/20
  placeholder-white/40
  focus:outline-none focus:ring-2 focus:ring-blue-400
`;

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(angka);
  };

  return (
    <div className="space-y-6">
      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TOTAL ASET */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Total Aset</p>
            <p className="text-4xl font-bold mt-2">{asets.length}</p>
          </div>
          <ArchiveBoxIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* ASET AKTIF */}
        <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Aset Aktif</p>
            <p className="text-4xl font-bold mt-2">
              {asets.filter((a) => a.status === "Aktif").length}
            </p>
          </div>
          <CheckCircleIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* ASET NON-AKTIF */}
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Aset Non-Aktif</p>
            <p className="text-4xl font-bold mt-2">
              {asets.filter((a) => a.status === "Non-Aktif").length}
            </p>
          </div>
          <XCircleIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>

        {/* STATUS INVENTARIS INTRA */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">Aset INTRA</p>
            <p className="text-4xl font-bold mt-2">
              {asets.filter((a) => a.status_inventaris === "INTRA").length}
            </p>
          </div>
          <Squares2X2Icon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ArchiveBoxIcon className="w-7 h-7 text-blue-600" />
          Daftar Aset
        </h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Cari aset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
          />

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700
              hover:from-yellow-500 hover:to-yellow-600 font-semibold text-white rounded-lg shadow transition whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Aset
          </button>
        </div>
      </div>

      {/* ================= TABEL ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-900 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-600">
            Loading data aset...
          </div>
        ) : (
          <div className="relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Jenis
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Kondisi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Nilai
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Lokasi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Foto
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase">
                    Status Inventaris
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="sticky right-0 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAsets.map((aset) => (
                  <tr key={aset.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                      {aset.kode_aset}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {aset.nama_aset}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {aset.jenis_aset}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {aset.kondisi}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      Rp {formatRupiah(aset.nilai_aset)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {aset.lokasi?.nama_lokasi || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(aset.tanggal_masuk).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {aset.foto_aset ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${aset.foto_aset}`}
                          alt={aset.nama_aset}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          aset.status_inventaris === "INTRA"
                            ? "bg-purple-300 text-purple-900"
                            : "bg-orange-300 text-orange-900"
                        }`}
                      >
                        {aset.status_inventaris}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          aset.status.toLowerCase() === "aktif"
                            ? "bg-lime-300 text-lime-900"
                            : "bg-red-300 text-red-900"
                        }`}
                      >
                        {aset.status}
                      </span>
                    </td>
                    <td className="sticky right-0 bg-white px-4 py-3 text-sm shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                      <div className="flex gap-2 justify-center">
                        {/* DETAIL */}
                        <button
                          onClick={() => openDetailModal(aset)}
                          className="p-2 rounded-lg border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {/* EDIT */}
                        <button
                          onClick={() => openEditModal(aset)}
                          className="p-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(aset.id)}
                          className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                          title="Hapus"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAsets.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Belum ada data aset
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE FOOTER */}
        {filteredAsets.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan{" "}
              <span className="font-semibold text-gray-900">
                {filteredAsets.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-900">
                {asets.length}
              </span>{" "}
              aset
            </p>
          </div>
        )}

      </div>

      {/* ================= MODAL DETAIL ================= */}
      {detailOpen && selectedAset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setDetailOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-white transition-all duration-200 hover:bg-red-500/30 active:scale-95"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Detail Aset</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-white/90">
              {/* FOTO ASET */}
              <div className="flex items-stretch">
                {selectedAset.foto_aset ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${selectedAset.foto_aset}`}
                    alt="Foto Aset"
                    className="w-full h-full object-cover rounded-xl border border-white/20"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-xl">
                    Tidak ada foto
                  </div>
                )}
              </div>

              {/* DESKRIPSI KIRI */}
              <div className="space-y-3">
                <p>
                  <b>Kode Aset:</b>
                  <br />
                  {selectedAset.kode_aset}
                </p>
                <p>
                  <b>Nama Aset:</b>
                  <br />
                  {selectedAset.nama_aset}
                </p>
                <p>
                  <b>Jenis Aset:</b>
                  <br />
                  {selectedAset.jenis_aset}
                </p>
                <p>
                  <b>Kondisi:</b>
                  <br />
                  {selectedAset.kondisi}
                </p>
                <p>
                  <b>Nilai Aset:</b>
                  <br />
                  Rp {formatRupiah(selectedAset.nilai_aset)}
                </p>
              </div>

              {/* DESKRIPSI KANAN */}
              <div className="space-y-3">
                <p>
                  <b>Lokasi:</b>
                  <br />
                  {selectedAset.lokasi?.nama_lokasi || "-"}
                </p>
                <p>
                  <b>Status:</b>
                  <br />
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedAset.status === "Aktif"
                        ? "bg-lime-300 text-lime-900"
                        : "bg-red-300 text-red-900"
                    }`}
                  >
                    {selectedAset.status}
                  </span>
                </p>
                <p>
                  <b>Status Inventaris:</b>
                  <br />
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedAset.status_inventaris === "INTRA"
                        ? "bg-purple-300 text-purple-900"
                        : "bg-orange-300 text-orange-900"
                    }`}
                  >
                    {selectedAset.status_inventaris}
                  </span>
                </p>
                <p>
                  <b>Tanggal Masuk:</b>
                  <br />
                  {new Date(selectedAset.tanggal_masuk).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FORM ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-white transition-all duration-200 hover:bg-red-500/30 hover:text-red-300 active:scale-95"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              {isEdit ? "Edit Aset" : "Tambah Aset"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 scrollbar-hide"
            >
              {/* KODE ASET */}
              <div>
                <label className="text-white/80 text-sm">Kode Aset</label>
                <input
                  type="text"
                  name="kode_aset"
                  value={formData.kode_aset}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                />
              </div>

              {/* NAMA ASET */}
              <div>
                <label className="text-white/80 text-sm">Nama Aset</label>
                <input
                  type="text"
                  name="nama_aset"
                  value={formData.nama_aset}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                />
              </div>

              {/* JENIS ASET */}
              <div>
                <label className="text-white/80 text-sm">Jenis Aset</label>
                <input
                  type="text"
                  name="jenis_aset"
                  value={formData.jenis_aset}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                />
              </div>

              {/* KONDISI */}
              <div>
                <label className="text-white/80 text-sm">Kondisi</label>
                <select
                  name="kondisi"
                  value={formData.kondisi}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                >
                  <option className="text-black">Baik</option>
                  <option className="text-black">Rusak Ringan</option>
                  <option className="text-black">Rusak Berat</option>
                </select>
              </div>

              {/* NILAI ASET */}
              <div>
                <label className="text-white/80 text-sm">Nilai Aset</label>
                <input
                  type="number"
                  name="nilai_aset"
                  value={formData.nilai_aset}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                />
              </div>

              {/* LOKASI */}
              <div>
                <label className="text-white/80 text-sm">Lokasi</label>
                <select
                  name="lokasi_id"
                  value={formData.lokasi_id || ""}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                >
                  <option value="" className="text-black">
                    -- Pilih Lokasi --
                  </option>

                  {lokasiList.map((lokasi) => (
                    <option
                      key={lokasi.id}
                      value={lokasi.id}
                      className="text-black"
                    >
                      {lokasi.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>

              {/* RFID */}
              <div>
                <label className="text-white/80 text-sm">RFID Tag</label>
                <input
                  type="text"
                  name="rfid_tag"
                  value={formData.rfid_tag}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                />
              </div>

              {/* TANGGAL MASUK */}
              <div>
                <label className="text-white/80 text-sm">Tanggal Masuk</label>
                <input
                  type="date"
                  name="tanggal_masuk"
                  value={formData.tanggal_masuk}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="text-white/80 text-sm">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                >
                  <option className="text-black">Aktif</option>
                  <option className="text-black">Non-Aktif</option>
                </select>
              </div>

              {/* STATUS INVENTARIS */}
              <div>
                <label className="text-white/80 text-sm">
                  Status Inventaris
                </label>
                <select
                  name="status_inventaris"
                  value={formData.status_inventaris}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                >
                  <option className="text-black">INTRA</option>
                  <option className="text-black">EXTRA</option>
                </select>
              </div>

              {/* FOTO */}
              <div>
                <label className="text-white/80 text-sm">Foto Aset</label>
                <input
                  type="file"
                  name="foto_aset"
                  onChange={handleChange}
                  className="w-full mt-1 text-white file:bg-blue-600 file:text-white file:px-4 file:py-2 file:border-0 file:rounded-lg hover:file:bg-blue-700"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full py-2 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg transition"
              >
                {isEdit ? "Update Aset" : "Tambah Aset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}