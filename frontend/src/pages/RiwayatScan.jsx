import React, { useState, useEffect } from "react";
import {
    QrCodeIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ArrowPathIcon,
    MapPinIcon,
    UserIcon,
    ArchiveBoxIcon,
    ClockIcon,
    TrashIcon,
    FunnelIcon,
    SignalIcon,
    EyeIcon,
} from "@heroicons/react/24/solid";
import { useToast } from "../components/Toast";

export default function RiwayatScan() {
    const [scans, setScans] = useState([]);
    const [asets, setAsets] = useState([]);
    const [lokasis, setLokasis] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterLokasi, setFilterLokasi] = useState("Semua");
    const [filterTanggal, setFilterTanggal] = useState("");
    const [filterWaktu, setFilterWaktu] = useState("Semua");
    const { showToast, showConfirm } = useToast();

    // Form state
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ aset_id: "", lokasi_id: "" });
    const [searchAset, setSearchAset] = useState("");
    const [scanMode, setScanMode] = useState("bulk"); // "manual" or "bulk"
    const [rfidInput, setRfidInput] = useState("");
    const [rfidList, setRfidList] = useState([]);

    // Detail modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedScan, setSelectedScan] = useState(null);

    const user = JSON.parse(localStorage.getItem("user")) || { id: 1, username: "Guest", role: "Petugas" };

    const API = "http://127.0.0.1:8000/api";

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [scanRes, asetRes, lokasiRes, userRes] = await Promise.all([
                fetch(`${API}/riwayat-scans`).then(r => r.json()),
                fetch(`${API}/asets`).then(r => r.json()),
                fetch(`${API}/lokasis`).then(r => r.json()),
                fetch(`${API}/users`).then(r => r.json()),
            ]);
            setScans(scanRes.data || []);
            setAsets(asetRes.data || asetRes || []);
            setLokasis(lokasiRes.data || lokasiRes || []);
            setUsers(userRes.data || userRes || []);
        } catch (err) {
            console.error(err);
            showToast("Gagal memuat data", "error");
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/riwayat-scans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    aset_id: formData.aset_id,
                    lokasi_id: formData.lokasi_id,
                    user_id: user.id,
                }),
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
            showToast("Scan berhasil dicatat!", "success");
            setModalOpen(false);
            setFormData({ aset_id: "", lokasi_id: "" });
            setSearchAset("");
            fetchAll();
        } catch (err) {
            showToast(err.message || "Gagal menyimpan data scan", "error");
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        if (rfidList.length === 0) {
            showToast("Belum ada RFID yang discan", "error");
            return;
        }
        try {
            const res = await fetch(`${API}/bulk-scan-rfid`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lokasi_id: formData.lokasi_id,
                    rfid_list: rfidList,
                    user_id: user.id,
                }),
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
            const data = await res.json();

            let message = `Berhasil scan: ${data.total_success || 0} aset.`;
            if (data.total_not_found > 0) {
                message += ` Tidak ditemukan: ${data.total_not_found} RFID.`;
                showToast(message, "warning");
            } else {
                showToast(message, "success");
            }

            setModalOpen(false);
            setRfidList([]);
            setFormData({ aset_id: "", lokasi_id: "" });
            fetchAll();
        } catch (err) {
            showToast(err.message || "Gagal menyimpan bulk scan", "error");
        }
    };

    const handleRfidKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const tag = rfidInput.trim();
            if (tag) {
                if (!rfidList.includes(tag)) {
                    setRfidList([tag, ...rfidList]);
                }
                setRfidInput("");
            }
        }
    };

    const handleDelete = (id) => {
        showConfirm("Apakah Anda yakin ingin menghapus data scan ini?", async () => {
            try {
                await fetch(`${API}/riwayat-scans/${id}`, { method: "DELETE" });
                showToast("Data scan berhasil dihapus", "success");
                fetchAll();
            } catch (err) {
                showToast("Gagal menghapus data", "error");
            }
        });
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

    // ==================== FILTERS ====================
    const filteredScans = scans.filter((s) => {
        const keyword = search.toLowerCase();
        const matchSearch =
            s.aset?.nama_aset?.toLowerCase().includes(keyword) ||
            s.aset?.kode_aset?.toLowerCase().includes(keyword) ||
            s.aset?.rfid_tag?.toLowerCase().includes(keyword) ||
            s.lokasi?.nama_lokasi?.toLowerCase().includes(keyword) ||
            s.user?.username?.toLowerCase().includes(keyword);
        const matchLokasi = filterLokasi === "Semua" || String(s.lokasi_id) === filterLokasi;
        const matchTanggal = !filterTanggal || s.created_at?.startsWith(filterTanggal);
        const matchWaktu = filterWaktu === "Semua" || getTimelineGroup(s.created_at) === filterWaktu;
        return matchSearch && matchLokasi && matchTanggal && matchWaktu;
    });

    const filteredAsetList = asets.filter((a) => {
        const q = searchAset.toLowerCase();
        return a.nama_aset?.toLowerCase().includes(q) || a.kode_aset?.toLowerCase().includes(q) || a.rfid_tag?.toLowerCase().includes(q);
    });

    const hasActiveFilter = filterLokasi !== "Semua" || filterTanggal !== "" || filterWaktu !== "Semua";

    const resetFilters = () => { setSearch(""); setFilterLokasi("Semua"); setFilterTanggal(""); setFilterWaktu("Semua"); };

    const formatWaktu = (dt) => {
        if (!dt) return "-";
        return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const scanTimeline = groupByTimeline(filteredScans, "created_at");

    const inputGlass = `w-full mt-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400`;

    return (
        <div className="space-y-6">
            {/* ================= STAT CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Total Scan</p>
                        <p className="text-4xl font-bold mt-2">{scans.length}</p>
                    </div>
                    <SignalIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>

                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Scan Hari Ini</p>
                        <p className="text-4xl font-bold mt-2">{scans.filter((s) => s.created_at?.startsWith(new Date().toISOString().slice(0, 10))).length}</p>
                    </div>
                    <ClockIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>

                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Lokasi Terscan</p>
                        <p className="text-4xl font-bold mt-2">{new Set(scans.map((s) => s.lokasi_id)).size}</p>
                    </div>
                    <MapPinIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>

                <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-sm opacity-90 font-medium">Aset Terscan</p>
                        <p className="text-4xl font-bold mt-2">{new Set(scans.map((s) => s.aset_id)).size}</p>
                    </div>
                    <ArchiveBoxIcon className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
                </div>
            </div>

            {/* ================= HEADER ================= */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <SignalIcon className="w-7 h-7 text-blue-600" />
                            Riwayat Scan RFID
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Pantau aktivitas pemindaian aset menggunakan RFID</p>
                    </div>
                    <button
                        onClick={() => { setModalOpen(true); setScanMode("bulk"); setFormData({ aset_id: "", lokasi_id: "" }); setSearchAset(""); setRfidList([]); setRfidInput(""); }}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                    >
                        <SignalIcon className="w-5 h-5" />
                        Input Scan Baru
                    </button>
                </div>
            </div>

            {/* ================= FILTER BAR ================= */}
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <FunnelIcon className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-800">Filter & Pencarian</h3>
                    {hasActiveFilter && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Filter Aktif</span>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">Cari Aset / RFID / Lokasi</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Ketik untuk mencari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">Filter Lokasi</label>
                        <select value={filterLokasi} onChange={(e) => setFilterLokasi(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                            <option value="Semua">Semua Lokasi</option>
                            {lokasis.map((l) => <option key={l.id} value={String(l.id)}>{l.nama_lokasi}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">Filter Tanggal</label>
                        <input type="date" value={filterTanggal} onChange={(e) => { setFilterTanggal(e.target.value); setFilterWaktu("Semua"); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition text-sm flex items-center justify-center gap-1">
                            <XMarkIcon className="w-4 h-4" /> Reset Filter
                        </button>
                    </div>
                </div>
                {/* Quick Time Filter */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {["Semua", "Hari Ini", "Kemarin", "Minggu Ini", "Bulan Ini", "Bulan Lalu", "Lebih Lama"].map((waktu) => {
                        const isActive = filterWaktu === waktu;
                        const colors = {
                            "Semua": "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300",
                            "Hari Ini": "bg-green-50 text-green-700 hover:bg-green-100 border-green-300",
                            "Kemarin": "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-300",
                            "Minggu Ini": "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-300",
                            "Bulan Ini": "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-300",
                            "Bulan Lalu": "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-300",
                            "Lebih Lama": "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-300",
                        };
                        const activeColors = {
                            "Semua": "bg-gray-700 text-white border-gray-700",
                            "Hari Ini": "bg-green-600 text-white border-green-600",
                            "Kemarin": "bg-blue-600 text-white border-blue-600",
                            "Minggu Ini": "bg-indigo-600 text-white border-indigo-600",
                            "Bulan Ini": "bg-yellow-500 text-white border-yellow-500",
                            "Bulan Lalu": "bg-orange-500 text-white border-orange-500",
                            "Lebih Lama": "bg-gray-500 text-white border-gray-500",
                        };
                        return (
                            <button
                                key={waktu}
                                onClick={() => { setFilterWaktu(waktu); setFilterTanggal(""); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${isActive ? activeColors[waktu] : colors[waktu]}`}
                            >
                                {waktu === "Semua" ? "📋 Semua" : `${timelineConfig[waktu]?.icon || ""} ${waktu}`}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                    Menampilkan <span className="font-bold text-gray-800">{filteredScans.length}</span> dari <span className="font-bold">{scans.length}</span> data scan
                </div>
            </div>

            {/* ================= TABEL ================= */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-blue-600 overflow-x-auto">
                {loading ? (
                    <div className="text-center py-20">
                        <ArrowPathIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600 font-medium">Loading data scan...</p>
                    </div>
                ) : scanTimeline.length === 0 ? (
                    <div className="text-center py-16">
                        <QrCodeIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-semibold text-gray-500">Belum ada data scan</p>
                        <p className="text-sm text-gray-400 mt-1">Klik "Input Scan Baru" untuk mencatat pemindaian RFID</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {scanTimeline.map((group) => (
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
                                                <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">No</th>
                                                <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">Kode Aset</th>
                                                <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">Nama Aset</th>
                                                <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">RFID Tag</th>
                                                <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">Lokasi</th>
                                                <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase">User</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">Waktu</th>
                                                <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {group.items.map((scan, index) => (
                                                <tr key={scan.scan_id} className="hover:bg-cyan-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-700">{scan.aset?.kode_aset || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{scan.aset?.nama_aset || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full text-xs font-mono">{scan.aset?.rfid_tag || "-"}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        <div className="flex items-center gap-1">
                                                            <MapPinIcon className="w-4 h-4 text-cyan-500" />
                                                            {scan.lokasi?.nama_lokasi || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        <div className="flex items-center gap-1">
                                                            <UserIcon className="w-4 h-4 text-gray-400" />
                                                            {scan.user?.username || scan.user?.nama || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-600">{formatWaktu(scan.created_at)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex gap-2 justify-center">
                                                            <button onClick={() => { setSelectedScan(scan); setDetailOpen(true); }} className="p-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition shadow-md" title="Detail">
                                                                <EyeIcon className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(scan.scan_id)} className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition shadow-md" title="Hapus">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= DETAIL MODAL ================= */}
            {detailOpen && selectedScan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] relative overflow-hidden">
                        {/* Decorative gradient orbs */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl"></div>

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
                                    <SignalIcon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Detail Scan RFID</h2>
                                    <p className="text-xs text-white/50 mt-0.5">{selectedScan.aset?.kode_aset || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-5 relative">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Kode Aset", value: selectedScan.aset?.kode_aset, color: "blue" },
                                    { label: "Nama Aset", value: selectedScan.aset?.nama_aset, color: "indigo" },
                                    { label: "RFID Tag", value: selectedScan.aset?.rfid_tag, color: "purple" },
                                    { label: "Lokasi Scan", value: selectedScan.lokasi?.nama_lokasi, color: "lime" },
                                    { label: "User", value: selectedScan.user?.username || selectedScan.user?.nama, color: "yellow" },
                                    { label: "Waktu Scan", value: formatWaktu(selectedScan.created_at), color: "cyan" },
                                ].map((item, i) => (
                                    <div key={i} className={`bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors duration-200 border-l-2 border-l-${item.color}-500/50`}>
                                        <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">{item.label}</p>
                                        <p className="text-white font-semibold mt-1 text-sm">{item.value || "-"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= FORM MODAL ================= */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="w-full max-w-lg bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative">
                        <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white transition">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <SignalIcon className="w-6 h-6 text-cyan-400" /> Input Scan RFID
                        </h2>

                        <div className="flex gap-2 mb-6">
                            <button onClick={() => setScanMode("bulk")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${scanMode === "bulk" ? "bg-cyan-500 text-white shadow-lg" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>Scan Otomatis (Bulk)</button>
                            <button onClick={() => setScanMode("manual")} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${scanMode === "manual" ? "bg-cyan-500 text-white shadow-lg" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>Manual Input</button>
                        </div>

                        <form onSubmit={scanMode === "manual" ? handleSubmit : handleBulkSubmit} className="space-y-4">
                            {/* LOKASI */}
                            <div>
                                <label className="text-white/80 text-sm">Lokasi Scan</label>
                                <select name="lokasi_id" value={formData.lokasi_id} onChange={(e) => setFormData({ ...formData, lokasi_id: e.target.value })} required className={inputGlass}>
                                    <option value="" className="text-black">-- Pilih Lokasi --</option>
                                    {lokasis.map((l) => <option key={l.id} value={l.id} className="text-black">{l.nama_lokasi}</option>)}
                                </select>
                            </div>

                            {scanMode === "manual" ? (
                                <>
                                    {/* ASET SEARCH */}
                                    <div>
                                        <label className="text-white/80 text-sm">Cari & Pilih Aset</label>
                                        <input
                                            type="text"
                                            placeholder="Ketik nama / kode / RFID aset..."
                                            value={searchAset}
                                            onChange={(e) => setSearchAset(e.target.value)}
                                            className={inputGlass}
                                        />
                                        {searchAset && (
                                            <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-[#0f172a]/90">
                                                {filteredAsetList.slice(0, 10).map((a) => (
                                                    <button
                                                        key={a.id}
                                                        type="button"
                                                        onClick={() => { setFormData({ ...formData, aset_id: a.id }); setSearchAset(`${a.kode_aset} - ${a.nama_aset}`); }}
                                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition ${formData.aset_id === a.id ? "bg-cyan-500/20 text-cyan-300" : "text-white/70"}`}
                                                    >
                                                        <span className="font-mono text-cyan-400">{a.kode_aset}</span> — {a.nama_aset}
                                                        <span className="text-white/30 text-xs ml-2">({a.rfid_tag})</span>
                                                    </button>
                                                ))}
                                                {filteredAsetList.length === 0 && <p className="text-center text-white/40 text-sm py-3">Aset tidak ditemukan</p>}
                                            </div>
                                        )}
                                        {formData.aset_id && (
                                            <p className="text-xs text-cyan-400 mt-1">✓ Aset dipilih: ID #{formData.aset_id}</p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!formData.aset_id || !formData.lokasi_id}
                                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50"
                                    >
                                        Simpan Data Scan
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* RFID BULK SCAN */}
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-500/50 rounded-xl bg-cyan-500/5 relative overflow-hidden group mt-4">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <QrCodeIcon className="w-16 h-16 text-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse" />
                                        <p className="text-white/90 font-bold text-lg mb-1 z-10">Mulai Scan RFID</p>
                                        <p className="text-white/50 text-xs text-center mb-4 z-10">Arahkan kursor ke area input di bawah ini dan dekatkan kartu ke reader</p>

                                        <input
                                            type="text"
                                            placeholder="[ Menunggu Input Scan... ]"
                                            value={rfidInput}
                                            onChange={(e) => setRfidInput(e.target.value)}
                                            onKeyDown={handleRfidKeyDown}
                                            autoFocus
                                            className="w-full max-w-xs px-4 py-3 text-center bg-black/40 border border-cyan-500/50 rounded-lg text-cyan-300 font-mono tracking-widest placeholder-cyan-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent shadow-inner z-10 relative"
                                        />
                                    </div>

                                    {/* SCANNED RFID LIST */}
                                    {rfidList.length > 0 && (
                                        <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-white/80 text-sm font-semibold">Berhasil di-scan: {rfidList.length}</p>
                                                <button type="button" onClick={() => setRfidList([])} className="text-xs text-red-400 hover:text-red-300 transition">Reset Scan</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                                {rfidList.map((tag, idx) => (
                                                    <span key={idx} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs font-mono border border-cyan-500/30">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!formData.lokasi_id || rfidList.length === 0}
                                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50"
                                    >
                                        Simpan Semua Scan ({rfidList.length})
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
