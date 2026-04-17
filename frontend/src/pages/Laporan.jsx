// frontend/pages/Laporan.jsx
import React, { useEffect, useState } from "react";
import {
    DocumentTextIcon,
    TableCellsIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    UsersIcon,
    ArchiveBoxIcon,
    MapPinIcon,
    ClipboardDocumentCheckIcon,
    WrenchScrewdriverIcon,
    DocumentChartBarIcon,
    PrinterIcon,
} from "@heroicons/react/24/solid";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// ==================== TAB CONFIGURATION ====================
const TABS = [
    { key: "user", label: "User", icon: UsersIcon, color: "from-blue-500 to-blue-700" },
    { key: "aset", label: "Aset", icon: ArchiveBoxIcon, color: "from-indigo-500 to-indigo-700" },
    { key: "lokasi", label: "Lokasi", icon: MapPinIcon, color: "from-yellow-500 to-yellow-700" },
    { key: "penilaian", label: "Penilaian", icon: ClipboardDocumentCheckIcon, color: "from-purple-500 to-purple-700" },
    { key: "pemeliharaan", label: "Pemeliharaan", icon: WrenchScrewdriverIcon, color: "from-green-500 to-green-700" },
];

export default function Laporan() {
    // ==================== STATE ====================
    const [activeTab, setActiveTab] = useState("user");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Data states
    const [users, setUsers] = useState([]);
    const [asets, setAsets] = useState([]);
    const [lokasis, setLokasis] = useState([]);
    const [penilaians, setPenilaians] = useState([]);
    const [pemeliharaans, setPemeliharaans] = useState([]);

    // ==================== FETCH DATA ====================
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [userRes, asetRes, lokasiRes, penilaianRes, pemeliharaanRes] =
                await Promise.all([
                    fetch("http://127.0.0.1:8000/api/users"),
                    fetch("http://127.0.0.1:8000/api/asets"),
                    fetch("http://127.0.0.1:8000/api/lokasis"),
                    fetch("http://127.0.0.1:8000/api/penilaians"),
                    fetch("http://127.0.0.1:8000/api/pemeliharaans"),
                ]);

            const [userData, asetData, lokasiData, penilaianData, pemeliharaanData] =
                await Promise.all([
                    userRes.json(),
                    asetRes.json(),
                    lokasiRes.json(),
                    penilaianRes.json(),
                    pemeliharaanRes.json(),
                ]);

            setUsers(userData.data || userData || []);
            setAsets(asetData.data || []);
            setLokasis(lokasiData.data || []);
            setPenilaians(penilaianData.data || []);
            setPemeliharaans(pemeliharaanData.data || []);
        } catch (err) {
            console.error("❌ Fetch error:", err);
            alert("Gagal memuat data: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ==================== HELPERS ====================
    const formatRupiah = (angka) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka || 0);

    const formatTanggal = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getPrioritas = (nilai) => {
        if (nilai >= 70) return "Tinggi";
        if (nilai >= 45) return "Sedang";
        return "Rendah";
    };

    const getStatusPemeliharaan = (item) => {
        if (!item.tanggal_selesai) return "Berlangsung";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tglSelesai = new Date(item.tanggal_selesai);
        tglSelesai.setHours(0, 0, 0, 0);
        return today >= tglSelesai ? "Selesai" : "Berlangsung";
    };

    // ==================== TABLE DEFINITIONS ====================
    const tableConfig = {
        user: {
            title: "Laporan Data User",
            columns: ["No", "Username", "Nama", "Role"],
            getData: () => {
                const keyword = search.toLowerCase();
                return users.filter(
                    (u) =>
                        u.nama?.toLowerCase().includes(keyword) ||
                        u.username?.toLowerCase().includes(keyword) ||
                        u.role?.toLowerCase().includes(keyword)
                );
            },
            renderRow: (item, index) => [
                index + 1,
                item.username,
                item.nama,
                item.role,
            ],
            exportRow: (item, index) => ({
                No: index + 1,
                Username: item.username,
                Nama: item.nama,
                Role: item.role,
            }),
        },
        aset: {
            title: "Laporan Data Aset",
            columns: ["No", "Kode Aset", "Nama Aset", "Jenis", "Kondisi", "Nilai Aset", "Lokasi", "Status", "Tgl Masuk"],
            getData: () => {
                const keyword = search.toLowerCase();
                return asets.filter(
                    (a) =>
                        a.nama_aset?.toLowerCase().includes(keyword) ||
                        a.kode_aset?.toLowerCase().includes(keyword) ||
                        a.jenis_aset?.toLowerCase().includes(keyword) ||
                        a.lokasi?.nama_lokasi?.toLowerCase().includes(keyword)
                );
            },
            renderRow: (item, index) => [
                index + 1,
                item.kode_aset,
                item.nama_aset,
                item.jenis_aset,
                item.kondisi,
                formatRupiah(item.nilai_aset),
                item.lokasi?.nama_lokasi || "-",
                item.status,
                formatTanggal(item.tanggal_masuk),
            ],
            exportRow: (item, index) => ({
                No: index + 1,
                "Kode Aset": item.kode_aset,
                "Nama Aset": item.nama_aset,
                Jenis: item.jenis_aset,
                Kondisi: item.kondisi,
                "Nilai Aset": item.nilai_aset,
                Lokasi: item.lokasi?.nama_lokasi || "-",
                Status: item.status,
                "Tgl Masuk": formatTanggal(item.tanggal_masuk),
            }),
        },
        lokasi: {
            title: "Laporan Data Lokasi",
            columns: ["No", "Nama Lokasi", "Deskripsi", "Jumlah Aset"],
            getData: () => {
                const keyword = search.toLowerCase();
                return lokasis.filter((l) =>
                    l.nama_lokasi?.toLowerCase().includes(keyword)
                );
            },
            renderRow: (item, index) => [
                index + 1,
                item.nama_lokasi,
                item.deskripsi || "-",
                item.asets_count ?? 0,
            ],
            exportRow: (item, index) => ({
                No: index + 1,
                "Nama Lokasi": item.nama_lokasi,
                Deskripsi: item.deskripsi || "-",
                "Jumlah Aset": item.asets_count ?? 0,
            }),
        },
        penilaian: {
            title: "Laporan Data Penilaian",
            columns: ["No", "Kode Aset", "Nama Aset", "Kondisi Fisik", "Usia Pemakaian", "Frekuensi", "Urgensi", "Total Nilai", "Prioritas", "Penilai", "Tanggal"],
            getData: () => {
                const keyword = search.toLowerCase();
                return penilaians.filter(
                    (p) =>
                        p.aset?.nama_aset?.toLowerCase().includes(keyword) ||
                        p.aset?.kode_aset?.toLowerCase().includes(keyword) ||
                        p.user?.username?.toLowerCase().includes(keyword)
                );
            },
            renderRow: (item, index) => [
                index + 1,
                item.aset?.kode_aset || "-",
                item.aset?.nama_aset || "-",
                item.kondisi_penilaian || "-",
                item.usia_pemakaian_aset || "-",
                item.frekuensi_penggunaan || "-",
                item.tingkat_urgensi || "-",
                item.total_nilai,
                getPrioritas(item.total_nilai),
                item.user?.username || "-",
                formatTanggal(item.created_at),
            ],
            exportRow: (item, index) => ({
                No: index + 1,
                "Kode Aset": item.aset?.kode_aset || "-",
                "Nama Aset": item.aset?.nama_aset || "-",
                "Kondisi Fisik": item.kondisi_penilaian || "-",
                "Usia Pemakaian": item.usia_pemakaian_aset || "-",
                Frekuensi: item.frekuensi_penggunaan || "-",
                Urgensi: item.tingkat_urgensi || "-",
                "Total Nilai": item.total_nilai,
                Prioritas: getPrioritas(item.total_nilai),
                Penilai: item.user?.username || "-",
                Tanggal: formatTanggal(item.created_at),
            }),
        },
        pemeliharaan: {
            title: "Laporan Data Pemeliharaan",
            columns: ["No", "Kode Aset", "Nama Aset", "Deskripsi", "Biaya", "Tgl Mulai", "Tgl Selesai", "Status"],
            getData: () => {
                const keyword = search.toLowerCase();
                return pemeliharaans.filter(
                    (p) =>
                        p.aset?.nama_aset?.toLowerCase().includes(keyword) ||
                        p.aset?.kode_aset?.toLowerCase().includes(keyword) ||
                        p.deskripsi?.toLowerCase().includes(keyword)
                );
            },
            renderRow: (item, index) => [
                index + 1,
                item.aset?.kode_aset || "-",
                item.aset?.nama_aset || "-",
                item.deskripsi,
                formatRupiah(item.biaya),
                formatTanggal(item.tanggal),
                formatTanggal(item.tanggal_selesai),
                getStatusPemeliharaan(item),
            ],
            exportRow: (item, index) => ({
                No: index + 1,
                "Kode Aset": item.aset?.kode_aset || "-",
                "Nama Aset": item.aset?.nama_aset || "-",
                Deskripsi: item.deskripsi,
                Biaya: item.biaya,
                "Tgl Mulai": formatTanggal(item.tanggal),
                "Tgl Selesai": formatTanggal(item.tanggal_selesai),
                Status: getStatusPemeliharaan(item),
            }),
        },
    };

    const config = tableConfig[activeTab];
    const filteredData = config.getData();

    // ==================== EXPORT PDF ====================
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });

        // Header
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(config.title, 14, 20);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Tanggal cetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 28);
        doc.text(`Total data: ${filteredData.length}`, 14, 34);

        // Table
        const tableData = filteredData.map((item, index) => config.renderRow(item, index));

        doc.autoTable({
            head: [config.columns],
            body: tableData,
            startY: 40,
            theme: "grid",
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 8,
                halign: "center",
            },
            bodyStyles: {
                fontSize: 7.5,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250],
            },
            styles: {
                lineColor: [200, 200, 200],
                lineWidth: 0.3,
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
            },
            margin: { top: 40, left: 14, right: 14 },
            didDrawPage: (data) => {
                // Footer
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Halaman ${data.pageNumber} dari ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: "center" }
                );
                doc.text(
                    "Sistem Inventaris Aset - Laporan Otomatis",
                    14,
                    doc.internal.pageSize.height - 10
                );
            },
        });

        doc.save(`${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    // ==================== EXPORT EXCEL ====================
    const exportExcel = () => {
        const exportData = filteredData.map((item, index) => config.exportRow(item, index));

        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const colWidths = config.columns.map((col) => ({ wch: Math.max(col.length + 5, 15) }));
        ws["!cols"] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
        XLSX.writeFile(wb, `${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    // ==================== STAT COUNTS ====================
    const dataCounts = {
        user: users.length,
        aset: asets.length,
        lokasi: lokasis.length,
        penilaian: penilaians.length,
        pemeliharaan: pemeliharaans.length,
    };

    // ==================== RENDER ====================
    return (
        <div className="space-y-6">
            {/* ==================== HEADER ==================== */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <DocumentChartBarIcon className="w-8 h-8 text-blue-600" />
                            Laporan Data
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Lihat dan export laporan dari seluruh data sistem inventaris
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={exportPDF}
                            disabled={filteredData.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <DocumentTextIcon className="w-5 h-5" />
                            Export PDF
                        </button>
                        <button
                            onClick={exportExcel}
                            disabled={filteredData.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <TableCellsIcon className="w-5 h-5" />
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================== STAT CARDS ==================== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setSearch("");
                            }}
                            className={`relative rounded-2xl shadow-lg p-5 text-white overflow-hidden group transition-all duration-300 text-left ${
                                isActive
                                    ? `bg-gradient-to-br ${tab.color} scale-105 ring-4 ring-white/50`
                                    : "bg-gradient-to-br from-gray-400 to-gray-500 hover:scale-105 opacity-75 hover:opacity-100"
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <p className="text-xs font-medium opacity-90">{tab.label}</p>
                                <p className="text-3xl font-bold mt-1">{dataCounts[tab.key]}</p>
                            </div>
                            <Icon className="absolute bottom-3 right-3 w-10 h-10 opacity-20" />
                        </button>
                    );
                })}
            </div>

            {/* ==================== CONTENT AREA ==================== */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 overflow-hidden">
                {/* TAB BUTTONS */}
                <div className="border-b border-gray-200 overflow-x-auto">
                    <div className="flex min-w-max">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setSearch("");
                                    }}
                                    className={`flex-1 min-w-[140px] py-3.5 px-4 font-semibold transition-all text-sm ${
                                        activeTab === tab.key
                                            ? "bg-blue-500 text-white border-b-4 border-blue-700"
                                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="p-5 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                            <div className="relative flex-1 max-w-md">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Cari data ${activeTab}...`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                />
                            </div>
                            <button
                                onClick={fetchAllData}
                                className="p-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                                title="Refresh Data"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-600">
                                Menampilkan{" "}
                                <span className="font-bold text-gray-800">{filteredData.length}</span>{" "}
                                data
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={exportPDF}
                                    disabled={filteredData.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition text-sm border border-red-200 disabled:opacity-50"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    PDF
                                </button>
                                <button
                                    onClick={exportExcel}
                                    disabled={filteredData.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 font-medium rounded-lg transition text-sm border border-green-200 disabled:opacity-50"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <ArrowPathIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-gray-600 font-medium">Memuat data laporan...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {config.columns.map((col, i) => (
                                            <th
                                                key={i}
                                                className={`px-4 py-3 text-sm font-bold text-gray-700 uppercase whitespace-nowrap ${
                                                    i === 0 ? "text-center" : "text-left"
                                                }`}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredData.map((item, index) => {
                                        const rowData = config.renderRow(item, index);
                                        return (
                                            <tr
                                                key={item.id || item.penilaian_id || item.pemeliharaan_id || index}
                                                className="hover:bg-blue-50/50 transition-colors"
                                            >
                                                {rowData.map((cell, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${
                                                            cellIndex === 0
                                                                ? "text-center font-semibold"
                                                                : ""
                                                        }`}
                                                    >
                                                        {/* Special rendering for status-like cells */}
                                                        {activeTab === "aset" && cellIndex === 7 ? (
                                                            <span
                                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                    cell === "Aktif"
                                                                        ? "bg-lime-100 text-lime-800"
                                                                        : "bg-red-100 text-red-800"
                                                                }`}
                                                            >
                                                                {cell}
                                                            </span>
                                                        ) : activeTab === "user" && cellIndex === 3 ? (
                                                            <span
                                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                    cell === "Administrator"
                                                                        ? "bg-purple-100 text-purple-800"
                                                                        : cell === "Petugas"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-lime-100 text-lime-800"
                                                                }`}
                                                            >
                                                                {cell}
                                                            </span>
                                                        ) : activeTab === "penilaian" && cellIndex === 8 ? (
                                                            <span
                                                                className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                                                                    cell === "Tinggi"
                                                                        ? "bg-red-500"
                                                                        : cell === "Sedang"
                                                                        ? "bg-yellow-500"
                                                                        : "bg-lime-500"
                                                                }`}
                                                            >
                                                                {cell}
                                                            </span>
                                                        ) : activeTab === "pemeliharaan" && cellIndex === 7 ? (
                                                            <span
                                                                className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                                                                    cell === "Selesai"
                                                                        ? "bg-green-500"
                                                                        : "bg-yellow-500"
                                                                }`}
                                                            >
                                                                {cell}
                                                            </span>
                                                        ) : (
                                                            cell
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}

                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={config.columns.length}
                                                className="px-6 py-16 text-center text-gray-500"
                                            >
                                                <DocumentChartBarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                                <p className="text-lg font-semibold">
                                                    Tidak ada data ditemukan
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {search
                                                        ? "Coba ubah kata kunci pencarian"
                                                        : "Belum ada data tersedia"}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* TABLE FOOTER */}
                {filteredData.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-600">
                            Menampilkan{" "}
                            <span className="font-semibold text-gray-900">
                                {filteredData.length}
                            </span>{" "}
                            data {activeTab}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <PrinterIcon className="w-4 h-4" />
                            <span>Export tersedia dalam format PDF dan Excel</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
