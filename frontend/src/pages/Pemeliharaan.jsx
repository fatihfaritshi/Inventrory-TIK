// frontend/pages/Pemeliharaan.jsx
import React, { useEffect, useState } from "react";
import {
    WrenchScrewdriverIcon,
    PlusIcon,
    XMarkIcon,
    EyeIcon,
    TrashIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ChartBarIcon,
    ArchiveBoxIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/solid";

export default function Pemeliharaan() {
    const [penilaians, setPenilaians] = useState([]);
    const [pemeliharaans, setPemeliharaans] = useState([]);
    const [asets, setAsets] = useState([]);
    const [statistik, setStatistik] = useState({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeTab, setActiveTab] = useState("ranking");

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [filterPrioritas, setFilterPrioritas] = useState("Semua");
    const [filterTanggal, setFilterTanggal] = useState("");

    const [formData, setFormData] = useState({
        aset_id: "", tanggal: "", deskripsi: "", biaya: "", tanggal_selesai: "",
    });

    useEffect(() => { fetchAllData(); fetchAsets(); }, []);

    const fetchAsets = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/asets");
            const json = await res.json();
            setAsets(json.data || []);
        } catch (err) { console.error("Gagal fetch aset:", err); }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [prioritasRes, pemeliharaanRes, statistikRes] = await Promise.all([
                fetch("http://127.0.0.1:8000/api/pemeliharaans/prioritas"),
                fetch("http://127.0.0.1:8000/api/pemeliharaans"),
                fetch("http://127.0.0.1:8000/api/pemeliharaans/statistik"),
            ]);
            const checkResponse = async (res, label) => {
                if (!res.ok) { const text = await res.text(); throw new Error(`${label} gagal: HTTP ${res.status}`); }
                return res.json();
            };
            const [prioritasData, pemeliharaanData, statistikData] = await Promise.all([
                checkResponse(prioritasRes, 'prioritas'),
                checkResponse(pemeliharaanRes, 'pemeliharaan'),
                checkResponse(statistikRes, 'statistik'),
            ]);
            setPenilaians(prioritasData.data || []);
            setPemeliharaans(pemeliharaanData.data || []);
            setStatistik(statistikData || {});
        } catch (err) {
            console.error("❌ Fetch Error:", err);
        } finally { setLoading(false); }
    };

    // ==================== HELPERS ====================
    const getPrioritas = (nilai) => {
        if (nilai >= 70) return { label: "Tinggi", color: "bg-red-500", desc: "Perlu Segera" };
        if (nilai >= 45) return { label: "Sedang", color: "bg-yellow-500", desc: "Terjadwal" };
        return { label: "Rendah", color: "bg-lime-500", desc: "Baik" };
    };

    const formatRupiah = (angka) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

    const getStatusPemeliharaan = (item) => {
        if (!item.tanggal_selesai) return "Berlangsung";
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tglSelesai = new Date(item.tanggal_selesai); tglSelesai.setHours(0, 0, 0, 0);
        return today >= tglSelesai ? "Selesai" : "Berlangsung";
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
        items.forEach((item) => { const group = getTimelineGroup(item[dateField]); if (!groups[group]) groups[group] = []; groups[group].push(item); });
        return order.filter((g) => groups[g]).map((g) => ({ label: g, config: timelineConfig[g], items: groups[g] }));
    };

    // ==================== FORM HANDLERS ====================
    const handleChange = (e) => { const { name, value } = e.target; setFormData({ ...formData, [name]: value }); };
    const resetForm = () => { setFormData({ aset_id: "", tanggal: "", deskripsi: "", biaya: "", tanggal_selesai: "" }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://127.0.0.1:8000/api/pemeliharaans", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (!res.ok) { alert(result.message || "Gagal menyimpan data"); return; }
            alert("✅ " + result.message);
            resetForm(); setShowForm(false); fetchAllData();
        } catch (err) { alert("❌ Terjadi kesalahan: " + err.message); }
    };

    const handleJadwalkanFromRanking = (penilaian) => {
        setFormData({
            aset_id: penilaian.aset_id,
            tanggal: new Date().toISOString().split("T")[0],
            deskripsi: `Pemeliharaan ${penilaian.status_prioritas} - ${penilaian.aset?.nama_aset}`,
            biaya: "", tanggal_selesai: "",
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/pemeliharaans/${id}`, { method: "DELETE" });
            const result = await res.json(); alert(result.message); fetchAllData();
        } catch (err) { console.error(err); }
    };

    const handleMarkCompleted = async (id) => {
        if (!window.confirm("Tandai pemeliharaan ini sebagai selesai?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/pemeliharaans/${id}/selesai`, { method: "POST", headers: { "Content-Type": "application/json" } });
            const result = await res.json(); alert(result.message); fetchAllData();
        } catch (err) { console.error(err); }
    };

    // ==================== FILTER LOGIC ====================
    // Tab 1: Ranking
    const filteredRanking = penilaians.filter((p) => {
        const keyword = search.toLowerCase();
        const matchSearch = p.aset?.nama_aset?.toLowerCase().includes(keyword) || p.aset?.kode_aset?.toLowerCase().includes(keyword);
        const matchPrioritas = filterPrioritas === "Semua" || getPrioritas(p.total_nilai).label === filterPrioritas;
        const matchTanggal = !filterTanggal || p.created_at?.startsWith(filterTanggal);
        return matchSearch && matchPrioritas && matchTanggal;
    });
    const rankedPenilaians = [...filteredRanking].sort((a, b) => b.total_nilai - a.total_nilai);

    // Tab 2: Riwayat Pemeliharaan — SEMUA data pemeliharaan dikelompokkan berdasarkan waktu
    const filteredRiwayatPemeliharaan = pemeliharaans.filter((item) => {
        const keyword = search.toLowerCase();
        const matchSearch = item.aset?.nama_aset?.toLowerCase().includes(keyword) || item.aset?.kode_aset?.toLowerCase().includes(keyword);
        const status = getStatusPemeliharaan(item);
        const matchStatus = filterStatus === "Semua" || filterStatus === status;
        return matchSearch && matchStatus;
    });

    const pemeliharaanTimeline = groupByTimeline(filteredRiwayatPemeliharaan, "tanggal");

    // ==================== RENDER ====================
    return (
        <div className="space-y-6">
            {/* ==================== STAT CARDS ==================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Total Pemeliharaan</p><p className="text-4xl font-bold mt-2">{statistik.total_pemeliharaan || 0}</p></div>
                    <WrenchScrewdriverIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Bulan Ini</p><p className="text-4xl font-bold mt-2">{statistik.pemeliharaan_bulan_ini || 0}</p></div>
                    <CalendarIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Berlangsung</p><p className="text-4xl font-bold mt-2">{statistik.pemeliharaan_berlangsung || 0}</p></div>
                    <ClockIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10"><p className="text-sm opacity-90 font-medium">Total Biaya</p><p className="text-2xl font-bold mt-2">{formatRupiah(statistik.total_biaya || 0)}</p></div>
                    <CurrencyDollarIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
            </div>

            {/* ==================== HEADER ==================== */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" /> Manajemen Pemeliharaan Aset</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola jadwal dan riwayat pemeliharaan berdasarkan prioritas penilaian</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-5 py-2 font-semibold text-white rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap ${showForm ? "bg-gradient-to-r from-red-500 to-red-700" : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-yellow-500 hover:to-yellow-600"}`}>
                        {showForm ? (<><XMarkIcon className="w-5 h-5" /> Tutup Form</>) : (<><PlusIcon className="w-5 h-5" /> Tambah Pemeliharaan</>)}
                    </button>
                </div>
            </div>

            {/* ==================== FORM ==================== */}
            {showForm && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl p-8 border-2 border-blue-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><WrenchScrewdriverIcon className="w-7 h-7 text-blue-600" /> Form Pemeliharaan Aset</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">Pilih Aset <span className="text-red-500">*</span></label>
                                <select name="aset_id" value={formData.aset_id} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                                    <option value="">-- Pilih Aset --</option>
                                    {asets.map((aset) => (<option key={aset.id} value={aset.id}>{aset.kode_aset} - {aset.nama_aset}</option>))}
                                </select>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">Tanggal Mulai <span className="text-red-500">*</span></label>
                                <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 md:col-span-2">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">Deskripsi Pemeliharaan <span className="text-red-500">*</span></label>
                                <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} required rows={4} className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="Jelaskan detail pekerjaan pemeliharaan..." />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">Biaya (Rp) <span className="text-red-500">*</span></label>
                                <input type="number" name="biaya" value={formData.biaya} onChange={handleChange} required min="0" step="1000" className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" placeholder="0" />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <label className="text-gray-700 text-sm font-bold mb-2 block">Tanggal Selesai (Opsional)</label>
                                <input type="date" name="tanggal_selesai" value={formData.tanggal_selesai} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={resetForm} className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"><ArrowPathIcon className="w-5 h-5" /> Reset Form</button>
                            <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition shadow-xl flex items-center justify-center gap-2"><CheckCircleIcon className="w-6 h-6" /> Simpan Pemeliharaan</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ==================== TABS & CONTENT ==================== */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 overflow-hidden">
                {/* TAB BUTTONS */}
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button onClick={() => { setActiveTab("ranking"); setSearch(""); setFilterPrioritas("Semua"); setFilterTanggal(""); }}
                            className={`flex-1 py-4 px-6 font-semibold transition-all ${activeTab === "ranking" ? "bg-blue-500 text-white border-b-4 border-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                            <div className="flex items-center justify-center gap-2">
                                <ChartBarIcon className="w-5 h-5" /> Ranking Prioritas Pemeliharaan
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "ranking" ? "bg-white/20" : "bg-blue-100 text-blue-600"}`}>{penilaians.length}</span>
                            </div>
                        </button>
                        <button onClick={() => { setActiveTab("riwayat"); setSearch(""); setFilterStatus("Semua"); }}
                            className={`flex-1 py-4 px-6 font-semibold transition-all ${activeTab === "riwayat" ? "bg-blue-500 text-white border-b-4 border-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                            <div className="flex items-center justify-center gap-2">
                                <ClockIcon className="w-5 h-5" /> Riwayat Pemeliharaan
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "riwayat" ? "bg-white/20" : "bg-green-100 text-green-600"}`}>{pemeliharaans.length}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4"><FunnelIcon className="w-5 h-5 text-gray-600" /><h3 className="font-bold text-gray-800">Filter & Pencarian Data</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">Cari Aset</label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Ketik untuk mencari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
                            </div>
                        </div>
                        {activeTab === "ranking" ? (
                            <>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Filter Prioritas</label>
                                    <select value={filterPrioritas} onChange={(e) => setFilterPrioritas(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                                        <option value="Semua">Semua Prioritas</option>
                                        <option value="Tinggi">Tinggi (≥70)</option>
                                        <option value="Sedang">Sedang (45-69)</option>
                                        <option value="Rendah">Rendah (&lt;45)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Filter Tanggal</label>
                                    <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Filter Status</label>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                                    <option value="Semua">Semua Status</option>
                                    <option value="Berlangsung">Berlangsung</option>
                                    <option value="Selesai">Selesai</option>
                                </select>
                            </div>
                        )}
                        <div className="flex items-end">
                            <button onClick={() => { setSearch(""); setFilterStatus("Semua"); setFilterPrioritas("Semua"); setFilterTanggal(""); }} className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center gap-2">
                                <XMarkIcon className="w-4 h-4" /> Reset Filter
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                        Menampilkan <span className="font-bold">{activeTab === "ranking" ? rankedPenilaians.length : filteredRiwayatPemeliharaan.length}</span> dari <span className="font-bold">{activeTab === "ranking" ? penilaians.length : pemeliharaans.length}</span> data
                    </div>
                </div>

                {/* TAB CONTENT */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-20"><ArrowPathIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" /><p className="text-gray-600 font-medium">Loading data...</p></div>
                    ) : activeTab === "ranking" ? (
                        /* ==================== TAB 1: RANKING PRIORITAS ==================== */
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
                                            <tr key={penilaian.id || index} className="hover:bg-gray-50 transition-colors">
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
                                                    <span className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-md ${prioritas.color}`}>{prioritas.label}</span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700">{penilaian.user?.username || "-"}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600 text-center">{penilaian.created_at ? new Date(penilaian.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <button onClick={() => handleJadwalkanFromRanking(penilaian)} className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-2 mx-auto">
                                                        <CalendarIcon className="w-4 h-4" /> Jadwalkan
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {rankedPenilaians.length === 0 && (
                                        <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                                            <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <p className="text-lg font-semibold">{penilaians.length === 0 ? "Semua aset sudah dijadwalkan pemeliharaan" : "Tidak ada data yang cocok"}</p>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* ==================== TAB 2: RIWAYAT PEMELIHARAAN ==================== */
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <WrenchScrewdriverIcon className="w-7 h-7 text-green-600" /> Riwayat Pemeliharaan Aset
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">Seluruh data pemeliharaan aset, dikelompokkan berdasarkan waktu</p>

                            {pemeliharaanTimeline.length === 0 ? (
                                <div className="text-center py-16">
                                    <ClockIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg font-semibold text-gray-500">Belum ada riwayat pemeliharaan</p>
                                    <p className="text-sm text-gray-400 mt-1">Data akan muncul setelah aset dijadwalkan pemeliharaan</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {pemeliharaanTimeline.map((group) => (
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
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Deskripsi</th>
                                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Biaya</th>
                                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Tgl Selesai</th>
                                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 bg-white">
                                                        {group.items.map((item) => {
                                                            const status = getStatusPemeliharaan(item);
                                                            return (
                                                                <tr key={item.pemeliharaan_id} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                                                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-700">{item.aset?.kode_aset || "-"}</td>
                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.aset?.nama_aset || "-"}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.deskripsi}</td>
                                                                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">{formatRupiah(item.biaya)}</td>
                                                                    <td className="px-4 py-3 text-center text-sm text-gray-700">{item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        {status === "Selesai" ? (
                                                                            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-500">Selesai</span>
                                                                        ) : (
                                                                            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-yellow-500">Berlangsung</span>
                                                                        )}
                                                                    </td>
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

            {/* ==================== MODAL DETAIL ==================== */}
            {detailOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl relative">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl text-white relative">
                            <button onClick={() => setDetailOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"><XMarkIcon className="w-6 h-6" /></button>
                            <h2 className="text-2xl font-bold">Detail Pemeliharaan</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Kode Aset</p><p className="font-bold text-gray-800">{selectedItem.aset?.kode_aset}</p></div>
                                <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Nama Aset</p><p className="font-bold text-gray-800">{selectedItem.aset?.nama_aset}</p></div>
                                <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Tanggal Mulai</p><p className="font-bold text-gray-800">{new Date(selectedItem.tanggal).toLocaleDateString("id-ID")}</p></div>
                                <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Tanggal Selesai</p><p className="font-bold text-gray-800">{selectedItem.tanggal_selesai ? new Date(selectedItem.tanggal_selesai).toLocaleDateString("id-ID") : "Belum selesai"}</p></div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Deskripsi</p><p className="text-gray-800">{selectedItem.deskripsi}</p></div>
                            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200"><p className="text-xs text-blue-600 mb-1 font-semibold">Total Biaya</p><p className="text-2xl font-bold text-blue-700">{formatRupiah(selectedItem.biaya)}</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}