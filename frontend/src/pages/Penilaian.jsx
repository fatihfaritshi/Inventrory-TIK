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
    MagnifyingGlassIcon,
    ClockIcon,
} from "@heroicons/react/24/solid";

export default function Penilaian() {
    const [penilaians, setPenilaians] = useState([]);
    const [pemeliharaans, setPemeliharaans] = useState([]);
    const [asets, setAsets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedPenilaian, setSelectedPenilaian] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState("ranking"); // ranking | riwayat

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

    const user = JSON.parse(localStorage.getItem("user")) || {
        id: 1,
        username: "Guest",
        role: "Administrator",
    };

    const enumOptions = {
        frekuensi_penggunaan: ["Sangat Sering", "Sering", "Kadang", "Jarang", "Sangat Jarang"],
        usia_pemakaian_aset: ["Baru", "Relatif Baru", "Sedang", "Lama", "Sangat Lama"],
        kondisi_penilaian: ["Sangat Baik", "Baik", "Cukup", "Buruk", "Sangat Buruk"],
        nilai_ekonomis: ["Sangat Tinggi", "Tinggi", "Sedang", "Rendah", "Sangat Rendah"],
        biaya_pemeliharaan: ["Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"],
        tingkat_urgensi: ["Sangat Urgen", "Urgen", "Sedang", "Rendah", "Tidak Urgen"],
    };

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [penilaianRes, pemeliharaanRes, asetRes] = await Promise.all([
                fetch("http://127.0.0.1:8000/api/penilaians"),
                fetch("http://127.0.0.1:8000/api/pemeliharaans"),
                fetch("http://127.0.0.1:8000/api/asets"),
            ]);
            const penilaianData = await penilaianRes.json();
            const pemeliharaanData = await pemeliharaanRes.json();
            const asetData = await asetRes.json();
            setPenilaians(penilaianData.data || []);
            setPemeliharaans(pemeliharaanData.data || []);
            setAsets(asetData.data || []);
        } catch (err) {
            console.error("❌ Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus penilaian ini?")) return;
        fetch(`http://127.0.0.1:8000/api/penilaians/${id}`, { method: "DELETE" })
            .then((res) => res.json())
            .then((result) => { alert(result.message); fetchAllData(); })
            .catch((err) => console.error(err));
    };

    const openDetailModal = (penilaian) => { setSelectedPenilaian(penilaian); setDetailOpen(true); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setFormData({ aset_id: "", frekuensi_penggunaan: "", usia_pemakaian_aset: "", kondisi_penilaian: "", nilai_ekonomis: "", biaya_pemeliharaan: "", tingkat_urgensi: "" });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = { ...formData, user_id: user.id };
        fetch("http://127.0.0.1:8000/api/penilaians", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
        })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) { alert(result.message || JSON.stringify(result.errors) || "Gagal menyimpan data"); return; }
                alert(`✅ ${result.message}\n\n📊 Total Nilai: ${result.total_nilai}\n🎯 Prioritas: ${result.prioritas}`);
                resetForm(); setShowForm(false); fetchAllData();
            })
            .catch((err) => { alert('Terjadi kesalahan koneksi: ' + err.message); });
    };

    // ==================== HELPERS ====================
    const getPrioritas = (nilai) => {
        if (nilai >= 70) return { label: "Tinggi", color: "bg-red-500", desc: "Perlu Segera" };
        if (nilai >= 45) return { label: "Sedang", color: "bg-yellow-500", desc: "Terjadwal" };
        return { label: "Rendah", color: "bg-lime-500", desc: "Baik" };
    };

    // ==================== TIMELINE GROUPING ====================
    const getTimelineGroup = (dateStr) => {
        if (!dateStr) return "Lebih Lama";
        const date = new Date(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Hari Ini";
        if (diffDays === 1) return "Kemarin";
        if (diffDays <= 7) return "Minggu Ini";
        if (diffDays <= 30) return "Bulan Ini";
        if (diffDays <= 60) return "Bulan Lalu";
        return "Lebih Lama";
    };

    const timelineConfig = {
        "Hari Ini": { icon: "🟢", dotColor: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" },
        "Kemarin": { icon: "🔵", dotColor: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-700" },
        "Minggu Ini": { icon: "🟣", dotColor: "bg-indigo-500", bgColor: "bg-indigo-50", textColor: "text-indigo-700" },
        "Bulan Ini": { icon: "🟡", dotColor: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
        "Bulan Lalu": { icon: "🟠", dotColor: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700" },
        "Lebih Lama": { icon: "⚫", dotColor: "bg-gray-400", bgColor: "bg-gray-50", textColor: "text-gray-600" },
    };

    const groupByTimeline = (items, dateField) => {
        const order = ["Hari Ini", "Kemarin", "Minggu Ini", "Bulan Ini", "Bulan Lalu", "Lebih Lama"];
        const groups = {};
        items.forEach((item) => {
            const group = getTimelineGroup(item[dateField]);
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
        });
        return order.filter((g) => groups[g]).map((g) => ({ label: g, config: timelineConfig[g], items: groups[g] }));
    };

    // ==================== FILTER LOGIC ====================
    const maintainedAsetIds = new Set(pemeliharaans.map((p) => Number(p.aset_id)));

    // Tab 1: Ranking — hanya aset yang BELUM dilakukan pemeliharaan
    const rankingPenilaians = penilaians.filter((p) => !maintainedAsetIds.has(Number(p.aset_id)));

    const filteredRanking = rankingPenilaians.filter((p) => {
        const keyword = search.toLowerCase();
        const matchSearch = p.aset?.nama_aset?.toLowerCase().includes(keyword) || p.aset?.kode_aset?.toLowerCase().includes(keyword) || p.user?.username?.toLowerCase().includes(keyword);
        const matchPrioritas = filterPrioritas === "Semua" || getPrioritas(p.total_nilai).label === filterPrioritas;
        const matchTanggal = !filterTanggal || p.created_at?.startsWith(filterTanggal);
        return matchSearch && matchPrioritas && matchTanggal;
    });

    const rankedPenilaians = [...filteredRanking].sort((a, b) => b.total_nilai - a.total_nilai);

    // Tab 2: Riwayat Penilaian — SEMUA data penilaian dikelompokkan berdasarkan waktu
    const filteredRiwayatPenilaian = penilaians.filter((p) => {
        const keyword = search.toLowerCase();
        const matchSearch = p.aset?.nama_aset?.toLowerCase().includes(keyword) || p.aset?.kode_aset?.toLowerCase().includes(keyword) || p.user?.username?.toLowerCase().includes(keyword);
        const matchPrioritas = filterPrioritas === "Semua" || getPrioritas(p.total_nilai).label === filterPrioritas;
        return matchSearch && matchPrioritas;
    });

    const penilaianTimeline = groupByTimeline(filteredRiwayatPenilaian, "created_at");

    // ==================== RENDER ====================
    return (
        <div className="space-y-6">
            {/* ================= STAT CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Total Penilaian</p><p className="text-4xl font-bold mt-2">{penilaians.length}</p></div>
                    <ClipboardDocumentCheckIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
                <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Prioritas Tinggi</p><p className="text-4xl font-bold mt-2">{penilaians.filter((p) => p.total_nilai >= 70).length}</p><p className="text-xs opacity-75 mt-1">≥ 70 - Perlu Segera</p></div>
                    <ChartBarIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
                <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Prioritas Sedang</p><p className="text-4xl font-bold mt-2">{penilaians.filter((p) => p.total_nilai >= 45 && p.total_nilai < 70).length}</p><p className="text-xs opacity-75 mt-1">45-69 - Terjadwal</p></div>
                    <ArchiveBoxIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
                <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Prioritas Rendah</p><p className="text-4xl font-bold mt-2">{penilaians.filter((p) => p.total_nilai < 45).length}</p><p className="text-xs opacity-75 mt-1">&lt; 45 - Kondisi Baik</p></div>
                    <CheckCircleIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
            </div>

            {/* ================= HEADER ================= */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-600" />
                            Penilaian Aset & Prioritas Pemeliharaan
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Sistem perhitungan menggunakan metode Fuzzy-MARCOS</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-5 py-2 font-semibold text-white rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap ${showForm ? "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800" : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"}`}>
                        {showForm ? (<><XMarkIcon className="w-5 h-5" /> Tutup Form</>) : (<><PlusIcon className="w-5 h-5" /> Tambah Penilaian</>)}
                    </button>
                </div>
            </div>

            {/* ================= FORM ================= */}
            {showForm && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl p-8 border-2 border-blue-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <ClipboardDocumentCheckIcon className="w-7 h-7 text-blue-600" />
                        Form Penilaian Aset (Fuzzy-MARCOS)
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            <label className="text-gray-700 text-sm font-bold mb-2 block">Pilih Aset <span className="text-red-500">*</span></label>
                            <select name="aset_id" value={formData.aset_id} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                                <option value="">-- Pilih Aset yang Akan Dinilai --</option>
                                {asets.map((aset) => (<option key={aset.id} value={aset.id}>{aset.kode_aset} - {aset.nama_aset}</option>))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: "kondisi_penilaian", label: "Kondisi Fisik Aset", hint: "C1 - Bobot 25% | Buruk = Prioritas Tinggi" },
                                { name: "usia_pemakaian_aset", label: "Usia Pemakaian Aset", hint: "C2 - Bobot 15% | Lama = Prioritas Tinggi" },
                                { name: "frekuensi_penggunaan", label: "Frekuensi Penggunaan", hint: "C3 - Bobot 20% | Sering = Prioritas Tinggi" },
                                { name: "tingkat_urgensi", label: "Tingkat Urgensi", hint: "C4 - Bobot 10% | Urgen = Prioritas Tinggi" },
                                { name: "biaya_pemeliharaan", label: "Biaya Pemeliharaan", hint: "C5 - Bobot 15% | Rendah = Prioritas Tinggi (Cost)" },
                                { name: "nilai_ekonomis", label: "Nilai Ekonomis", hint: "C6 - Bobot 15% | Tinggi = Prioritas Tinggi" },
                            ].map((field) => (
                                <div key={field.name} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                    <label className="text-gray-700 text-sm font-bold mb-2 block">{field.label} <span className="text-red-500">*</span></label>
                                    <select name={field.name} value={formData[field.name]} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                                        <option value="">-- Pilih --</option>
                                        {enumOptions[field.name].map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">{field.hint}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg">
                            <p className="text-sm text-blue-900 font-bold mb-3">ℹ️ Informasi Perhitungan Fuzzy-MARCOS</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="bg-red-50 p-3 rounded border-l-2 border-red-500"><p className="font-bold text-red-700">🔴 Prioritas Tinggi</p><p className="text-gray-600 mt-1">Nilai ≥ 70</p></div>
                                <div className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-500"><p className="font-bold text-yellow-700">🟡 Prioritas Sedang</p><p className="text-gray-600 mt-1">Nilai 45-69</p></div>
                                <div className="bg-lime-50 p-3 rounded border-l-2 border-lime-500"><p className="font-bold text-lime-700">🟢 Prioritas Rendah</p><p className="text-gray-600 mt-1">Nilai &lt; 45</p></div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={resetForm} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"><ArrowPathIcon className="w-5 h-5" /> Reset Form</button>
                            <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition shadow-xl flex items-center justify-center gap-2"><CheckCircleIcon className="w-6 h-6" /> Simpan & Hitung Prioritas</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= TABS & CONTENT ================= */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 overflow-hidden">
                {/* TAB BUTTONS */}
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button onClick={() => { setActiveTab("ranking"); setSearch(""); setFilterPrioritas("Semua"); setFilterTanggal(""); }}
                            className={`flex-1 py-4 px-6 font-semibold transition-all ${activeTab === "ranking" ? "bg-blue-500 text-white border-b-4 border-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                            <div className="flex items-center justify-center gap-2">
                                <ChartBarIcon className="w-5 h-5" /> Ranking Prioritas Pemeliharaan
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "ranking" ? "bg-white/20" : "bg-blue-100 text-blue-600"}`}>{rankingPenilaians.length}</span>
                            </div>
                        </button>
                        <button onClick={() => { setActiveTab("riwayat"); setSearch(""); setFilterPrioritas("Semua"); }}
                            className={`flex-1 py-4 px-6 font-semibold transition-all ${activeTab === "riwayat" ? "bg-blue-500 text-white border-b-4 border-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                            <div className="flex items-center justify-center gap-2">
                                <ClockIcon className="w-5 h-5" /> Riwayat Penilaian
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "riwayat" ? "bg-white/20" : "bg-green-100 text-green-600"}`}>{penilaians.length}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4"><FunnelIcon className="w-5 h-5 text-gray-600" /><h3 className="font-bold text-gray-800">Filter & Pencarian Data</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">Cari Aset / Penilai</label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Ketik untuk mencari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">Filter Prioritas</label>
                            <select value={filterPrioritas} onChange={(e) => setFilterPrioritas(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                                <option value="Semua">Semua Prioritas</option>
                                <option value="Tinggi">Tinggi (≥70)</option>
                                <option value="Sedang">Sedang (45-69)</option>
                                <option value="Rendah">Rendah (&lt;45)</option>
                            </select>
                        </div>
                        {activeTab === "ranking" && (
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Filter Tanggal</label>
                                <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
                            </div>
                        )}
                        <div className="flex items-end">
                            <button onClick={() => { setSearch(""); setFilterPrioritas("Semua"); setFilterTanggal(""); }} className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center gap-2">
                                <XMarkIcon className="w-4 h-4" /> Reset Filter
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                        Menampilkan <span className="font-bold">{activeTab === "ranking" ? rankedPenilaians.length : filteredRiwayatPenilaian.length}</span> dari <span className="font-bold">{activeTab === "ranking" ? rankingPenilaians.length : penilaians.length}</span> data
                    </div>
                </div>

                {/* TAB CONTENT */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-20"><ArrowPathIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" /><p className="text-gray-600 font-medium">Loading data...</p></div>
                    ) : activeTab === "ranking" ? (
                        /* ==================== TAB 1: RANKING PRIORITAS ==================== */
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><ChartBarIcon className="w-7 h-7 text-blue-600" /> Ranking Prioritas Pemeliharaan (Fuzzy-MARCOS)</h2>
                            <p className="text-sm text-gray-500 mb-6">Hanya menampilkan aset yang belum dilakukan pemeliharaan</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">Rank</th>
                                            <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">Kode Aset</th>
                                            <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">Nama Aset</th>
                                            <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">Total Nilai</th>
                                            <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">Prioritas</th>
                                            <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">Penilai</th>
                                            <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">Tanggal</th>
                                            <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {rankedPenilaians.map((penilaian, index) => {
                                            const prioritas = getPrioritas(penilaian.total_nilai);
                                            return (
                                                <tr key={penilaian.penilaian_id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-md ${index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white" : index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white" : index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" : "bg-gray-100 text-gray-700"}`}>{index + 1}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-mono font-semibold text-gray-700">{penilaian.aset?.kode_aset || "-"}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-700 font-medium">{penilaian.aset?.nama_aset || "-"}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-2xl font-bold text-gray-800">{penilaian.total_nilai}</span>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${prioritas.color}`} style={{width: `${Math.min(penilaian.total_nilai, 100)}%`}}></div></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-md ${prioritas.color}`}>{prioritas.label}</span>
                                                            <span className="text-[10px] text-gray-500">{prioritas.desc}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{penilaian.user?.username || "-"}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600 text-center">{penilaian.created_at ? new Date(penilaian.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                                                    <td className="px-4 py-4 text-sm">
                                                        <div className="flex gap-2 justify-center">
                                                            <button onClick={() => openDetailModal(penilaian)} className="p-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition shadow-md" title="Lihat Detail"><EyeIcon className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(penilaian.penilaian_id)} className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition shadow-md" title="Hapus"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {rankedPenilaians.length === 0 && !loading && (
                                            <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                                                <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                                <p className="text-lg font-semibold">{rankingPenilaians.length === 0 && penilaians.length > 0 ? "Semua aset sudah dijadwalkan pemeliharaan" : "Belum ada data penilaian"}</p>
                                                <p className="text-sm text-gray-400 mt-1">{rankingPenilaians.length === 0 && penilaians.length > 0 ? "Lihat tab Riwayat Penilaian untuk melihat data" : "Silakan tambah penilaian baru untuk melihat ranking"}</p>
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* ==================== TAB 2: RIWAYAT PENILAIAN ==================== */
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <ClipboardDocumentCheckIcon className="w-7 h-7 text-blue-600" /> Riwayat Penilaian Aset
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">Seluruh data hasil penilaian aset, dikelompokkan berdasarkan waktu</p>

                            {penilaianTimeline.length === 0 ? (
                                <div className="text-center py-16">
                                    <ClipboardDocumentCheckIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg font-semibold text-gray-500">Belum ada data penilaian</p>
                                    <p className="text-sm text-gray-400 mt-1">Data akan muncul setelah penilaian aset dilakukan</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {penilaianTimeline.map((group) => (
                                        <div key={group.label}>
                                            <div className={`flex items-center gap-3 mb-3 px-1 py-2 rounded-lg ${group.config.bgColor}`}>
                                                <div className={`w-3 h-3 rounded-full ${group.config.dotColor} shadow-sm`}></div>
                                                <h3 className={`font-bold text-sm ${group.config.textColor}`}>{group.config.icon} {group.label}</h3>
                                                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full shadow-sm">{group.items.length} data</span>
                                                <div className="flex-1 h-px bg-gray-200"></div>
                                            </div>
                                            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tanggal</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Kode Aset</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nama Aset</th>
                                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Total Nilai</th>
                                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Prioritas</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Penilai</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 bg-white">
                                                        {group.items.map((item) => {
                                                            const prioritas = getPrioritas(item.total_nilai);
                                                            return (
                                                                <tr key={item.penilaian_id} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                                                                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-700">{item.aset?.kode_aset || "-"}</td>
                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.aset?.nama_aset || "-"}</td>
                                                                    <td className="px-4 py-3 text-center"><span className="text-lg font-bold text-gray-800">{item.total_nilai}</span></td>
                                                                    <td className="px-4 py-3 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${prioritas.color}`}>{prioritas.label}</span></td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{item.user?.username || "-"}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= MODAL DETAIL ================= */}
            {detailOpen && selectedPenilaian && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-t-3xl text-white relative">
                            <button onClick={() => setDetailOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"><XMarkIcon className="w-6 h-6" /></button>
                            <h2 className="text-3xl font-bold mb-2">Detail Penilaian Aset</h2>
                            <p className="text-blue-100">Hasil perhitungan menggunakan metode Fuzzy-MARCOS</p>
                        </div>
                        <div className="p-8">
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><ArchiveBoxIcon className="w-6 h-6 text-blue-600" /> Informasi Aset</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><p className="text-xs text-gray-500 mb-1">Kode Aset</p><p className="font-bold text-gray-800 font-mono">{selectedPenilaian.aset?.kode_aset || "-"}</p></div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><p className="text-xs text-gray-500 mb-1">Nama Aset</p><p className="font-bold text-gray-800">{selectedPenilaian.aset?.nama_aset || "-"}</p></div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" /> Kriteria Penilaian</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: "Kondisi Fisik (C1 - 25%)", value: selectedPenilaian.kondisi_penilaian, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
                                        { label: "Usia Pemakaian (C2 - 15%)", value: selectedPenilaian.usia_pemakaian_aset, bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
                                        { label: "Frekuensi Penggunaan (C3 - 20%)", value: selectedPenilaian.frekuensi_penggunaan, bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-600" },
                                        { label: "Tingkat Urgensi (C4 - 10%)", value: selectedPenilaian.tingkat_urgensi, bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-600" },
                                        { label: "Biaya Pemeliharaan (C5 - 15%)", value: selectedPenilaian.biaya_pemeliharaan, bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
                                        { label: "Nilai Ekonomis (C6 - 15%)", value: selectedPenilaian.nilai_ekonomis, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
                                    ].map((k) => (
                                        <div key={k.label} className={`${k.bg} p-4 rounded-xl border-2 ${k.border}`}>
                                            <p className={`text-xs ${k.text} font-semibold mb-1`}>{k.label}</p>
                                            <p className="font-bold text-gray-800">{k.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={`rounded-2xl p-6 text-white mb-6 ${getPrioritas(selectedPenilaian.total_nilai).color}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-90 mb-1">Total Nilai (Fuzzy-MARCOS)</p>
                                        <p className="text-6xl font-bold">{selectedPenilaian.total_nilai}</p>
                                        <div className="mt-4 space-y-1"><p className="text-sm opacity-90">Prioritas: <span className="font-bold text-lg">{getPrioritas(selectedPenilaian.total_nilai).label}</span></p></div>
                                    </div>
                                    <ChartBarIcon className="w-24 h-24 opacity-30" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><p className="text-xs text-gray-500 mb-1">Dinilai Oleh</p><p className="font-bold text-gray-800">{selectedPenilaian.user?.username || "-"}</p></div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><p className="text-xs text-gray-500 mb-1">Tanggal Penilaian</p><p className="font-bold text-gray-800">{selectedPenilaian.created_at ? new Date(selectedPenilaian.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "-"}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}