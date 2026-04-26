// frontend/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
    Squares2X2Icon,
    ArchiveBoxIcon,
    UsersIcon,
    MapPinIcon,
    ClipboardDocumentCheckIcon,
    WrenchScrewdriverIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ChartBarIcon,
    CalendarIcon,
    ArrowPathIcon,
    XCircleIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, LineChart, Line,
} from "recharts";

const COLORS_PIE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const COLORS_PRIORITAS = { Tinggi: "#ef4444", Sedang: "#f59e0b", Rendah: "#84cc16" };

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [asets, setAsets] = useState([]);
    const [lokasis, setLokasis] = useState([]);
    const [penilaians, setPenilaians] = useState([]);
    const [pemeliharaans, setPemeliharaans] = useState([]);
    const [statistikPemeliharaan, setStatistikPemeliharaan] = useState({});

    const user = JSON.parse(localStorage.getItem("user")) || { username: "User", role: "Petugas" };

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [uRes, aRes, lRes, pRes, mRes, sRes] = await Promise.all([
                fetch("http://127.0.0.1:8000/api/users"),
                fetch("http://127.0.0.1:8000/api/asets"),
                fetch("http://127.0.0.1:8000/api/lokasis"),
                fetch("http://127.0.0.1:8000/api/penilaians"),
                fetch("http://127.0.0.1:8000/api/pemeliharaans"),
                fetch("http://127.0.0.1:8000/api/pemeliharaans/statistik"),
            ]);
            const [uD, aD, lD, pD, mD, sD] = await Promise.all([
                uRes.json(), aRes.json(), lRes.json(), pRes.json(), mRes.json(), sRes.json(),
            ]);
            setUsers(uD.data || uD || []);
            setAsets(aD.data || []);
            setLokasis(lD.data || []);
            setPenilaians(pD.data || []);
            setPemeliharaans(mD.data || []);
            setStatistikPemeliharaan(sD || {});
        } catch (err) {
            console.error("❌ Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ==================== COMPUTED DATA ====================
    const formatRupiah = (angka) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);

    const getPrioritas = (nilai) => {
        if (nilai >= 70) return "Tinggi";
        if (nilai >= 45) return "Sedang";
        return "Rendah";
    };

    const getStatusPemeliharaan = (item) => {
        if (!item.tanggal_selesai) return "Berlangsung";
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tgl = new Date(item.tanggal_selesai); tgl.setHours(0, 0, 0, 0);
        return today >= tgl ? "Selesai" : "Berlangsung";
    };

    // Aset stats
    const asetAktif = asets.filter(a => a.status === "Aktif").length;
    const asetNonAktif = asets.filter(a => a.status === "Non-Aktif").length;
    const asetIntra = asets.filter(a => a.status_inventaris === "INTRA").length;
    const asetExtra = asets.filter(a => a.status_inventaris === "EXTRA").length;
    const totalNilaiAset = asets.reduce((sum, a) => sum + (parseFloat(a.nilai_aset) || 0), 0);

    // Kondisi aset
    const kondisiBaik = asets.filter(a => a.kondisi === "Baik").length;
    const kondisiRingan = asets.filter(a => a.kondisi === "Rusak Ringan").length;
    const kondisiBerat = asets.filter(a => a.kondisi === "Rusak Berat").length;

    // Prioritas penilaian
    const prioritasTinggi = penilaians.filter(p => p.total_nilai >= 70).length;
    const prioritasSedang = penilaians.filter(p => p.total_nilai >= 45 && p.total_nilai < 70).length;
    const prioritasRendah = penilaians.filter(p => p.total_nilai < 45).length;

    // Pemeliharaan
    const pemeliharaanSelesai = pemeliharaans.filter(p => getStatusPemeliharaan(p) === "Selesai").length;
    const pemeliharaanBerlangsung = pemeliharaans.filter(p => getStatusPemeliharaan(p) === "Berlangsung").length;
    const totalBiayaPemeliharaan = pemeliharaans.reduce((sum, p) => sum + (parseFloat(p.biaya) || 0), 0);

    // User roles
    const adminCount = users.filter(u => u.role === "Administrator").length;
    const petugasCount = users.filter(u => u.role === "Petugas").length;
    const pimpinanCount = users.filter(u => u.role === "Pimpinan").length;

    // ==================== CHART DATA ====================
    // Aset by kondisi pie
    const kondisiData = [
        { name: "Baik", value: kondisiBaik, color: "#10b981" },
        { name: "Rusak Ringan", value: kondisiRingan, color: "#f59e0b" },
        { name: "Rusak Berat", value: kondisiBerat, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Status aset pie
    const statusAsetData = [
        { name: "Aktif", value: asetAktif, color: "#10b981" },
        { name: "Non-Aktif", value: asetNonAktif, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Prioritas bar
    const prioritasData = [
        { name: "Tinggi", jumlah: prioritasTinggi, fill: "#ef4444" },
        { name: "Sedang", jumlah: prioritasSedang, fill: "#f59e0b" },
        { name: "Rendah", jumlah: prioritasRendah, fill: "#84cc16" },
    ];

    // Aset per lokasi bar
    const asetPerLokasi = lokasis
        .map(l => ({
            name: l.nama_lokasi?.length > 15 ? l.nama_lokasi.substring(0, 15) + "..." : l.nama_lokasi,
            jumlah: l.asets_count ?? 0,
        }))
        .sort((a, b) => b.jumlah - a.jumlah)
        .slice(0, 8);

    // User role pie
    const roleData = [
        { name: "Administrator", value: adminCount, color: "#8b5cf6" },
        { name: "Petugas", value: petugasCount, color: "#f59e0b" },
        { name: "Pimpinan", value: pimpinanCount, color: "#10b981" },
    ].filter(d => d.value > 0);

    // Pemeliharaan status pie
    const pemeliharaanStatusData = [
        { name: "Selesai", value: pemeliharaanSelesai, color: "#10b981" },
        { name: "Berlangsung", value: pemeliharaanBerlangsung, color: "#f59e0b" },
    ].filter(d => d.value > 0);

    // Top 5 aset penilaian tertinggi
    const top5Penilaian = [...penilaians]
        .sort((a, b) => b.total_nilai - a.total_nilai)
        .slice(0, 5)
        .map(p => ({
            name: p.aset?.nama_aset?.length > 20 ? p.aset.nama_aset.substring(0, 20) + "..." : (p.aset?.nama_aset || "-"),
            nilai: p.total_nilai,
            fill: COLORS_PRIORITAS[getPrioritas(p.total_nilai)],
        }));

    // Inventaris type
    const inventarisData = [
        { name: "INTRA", value: asetIntra, color: "#8b5cf6" },
        { name: "EXTRA", value: asetExtra, color: "#f97316" },
    ].filter(d => d.value > 0);

    // Pemeliharaan terbaru
    const recentPemeliharaan = [...pemeliharaans]
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
        .slice(0, 5);

    // Penilaian terbaru
    const recentPenilaian = [...penilaians]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl px-4 py-3">
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm" style={{ color: p.color || p.fill }}>
                            {p.name}: <span className="font-semibold">{p.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // ==================== RENDER ====================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <ArrowPathIcon className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 text-lg font-medium">Memuat Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ==================== WELCOME BANNER ==================== */}
            <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-xl p-8 text-white overflow-hidden">
                
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-900/30 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-blue-400/20 rounded-full -mb-16 blur-xl"></div>
                <div className="absolute top-1/2 right-12 w-24 h-24 bg-white/5 rounded-full"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    {/* Left: Text */}
                    <div className="space-y-2">
                        <p className="text-blue-300 text-sm font-medium tracking-widest uppercase">
                            Dashboard Inventaris
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Selamat Datang, {user.username} 👋
                        </h1>
                        <p className="text-blue-200 text-sm max-w-md">
                            Sistem Manajemen Aset — Ringkasan data terkini
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                            <span className="text-blue-300 text-xs">
                                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </span>
                        </div>
                    </div>

                    {/* Right: Button */}
                    <button
                        onClick={fetchAll}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm rounded-xl transition-all duration-200 font-medium text-sm shrink-0"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Refresh Data
                    </button>

                </div>
            </div>

            {/* ==================== MAIN STAT CARDS ==================== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Total Aset", value: asets.length, icon: ArchiveBoxIcon, gradient: "from-blue-500 to-blue-700" },
                    { label: "Aset Aktif", value: asetAktif, icon: CheckCircleIcon, gradient: "from-emerald-500 to-emerald-700" },
                    { label: "Total Lokasi", value: lokasis.length, icon: MapPinIcon, gradient: "from-amber-500 to-amber-700" },
                    { label: "Total Penilaian", value: penilaians.length, icon: ClipboardDocumentCheckIcon, gradient: "from-purple-500 to-purple-700" },
                    { label: "Pemeliharaan", value: pemeliharaans.length, icon: WrenchScrewdriverIcon, gradient: "from-cyan-500 to-cyan-700" },
                    { label: "Total User", value: users.length, icon: UsersIcon, gradient: "from-pink-500 to-pink-700" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-xl p-5 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300`}>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <p className="text-xs opacity-90 font-medium">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <Icon className="absolute bottom-3 right-3 w-10 h-10 opacity-20" />
                        </div>
                    );
                })}
            </div>

            {/* ==================== FINANCIAL OVERVIEW ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Nilai Aset</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(totalNilaiAset)}</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <CurrencyDollarIcon className="w-7 h-7 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                            {asets.length} aset
                        </span>
                        <span className="text-gray-400">terdaftar</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Biaya Pemeliharaan</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(totalBiayaPemeliharaan)}</p>
                        </div>
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <WrenchScrewdriverIcon className="w-7 h-7 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                            <ClockIcon className="w-4 h-4" />
                            {pemeliharaanBerlangsung} berlangsung
                        </span>
                        <span className="text-gray-400">saat ini</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Perlu Perhatian</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{prioritasTinggi}</p>
                        </div>
                        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                            Prioritas Tinggi
                        </span>
                        <span className="text-gray-400">perlu segera</span>
                    </div>
                </div>
            </div>

            {/* ==================== CHARTS ROW 1 ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Aset per Lokasi */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-amber-500" />
                        Distribusi Aset per Lokasi
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Top 8 lokasi dengan aset terbanyak</p>
                    {asetPerLokasi.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={asetPerLokasi} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="jumlah" name="Jumlah Aset" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">Belum ada data lokasi</div>
                    )}
                </div>

                {/* Prioritas Penilaian */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-purple-500" />
                        Distribusi Prioritas Penilaian
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Berdasarkan metode Fuzzy-MARCOS</p>
                    {penilaians.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prioritasData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="jumlah" name="Jumlah">
                                    {prioritasData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.fill} radius={[6, 6, 0, 0]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">Belum ada penilaian</div>
                    )}
                </div>
            </div>

            {/* ==================== CHARTS ROW 2: PIE CHARTS ==================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Kondisi Aset */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <ArchiveBoxIcon className="w-4 h-4 text-blue-500" />
                        Kondisi Aset
                    </h3>
                    {kondisiData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={kondisiData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                                        {kondisiData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {kondisiData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
                    )}
                </div>

                {/* Status Aset */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                        Status Aset
                    </h3>
                    {statusAsetData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={statusAsetData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                                        {statusAsetData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {statusAsetData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
                    )}
                </div>

                {/* Status Pemeliharaan */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-4 h-4 text-cyan-500" />
                        Pemeliharaan
                    </h3>
                    {pemeliharaanStatusData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={pemeliharaanStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                                        {pemeliharaanStatusData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {pemeliharaanStatusData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
                    )}
                </div>

                {/* User Roles */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-pink-500" />
                        Role User
                    </h3>
                    {roleData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                                        {roleData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {roleData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
                    )}
                </div>
            </div>

            {/* ==================== TOP 5 PENILAIAN + INVENTARIS ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top 5 Aset Prioritas Tertinggi */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        Top 5 Aset Prioritas Tertinggi
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Aset yang paling membutuhkan pemeliharaan</p>
                    {top5Penilaian.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={top5Penilaian} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="nilai" name="Total Nilai" radius={[0, 6, 6, 0]}>
                                    {top5Penilaian.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400">Belum ada data penilaian</div>
                    )}
                </div>

                {/* Inventaris Type */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <Squares2X2Icon className="w-5 h-5 text-purple-500" />
                        Status Inventaris
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Distribusi INTRA vs EXTRA</p>
                    {inventarisData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={inventarisData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {inventarisData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-3">
                                {inventarisData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: d.color }}></div>
                                            <span className="text-sm text-gray-600 font-medium">{d.name}</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
                    )}
                </div>
            </div>

            {/* ==================== RECENT ACTIVITIES ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pemeliharaan Terbaru */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-700 px-6 py-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <WrenchScrewdriverIcon className="w-5 h-5" />
                            Pemeliharaan Terbaru
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentPemeliharaan.length > 0 ? recentPemeliharaan.map((item, i) => {
                            const status = getStatusPemeliharaan(item);
                            return (
                                <div key={i} className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {item.aset?.nama_aset || "-"}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{item.deskripsi}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full text-white ${status === "Selesai" ? "bg-green-500" : "bg-yellow-500"}`}>
                                            {status}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-700">
                                            {formatRupiah(item.biaya)}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="px-6 py-10 text-center text-gray-400 text-sm">Belum ada data pemeliharaan</div>
                        )}
                    </div>
                </div>

                {/* Penilaian Terbaru */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-700 px-6 py-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                            Penilaian Terbaru
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentPenilaian.length > 0 ? recentPenilaian.map((item, i) => {
                            const prioritas = getPrioritas(item.total_nilai);
                            return (
                                <div key={i} className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {item.aset?.nama_aset || "-"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Kode: {item.aset?.kode_aset || "-"} • Penilai: {item.user?.username || "-"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full text-white ${prioritas === "Tinggi" ? "bg-red-500" : prioritas === "Sedang" ? "bg-yellow-500" : "bg-lime-500"}`}>
                                            {prioritas}
                                        </span>
                                        <span className="text-lg font-bold text-gray-800">
                                            {item.total_nilai}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="px-6 py-10 text-center text-gray-400 text-sm">Belum ada data penilaian</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ==================== QUICK SUMMARY FOOTER ==================== */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-400" />
                    Ringkasan Cepat
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: "Aset Baik", value: kondisiBaik, color: "text-emerald-400" },
                        { label: "Rusak Ringan", value: kondisiRingan, color: "text-yellow-400" },
                        { label: "Rusak Berat", value: kondisiBerat, color: "text-red-400" },
                        { label: "Prioritas Tinggi", value: prioritasTinggi, color: "text-red-400" },
                        { label: "Sedang Dipelihara", value: pemeliharaanBerlangsung, color: "text-amber-400" },
                        { label: "Selesai Dipelihara", value: pemeliharaanSelesai, color: "text-emerald-400" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition">
                            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                            <p className="text-xs text-gray-300 mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
