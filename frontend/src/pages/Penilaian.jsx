// frontend/pages/Penilaian.jsx
import React, { useEffect, useState } from "react";
import {
    ClipboardDocumentCheckIcon,
    PlusIcon,
    XMarkIcon,
    EyeIcon,
    TrashIcon,
    ChartBarIcon,
    ArchiveBoxIcon,
    CheckCircleIcon,
    FunnelIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/solid";

export default function Penilaian() {
    const [penilaians, setPenilaians] = useState([]);
    const [asets, setAsets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedPenilaian, setSelectedPenilaian] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Filter states
    const [search, setSearch] = useState("");
    const [filterPrioritas, setFilterPrioritas] = useState("Semua");
    const [filterTanggal, setFilterTanggal] = useState("");

    const [formData, setFormData] = useState({
        aset_id: "",
        frekuensi_penggunaan: "",
        usia_pemakaian_aset: "",
        kondisi_penilaian: "",
        nilai_ekonomis: "",
        biaya_pemeliharaan: "",
        tingkat_urgensi: "",
    });

    // Ambil data user dari localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {
        id: 1,
        username: "Guest",
        role: "Administrator",
    };

    // Enum options
    const enumOptions = {
        frekuensi_penggunaan: [
            "Sangat Sering",
            "Sering",
            "Kadang",
            "Jarang",
            "Sangat Jarang",
        ],
        usia_pemakaian_aset: [
            "Baru",
            "Relatif Baru",
            "Sedang",
            "Lama",
            "Sangat Lama",
        ],
        kondisi_penilaian: [
            "Sangat Baik",
            "Baik",
            "Cukup",
            "Buruk",
            "Sangat Buruk",
        ],
        nilai_ekonomis: [
            "Sangat Tinggi",
            "Tinggi",
            "Sedang",
            "Rendah",
            "Sangat Rendah",
        ],
        biaya_pemeliharaan: [
            "Sangat Rendah",
            "Rendah",
            "Sedang",
            "Tinggi",
            "Sangat Tinggi",
        ],
        tingkat_urgensi: [
            "Sangat Urgen",
            "Urgen",
            "Sedang",
            "Rendah",
            "Tidak Urgen",
        ],
    };

    useEffect(() => {
        fetchPenilaians();
        fetchAsets();
    }, []);

    const fetchPenilaians = () => {
        setLoading(true);
        fetch("http://127.0.0.1:8000/api/penilaians")
            .then((res) => res.json())
            .then((result) => {
                setPenilaians(result.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setLoading(false);
            });
    };

    const fetchAsets = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/asets");
            const json = await res.json();
            setAsets(json.data || []);
        } catch (err) {
            console.error("Gagal fetch aset:", err);
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus penilaian ini?"))
            return;

        fetch(`http://127.0.0.1:8000/api/penilaians/${id}`, { method: "DELETE" })
            .then((res) => res.json())
            .then((result) => {
                alert(result.message);
                fetchPenilaians();
            })
            .catch((err) => console.error(err));
    };

    const openDetailModal = (penilaian) => {
        setSelectedPenilaian(penilaian);
        setDetailOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setFormData({
            aset_id: "",
            frekuensi_penggunaan: "",
            usia_pemakaian_aset: "",
            kondisi_penilaian: "",
            nilai_ekonomis: "",
            biaya_pemeliharaan: "",
            tingkat_urgensi: "",
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            user_id: user.id,
        };

        console.log('📤 Data yang akan dikirim:', dataToSend);

        fetch("http://127.0.0.1:8000/api/penilaians", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
        })
            .then(async (res) => {
                const result = await res.json();
                console.log('📥 Response dari server:', result);
                
                if (!res.ok) {
                    console.error('❌ Error response:', result);
                    alert(result.message || JSON.stringify(result.errors) || "Gagal menyimpan data");
                    return;
                }
                
                alert(
                    `✅ ${result.message}\n\n` +
                    `📊 Total Nilai: ${result.total_nilai}\n` +
                    `🎯 Prioritas: ${result.prioritas}\n\n` +
                    `${result.prioritas === 'Tinggi' ? '⚠️ Perlu pemeliharaan segera!' : 
                      result.prioritas === 'Sedang' ? '📅 Jadwalkan pemeliharaan' : 
                      '✓ Kondisi masih baik'}`
                );
                resetForm();
                setShowForm(false);
                fetchPenilaians();
            })
            .catch((err) => {
                console.error('❌ Fetch error:', err);
                alert('Terjadi kesalahan koneksi: ' + err.message);
            });
    };

    // ✅ FUNGSI PRIORITAS YANG DIPERBAIKI (70-45)
    const getPrioritas = (nilai) => {
        if (nilai >= 70) return { label: "Tinggi", color: "bg-red-500", desc: "Perlu Segera" };
        if (nilai >= 45) return { label: "Sedang", color: "bg-yellow-500", desc: "Terjadwal" };
        return { label: "Rendah", color: "bg-lime-500", desc: "Baik" };
    };

    // Filter penilaian
    const filteredPenilaians = penilaians.filter((p) => {
        const keyword = search.toLowerCase();
        const matchSearch =
            p.aset?.nama_aset?.toLowerCase().includes(keyword) ||
            p.aset?.kode_aset?.toLowerCase().includes(keyword) ||
            p.user?.username?.toLowerCase().includes(keyword);

        const getPrioritasFilter = (nilai) => {
            if (nilai >= 70) return "Tinggi";
            if (nilai >= 45) return "Sedang";
            return "Rendah";
        };

        const matchPrioritas =
            filterPrioritas === "Semua" ||
            getPrioritasFilter(p.total_nilai) === filterPrioritas;

        const matchTanggal =
            !filterTanggal || p.created_at?.startsWith(filterTanggal);

        return matchSearch && matchPrioritas && matchTanggal;
    });

    // Hitung ranking berdasarkan total_nilai
    const rankedPenilaians = [...filteredPenilaians].sort(
        (a, b) => b.total_nilai - a.total_nilai
    );

    return (
        <div className="space-y-6">
            {/* ================= STAT CARDS (UPDATED) ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* TOTAL PENILAIAN */}
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Total Penilaian</p>
                        <p className="text-4xl font-bold mt-2">{penilaians.length}</p>
                    </div>
                    <ClipboardDocumentCheckIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>

                {/* PRIORITAS TINGGI (≥70) */}
                <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Prioritas Tinggi</p>
                        <p className="text-4xl font-bold mt-2">
                            {penilaians.filter((p) => p.total_nilai >= 70).length}
                        </p>
                        <p className="text-xs opacity-75 mt-1">≥ 70 - Perlu Segera</p>
                    </div>
                    <ChartBarIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>

                {/* PRIORITAS SEDANG (45-69) */}
                <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Prioritas Sedang</p>
                        <p className="text-4xl font-bold mt-2">
                            {
                                penilaians.filter(
                                    (p) => p.total_nilai >= 45 && p.total_nilai < 70
                                ).length
                            }
                        </p>
                        <p className="text-xs opacity-75 mt-1">45-69 - Terjadwal</p>
                    </div>
                    <ArchiveBoxIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>

                {/* PRIORITAS RENDAH (<45) */}
                <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Prioritas Rendah</p>
                        <p className="text-4xl font-bold mt-2">
                            {penilaians.filter((p) => p.total_nilai < 45).length}
                        </p>
                        <p className="text-xs opacity-75 mt-1">&lt; 45 - Kondisi Baik</p>
                    </div>
                    <CheckCircleIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
            </div>

            {/* HEADER - Tetap sama */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-600" />
                            Penilaian Aset & Prioritas Pemeliharaan
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Sistem perhitungan menggunakan metode Fuzzy-MARCOS
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-5 py-2 font-semibold text-white rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap ${
                            showForm
                                ? "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                                : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                        }`}
                    >
                        {showForm ? (
                            <>
                                <XMarkIcon className="w-5 h-5" />
                                Tutup Form
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-5 h-5" />
                                Tambah Penilaian
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* FORM - Tetap sama */}
            {showForm && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl p-8 border-2 border-blue-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <ClipboardDocumentCheckIcon className="w-7 h-7 text-blue-600" />
                        Form Penilaian Aset (Fuzzy-MARCOS)
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Form fields - tetap sama seperti sebelumnya */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            <label className="text-gray-700 text-sm font-bold mb-2 block">
                                Pilih Aset <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="aset_id"
                                value={formData.aset_id}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            >
                                <option value="">-- Pilih Aset yang Akan Dinilai --</option>
                                {asets.map((aset) => (
                                    <option key={aset.id} value={aset.id}>
                                        {aset.kode_aset} - {aset.nama_aset}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Kondisi Fisik */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">
                                    Kondisi Fisik Aset <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="kondisi_penilaian"
                                    value={formData.kondisi_penilaian}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                >
                                    <option value="">-- Pilih --</option>
                                    {enumOptions.kondisi_penilaian.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    C1 - Bobot 25% | Buruk = Prioritas Tinggi
                                </p>
                            </div>

                            {/* Usia Pemakaian */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">
                                    Usia Pemakaian Aset <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="usia_pemakaian_aset"
                                    value={formData.usia_pemakaian_aset}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                >
                                    <option value="">-- Pilih --</option>
                                    {enumOptions.usia_pemakaian_aset.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    C2 - Bobot 15% | Lama = Prioritas Tinggi
                                </p>
                            </div>

                            {/* Frekuensi Penggunaan */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">
                                    Frekuensi Penggunaan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="frekuensi_penggunaan"
                                    value={formData.frekuensi_penggunaan}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                >
                                    <option value="">-- Pilih --</option>
                                    {enumOptions.frekuensi_penggunaan.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    C3 - Bobot 20% | Sering = Prioritas Tinggi
                                </p>
                            </div>

                            {/* Tingkat Urgensi */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">
                                    Tingkat Urgensi <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="tingkat_urgensi"
                                    value={formData.tingkat_urgensi}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                >
                                    <option value="">-- Pilih --</option>
                                    {enumOptions.tingkat_urgensi.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    C4 - Bobot 10% | Urgen = Prioritas Tinggi
                                </p>
                            </div>

                            {/* Biaya Pemeliharaan */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">
                                    Biaya Pemeliharaan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="biaya_pemeliharaan"
                                    value={formData.biaya_pemeliharaan}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                >
                                    <option value="">-- Pilih --</option>
                                    {enumOptions.biaya_pemeliharaan.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    C5 - Bobot 15% | Rendah = Prioritas Tinggi (Cost)
                                </p>
                            </div>

                            {/* Nilai Ekonomis */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">
                                    Nilai Ekonomis <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="nilai_ekonomis"
                                    value={formData.nilai_ekonomis}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                >
                                    <option value="">-- Pilih --</option>
                                    {enumOptions.nilai_ekonomis.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    C6 - Bobot 15% | Tinggi = Prioritas Tinggi
                                </p>
                            </div>
                        </div>

                        {/* INFO BOX dengan Skala Nilai */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg">
                            <p className="text-sm text-blue-900 font-bold mb-3">
                                ℹ️ Informasi Perhitungan Fuzzy-MARCOS
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="bg-red-50 p-3 rounded border-l-2 border-red-500">
                                    <p className="font-bold text-red-700">🔴 Prioritas Tinggi</p>
                                    <p className="text-gray-600 mt-1">Nilai ≥ 70</p>
                                    <p className="text-gray-500 text-[10px] mt-1">Perlu pemeliharaan segera</p>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-500">
                                    <p className="font-bold text-yellow-700">🟡 Prioritas Sedang</p>
                                    <p className="text-gray-600 mt-1">Nilai 45-69</p>
                                    <p className="text-gray-500 text-[10px] mt-1">Jadwalkan pemeliharaan</p>
                                </div>
                                <div className="bg-lime-50 p-3 rounded border-l-2 border-lime-500">
                                    <p className="font-bold text-lime-700">🟢 Prioritas Rendah</p>
                                    <p className="text-gray-600 mt-1">Nilai &lt; 45</p>
                                    <p className="text-gray-500 text-[10px] mt-1">Kondisi masih baik</p>
                                </div>
                            </div>
                        </div>

                        {/* TOMBOL SUBMIT */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Reset Form
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition shadow-xl flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="w-6 h-6" />
                                Simpan & Hitung Prioritas
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* FILTER BAR (UPDATED) */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <FunnelIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-800">Filter & Pencarian Data</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                            Cari Aset / Penilai
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ketik untuk mencari..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                            Filter Prioritas
                        </label>
                        <select
                            value={filterPrioritas}
                            onChange={(e) => setFilterPrioritas(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        >
                            <option value="Semua">Semua Prioritas</option>
                            <option value="Tinggi">Tinggi (≥70)</option>
                            <option value="Sedang">Sedang (45-69)</option>
                            <option value="Rendah">Rendah (&lt;45)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                            Filter Tanggal
                        </label>
                        <input
                            type="date"
                            value={filterTanggal}
                            onChange={(e) => setFilterTanggal(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearch("");
                                setFilterPrioritas("Semua");
                                setFilterTanggal("");
                            }}
                            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Reset Filter
                        </button>
                    </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                    Menampilkan{" "}
                    <span className="font-bold">{rankedPenilaians.length}</span> dari{" "}
                    <span className="font-bold">{penilaians.length}</span> data penilaian
                </div>
            </div>

            {/* TABEL RANKING */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <ChartBarIcon className="w-7 h-7 text-blue-600" />
                        Ranking Prioritas Pemeliharaan (Fuzzy-MARCOS)
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Hasil perhitungan menggunakan Triangular Fuzzy Number & Normalisasi MARCOS
                    </p>

                    {loading ? (
                        <div className="text-center py-20">
                            <ArrowPathIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-gray-600 font-medium">Loading data penilaian...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">
                                            Rank
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                                            Kode Aset
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                                            Nama Aset
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">
                                            Total Nilai
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">
                                            Prioritas
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                                            Penilai
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {rankedPenilaians.map((penilaian, index) => {
                                        const prioritas = getPrioritas(penilaian.total_nilai);

                                        return (
                                            <tr
                                                key={penilaian.penilaian_id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-md ${
                                                            index === 0
                                                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                                                                : index === 1
                                                                ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                                                                : index === 2
                                                                ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-mono font-semibold text-gray-700">
                                                    {penilaian.aset?.kode_aset || "-"}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                                                    {penilaian.aset?.nama_aset || "-"}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-2xl font-bold text-gray-800">
                                                            {penilaian.total_nilai}
                                                        </span>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${prioritas.color}`}
                                                                style={{width: `${Math.min(penilaian.total_nilai, 100)}%`}}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span
                                                            className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-md ${prioritas.color}`}
                                                        >
                                                            {prioritas.label}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">
                                                            {prioritas.desc}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {penilaian.user?.username || "-"}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600 text-center">
                                                    {penilaian.created_at
                                                        ? new Date(
                                                              penilaian.created_at
                                                          ).toLocaleDateString("id-ID", {
                                                              day: "2-digit",
                                                              month: "short",
                                                              year: "numeric",
                                                          })
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() =>
                                                                openDetailModal(penilaian)
                                                            }
                                                            className="p-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition shadow-md"
                                                            title="Lihat Detail"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(penilaian.penilaian_id)
                                                            }
                                                            className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition shadow-md"
                                                            title="Hapus"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {rankedPenilaians.length === 0 && !loading && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-6 py-16 text-center text-gray-500"
                                            >
                                                <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                                <p className="text-lg font-semibold">
                                                    Belum ada data penilaian
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Silakan tambah penilaian baru untuk melihat
                                                    ranking
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {filteredPenilaians.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Menampilkan{" "}
                            <span className="font-semibold text-gray-900">
                                {filteredPenilaians.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-gray-900">
                                {penilaians.length}
                            </span>{" "}
                            penilaian
                        </p>
                    </div>
                )}
            </div>

            {/* MODAL DETAIL - Update dengan rentang baru */}
            {detailOpen && selectedPenilaian && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-t-3xl text-white relative">
                            <button
                                onClick={() => setDetailOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            <h2 className="text-3xl font-bold mb-2">Detail Penilaian Aset</h2>
                            <p className="text-blue-100">
                                Hasil perhitungan menggunakan metode Fuzzy-MARCOS
                            </p>
                        </div>

                        <div className="p-8">
                            {/* Info Aset */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ArchiveBoxIcon className="w-6 h-6 text-blue-600" />
                                    Informasi Aset
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Kode Aset</p>
                                        <p className="font-bold text-gray-800 font-mono">
                                            {selectedPenilaian.aset?.kode_aset || "-"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Nama Aset</p>
                                        <p className="font-bold text-gray-800">
                                            {selectedPenilaian.aset?.nama_aset || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Kriteria Penilaian - sama seperti sebelumnya */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
                                    Kriteria Penilaian
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                                        <p className="text-xs text-blue-600 font-semibold mb-1">
                                            Kondisi Fisik (C1 - 25%)
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {selectedPenilaian.kondisi_penilaian}
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                                        <p className="text-xs text-purple-600 font-semibold mb-1">
                                            Usia Pemakaian (C2 - 15%)
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {selectedPenilaian.usia_pemakaian_aset}
                                        </p>
                                    </div>

                                    <div className="bg-lime-50 p-4 rounded-xl border-2 border-lime-200">
                                        <p className="text-xs text-lime-600 font-semibold mb-1">
                                            Frekuensi Penggunaan (C3 - 20%)
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {selectedPenilaian.frekuensi_penggunaan}
                                        </p>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                                        <p className="text-xs text-yellow-600 font-semibold mb-1">
                                            Tingkat Urgensi (C4 - 10%)
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {selectedPenilaian.tingkat_urgensi}
                                        </p>
                                    </div>

                                    <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                                        <p className="text-xs text-orange-600 font-semibold mb-1">
                                            Biaya Pemeliharaan (C5 - 15%)
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {selectedPenilaian.biaya_pemeliharaan}
                                        </p>
                                    </div>

                                    <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                                        <p className="text-xs text-red-600 font-semibold mb-1">
                                            Nilai Ekonomis (C6 - 15%)
                                        </p>
                                        <p className="font-bold text-gray-800">
                                            {selectedPenilaian.nilai_ekonomis}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Hasil Perhitungan */}
                            <div className={`rounded-2xl p-6 text-white mb-6 ${getPrioritas(selectedPenilaian.total_nilai).color}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 mb-1">
                                            Total Nilai (Fuzzy-MARCOS)
                                        </p>
                                        <p className="text-6xl font-bold">
                                            {selectedPenilaian.total_nilai}
                                        </p>
                                        <div className="mt-4 space-y-1">
                                            <p className="text-sm opacity-90">
                                                Prioritas:{" "}
                                                <span className="font-bold text-lg">
                                                    {getPrioritas(selectedPenilaian.total_nilai).label}
                                                </span>
                                            </p>
                                            <p className="text-xs opacity-75">
                                                {getPrioritas(selectedPenilaian.total_nilai).desc}
                                            </p>
                                        </div>
                                    </div>
                                    <ChartBarIcon className="w-24 h-24 opacity-30" />
                                </div>
                            </div>

                            {/* Info Penilai */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Dinilai Oleh</p>
                                    <p className="font-bold text-gray-800">
                                        {selectedPenilaian.user?.username || "-"}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">
                                        Tanggal Penilaian
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        {selectedPenilaian.created_at
                                            ? new Date(
                                                  selectedPenilaian.created_at
                                              ).toLocaleDateString("id-ID", {
                                                  weekday: "long",
                                                  day: "2-digit",
                                                  month: "long",
                                                  year: "numeric",
                                              })
                                            : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}