// frontend/pages/Asets.jsx
import React, { useEffect, useState } from "react";
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
  Squares2X2Icon,
  PencilIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import { useToast } from "../components/Toast";

export default function Asets() {
  const [asets, setAsets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, showConfirm } = useToast();
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

  // Filters
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKondisi, setFilterKondisi] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterInventaris, setFilterInventaris] = useState("Semua");
  const [filterLokasi, setFilterLokasi] = useState("Semua");
  const [filterTanggal, setFilterTanggal] = useState("");

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
    showConfirm("Apakah Anda yakin ingin menghapus aset ini?", () => {
      fetch(`http://127.0.0.1:8000/api/asets/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((result) => {
          showToast(result.message, "success");
          fetchAsets();
        })
        .catch((err) => console.error(err));
    });
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
          showToast(
            data.message || Object.values(data.errors || {}).flat().join("\n"),
            "error"
          );
          return;
        }

        showToast(data.message, "success");
        setModalOpen(false);
        fetchAsets();
      })
      .catch((err) => console.error(err));
  };

  const jenisOptions = [
    "Hardware", "Server & Storage", "Jaringan (Networking)", "Keamanan Jaringan",
    "Komunikasi & Telekomunikasi", "Output & Presentasi", "Multimedia & Surveillance",
    "Daya & Proteksi", "Pendingin & Infrastruktur", "Aksesoris & Peripheral",
    "Media Penyimpanan Portable", "Software", "Furniture & Mebel",
    "Instalasi & Kelistrikan", "Keamanan Fisik & Akses", "Peralatan Kantor",
    "Kendaraan Operasional", "Peralatan Lapangan & Operasional",
  ];

  const resetFilters = () => {
    setSearch(""); setFilterJenis("Semua"); setFilterKondisi("Semua");
    setFilterStatus("Semua"); setFilterInventaris("Semua");
    setFilterLokasi("Semua"); setFilterTanggal("");
  };

  const hasActiveFilter = filterJenis !== "Semua" || filterKondisi !== "Semua" || filterStatus !== "Semua" || filterInventaris !== "Semua" || filterLokasi !== "Semua" || filterTanggal !== "";

  const filteredAsets = asets.filter((aset) => {
    const keyword = search.toLowerCase();
    const matchSearch = aset.nama_aset?.toLowerCase().includes(keyword) || aset.jenis_aset?.toLowerCase().includes(keyword) || aset.detail_aset?.toLowerCase().includes(keyword) || aset.kode_aset?.toLowerCase().includes(keyword) || aset.lokasi?.nama_lokasi?.toLowerCase().includes(keyword);
    const matchJenis = filterJenis === "Semua" || aset.jenis_aset === filterJenis;
    const matchKondisi = filterKondisi === "Semua" || aset.kondisi === filterKondisi;
    const matchStatus = filterStatus === "Semua" || aset.status === filterStatus;
    const matchInventaris = filterInventaris === "Semua" || aset.status_inventaris === filterInventaris;
    const matchLokasi = filterLokasi === "Semua" || String(aset.lokasi_id) === filterLokasi;
    const matchTanggal = !filterTanggal || aset.tanggal_masuk?.startsWith(filterTanggal);
    return matchSearch && matchJenis && matchKondisi && matchStatus && matchInventaris && matchLokasi && matchTanggal;
  });

  const inputGlass = `
  w-full mt-1 px-3 py-2 rounded-lg
  bg-white/10 text-white
  border border-white/20
  placeholder-white/40
  focus:outline-none focus:ring-2 focus:ring-blue-400
`;

  const formatRupiah = (angka) => {
    if (!angka) return "";

    return new Intl.NumberFormat("id-ID").format(angka);
  };

  const handleRupiahChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    setFormData({
      ...formData,
      nilai_aset: value
    });
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
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ArchiveBoxIcon className="w-7 h-7 text-blue-600" />
              Daftar Aset
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola dan pantau data aset
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari aset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-64"
              />
            </div>

            {/* Add Button - Hidden for Petugas */}
            {user.role !== "Petugas" && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-800 
                  hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg shadow-lg 
                  hover:shadow-xl transition-all duration-300 whitespace-nowrap"
              >
                <PlusIcon className="w-5 h-5" />
                Tambah Aset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-800">Filter & Pencarian</h3>
          {hasActiveFilter && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Filter Aktif</span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Jenis Aset</label>
            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
              <option value="Semua">Semua Jenis</option>
              {jenisOptions.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Kondisi</label>
            <select value={filterKondisi} onChange={(e) => setFilterKondisi(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
              <option value="Semua">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Inventaris</label>
            <select value={filterInventaris} onChange={(e) => setFilterInventaris(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
              <option value="Semua">INTRA / EXTRA</option>
              <option value="INTRA">INTRA</option>
              <option value="EXTRA">EXTRA</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Lokasi</label>
            <select value={filterLokasi} onChange={(e) => setFilterLokasi(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
              <option value="Semua">Semua Lokasi</option>
              {lokasiList.map((lok) => <option key={lok.id} value={String(lok.id)}>{lok.nama_lokasi}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Tanggal Masuk</label>
            <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={resetFilters} className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1">
              <XMarkIcon className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan <span className="font-bold text-gray-800">{filteredAsets.length}</span> dari <span className="font-bold">{asets.length}</span> aset
        </div>
      </div>

      {/* ================= TABEL ================= */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-blue-600" style={{ overflow: "hidden", maxWidth: "100%" }}>
        {loading ? (
          <div className="text-center py-10 text-gray-600">
            Loading data aset...
          </div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", WebkitOverflowScrolling: "touch" }}>
            <table className="divide-y divide-gray-200" style={{ minWidth: "max-content", width: "100%" }}>
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Kode Aset
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Nama Aset
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Jenis
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Detail Aset
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Kondisi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Nilai Aset
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Lokasi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    RFID Tag
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Tanggal Masuk
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Foto
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Status Inventaris
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
                    Status
                  </th>
                  <th className="sticky right-0 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase whitespace-nowrap shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAsets.map((aset, index) => (
                  <tr key={aset.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-semibold whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono whitespace-nowrap">
                      {aset.kode_aset}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {aset.nama_aset}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {aset.jenis_aset}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {aset.detail_aset || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {aset.kondisi}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      Rp {formatRupiah(aset.nilai_aset)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {aset.lokasi?.nama_lokasi || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono whitespace-nowrap">
                      {aset.rfid_tag || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(aset.tanggal_masuk).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {aset.foto_aset ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${aset.foto_aset}`}
                          alt={aset.nama_aset}
                          className="w-16 h-16 object-cover rounded shadow-md border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded text-gray-400 text-xs">No Image</span>';
                          }}
                        />
                      ) : (
                        <span className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded text-gray-400 text-xs">No Image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${aset.status_inventaris === "INTRA"
                          ? "bg-purple-300 text-purple-900"
                          : "bg-orange-300 text-orange-900"
                          }`}
                      >
                        {aset.status_inventaris}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${aset.status.toLowerCase() === "aktif"
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
                          className="p-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {/* EDIT - Hidden for Petugas */}
                        {user.role !== "Petugas" && (
                          <button
                            onClick={() => openEditModal(aset)}
                            className="p-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}

                        {/* DELETE - Hidden for Petugas */}
                        {user.role !== "Petugas" && (
                          <button
                            onClick={() => handleDelete(aset.id)}
                            className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                            title="Hapus"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAsets.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={14}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] relative overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">
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
                  <ArchiveBoxIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Detail Aset</h2>
                  <p className="text-xs text-white/50 mt-0.5">{selectedAset.kode_aset}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5 relative">
              {/* Foto Aset */}
              <div className="flex justify-center">
                <div className="w-36 h-36 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  {selectedAset.foto_aset ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${selectedAset.foto_aset}`}
                      alt="Foto Aset"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/40 text-xs">Foto tidak tersedia</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">Tidak ada foto</div>
                  )}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Kode Aset", value: selectedAset.kode_aset, color: "blue" },
                  { label: "Nama Aset", value: selectedAset.nama_aset, color: "indigo" },
                  { label: "Jenis Aset", value: selectedAset.jenis_aset, color: "purple" },
                  { label: "Kondisi", value: selectedAset.kondisi, color: "lime" },
                  { label: "Nilai Aset", value: `Rp ${formatRupiah(selectedAset.nilai_aset)}`, color: "yellow" },
                  { label: "Lokasi", value: selectedAset.lokasi?.nama_lokasi || "-", color: "cyan" },
                  { label: "RFID Tag", value: selectedAset.rfid_tag || "-", color: "teal" },
                  { label: "Tanggal Masuk", value: new Date(selectedAset.tanggal_masuk).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), color: "orange" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-${item.color}-500/50`}
                  >
                    <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">{item.label}</p>
                    <p className="text-white font-semibold text-sm mt-1">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Detail Aset (full width) */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-violet-500/50">
                <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Detail Aset</p>
                <p className="text-white/90 text-sm mt-1 leading-relaxed">{selectedAset.detail_aset || "-"}</p>
              </div>

              {/* Status badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-lime-500/50">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Status</p>
                  <div className="mt-1.5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${selectedAset.status === "Aktif" ? "bg-lime-500/20 text-lime-400" : "bg-red-500/20 text-red-400"}`}>
                      {selectedAset.status}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-purple-500/50">
                  <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Status Inventaris</p>
                  <div className="mt-1.5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${selectedAset.status_inventaris === "INTRA" ? "bg-purple-500/20 text-purple-400" : "bg-orange-500/20 text-orange-400"}`}>
                      {selectedAset.status_inventaris}
                    </span>
                  </div>
                </div>
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
                <select
                  name="jenis_aset"
                  value={formData.jenis_aset}
                  onChange={handleChange}
                  required
                  className={inputGlass}
                >
                  <option value="" className="text-black">-- Pilih Jenis Aset --</option>
                  <option className="text-black">Hardware</option>
                  <option className="text-black">Server & Storage</option>
                  <option className="text-black">Jaringan (Networking)</option>
                  <option className="text-black">Keamanan Jaringan</option>
                  <option className="text-black">Komunikasi & Telekomunikasi</option>
                  <option className="text-black">Output & Presentasi</option>
                  <option className="text-black">Multimedia & Surveillance</option>
                  <option className="text-black">Daya & Proteksi</option>
                  <option className="text-black">Pendingin & Infrastruktur</option>
                  <option className="text-black">Aksesoris & Peripheral</option>
                  <option className="text-black">Media Penyimpanan Portable</option>
                  <option className="text-black">Software</option>
                  <option className="text-black">Furniture & Mebel</option>
                  <option className="text-black">Instalasi & Kelistrikan</option>
                  <option className="text-black">Keamanan Fisik & Akses</option>
                  <option className="text-black">Peralatan Kantor</option>
                  <option className="text-black">Kendaraan Operasional</option>
                  <option className="text-black">Peralatan Lapangan & Operasional</option>
                </select>
              </div>

              {/* DETAIL ASET */}
              <div>
                <label className="text-white/80 text-sm">Detail Aset (Merk / Spesifikasi)</label>
                <input
                  type="text"
                  name="detail_aset"
                  value={formData.detail_aset}
                  onChange={handleChange}
                  placeholder="Contoh: Dell Latitude 5520, Core i7"
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

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80">
                    Rp
                  </span>

                  <input
                    type="text"
                    name="nilai_aset"
                    value={formatRupiah(formData.nilai_aset)}
                    onChange={handleRupiahChange}
                    className={`${inputGlass} pl-10`}
                  />
                </div>
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
                className="w-full py-2 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-lg transition"
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