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
    XMarkIcon,
    SignalIcon,
} from "@heroicons/react/24/solid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useToast } from "../components/Toast";

// ==================== TAB CONFIGURATION ====================
const TABS = [
    { key: "user", label: "User", icon: UsersIcon, color: "from-blue-500 to-blue-700" },
    { key: "aset", label: "Aset", icon: ArchiveBoxIcon, color: "from-indigo-500 to-indigo-700" },
    { key: "lokasi", label: "Lokasi", icon: MapPinIcon, color: "from-yellow-500 to-yellow-700" },
    { key: "penilaian", label: "Penilaian", icon: ClipboardDocumentCheckIcon, color: "from-purple-500 to-purple-700" },
    { key: "pemeliharaan", label: "Pemeliharaan", icon: WrenchScrewdriverIcon, color: "from-lime-500 to-lime-700" },
    { key: "scan", label: "Riwayat Scan", icon: SignalIcon, color: "from-cyan-500 to-cyan-700" },
];

export default function Laporan() {
    // ==================== STATE ====================
    const [activeTab, setActiveTab] = useState("user");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Per-tab filters
    const [filterRole, setFilterRole] = useState("Semua");

    // Aset filters
    const [filterJenisAset, setFilterJenisAset] = useState("Semua");
    const [filterKondisiAset, setFilterKondisiAset] = useState("Semua");
    const [filterStatusAset, setFilterStatusAset] = useState("Semua");
    const [filterInventarisAset, setFilterInventarisAset] = useState("Semua");
    const [filterLokasiAset, setFilterLokasiAset] = useState("Semua");
    const [filterTanggalAset, setFilterTanggalAset] = useState("");

    // Penilaian filters
    const [filterPrioritas, setFilterPrioritas] = useState("Semua");
    const [filterTanggalPenilaian, setFilterTanggalPenilaian] = useState("");
    const [filterWaktuPenilaian, setFilterWaktuPenilaian] = useState("Semua");

    // Pemeliharaan filters
    const [filterStatusPemeliharaan, setFilterStatusPemeliharaan] = useState("Semua");
    const [filterTanggalPemeliharaan, setFilterTanggalPemeliharaan] = useState("");
    const [filterWaktuPemeliharaan, setFilterWaktuPemeliharaan] = useState("Semua");

    // Scan filters
    const [filterLokasiScan, setFilterLokasiScan] = useState("Semua");
    const [filterTanggalScan, setFilterTanggalScan] = useState("");
    const [filterWaktuScan, setFilterWaktuScan] = useState("Semua");

    // Data states
    const [users, setUsers] = useState([]);
    const [asets, setAsets] = useState([]);
    const [lokasis, setLokasis] = useState([]);
    const [penilaians, setPenilaians] = useState([]);
    const [pemeliharaans, setPemeliharaans] = useState([]);
    const [scans, setScans] = useState([]);

    // ==================== FETCH DATA ====================
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [userRes, asetRes, lokasiRes, penilaianRes, pemeliharaanRes, scanRes] =
                await Promise.all([
                    fetch("http://127.0.0.1:8000/api/users"),
                    fetch("http://127.0.0.1:8000/api/asets"),
                    fetch("http://127.0.0.1:8000/api/lokasis"),
                    fetch("http://127.0.0.1:8000/api/penilaians"),
                    fetch("http://127.0.0.1:8000/api/pemeliharaans"),
                    fetch("http://127.0.0.1:8000/api/riwayat-scans"),
                ]);

            const [userData, asetData, lokasiData, penilaianData, pemeliharaanData, scanData] =
                await Promise.all([
                    userRes.json(),
                    asetRes.json(),
                    lokasiRes.json(),
                    penilaianRes.json(),
                    pemeliharaanRes.json(),
                    scanRes.json(),
                ]);

            setUsers(userData.data || userData || []);
            setAsets(asetData.data || []);
            setLokasis(lokasiData.data || []);
            setPenilaians(penilaianData.data || []);
            setPemeliharaans(pemeliharaanData.data || []);
            setScans(scanData.data || []);
        } catch (err) {
            console.error("❌ Fetch error:", err);
            showToast("Gagal memuat data: " + err.message, "error");
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
        return tglSelesai > today ? "Berlangsung" : "Selesai";
    };

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

    // ==================== RESET FILTERS ====================
    const resetFilters = () => {
        setSearch("");
        setFilterRole("Semua");
        setFilterJenisAset("Semua");
        setFilterKondisiAset("Semua");
        setFilterStatusAset("Semua");
        setFilterInventarisAset("Semua");
        setFilterLokasiAset("Semua");
        setFilterTanggalAset("");
        setFilterPrioritas("Semua");
        setFilterTanggalPenilaian("");
        setFilterWaktuPenilaian("Semua");
        setFilterStatusPemeliharaan("Semua");
        setFilterTanggalPemeliharaan("");
        setFilterWaktuPemeliharaan("Semua");
        setFilterLokasiScan("Semua");
        setFilterTanggalScan("");
        setFilterWaktuScan("Semua");
    };

    // ==================== TABLE DEFINITIONS ====================
    const tableConfig = {
        user: {
            title: "Laporan Data User",
            columns: ["No", "Username", "Nama", "Role", "Dibuat"],
            getData: () => {
                const keyword = search.toLowerCase();
                return users.filter((u) => {
                    const matchSearch = u.nama?.toLowerCase().includes(keyword) || u.username?.toLowerCase().includes(keyword) || u.role?.toLowerCase().includes(keyword);
                    const matchRole = filterRole === "Semua" || u.role === filterRole;
                    return matchSearch && matchRole;
                });
            },
            renderRow: (item, index) => [index + 1, item.username, item.nama, item.role, formatTanggal(item.created_at)],
            exportRow: (item, index) => ({ No: index + 1, Username: item.username, Nama: item.nama, Role: item.role, Dibuat: formatTanggal(item.created_at) }),
        },
        aset: {
            title: "Laporan Data Aset",
            columns: ["No", "Kode Aset", "Nama Aset", "Jenis", "Detail", "Kondisi", "Nilai Aset", "Lokasi", "RFID Tag", "Status", "Inventaris", "Tgl Masuk"],
            getData: () => {
                const keyword = search.toLowerCase();
                return asets.filter((a) => {
                    const matchSearch = a.nama_aset?.toLowerCase().includes(keyword) || a.kode_aset?.toLowerCase().includes(keyword) || a.jenis_aset?.toLowerCase().includes(keyword) || a.lokasi?.nama_lokasi?.toLowerCase().includes(keyword);
                    const matchJenis = filterJenisAset === "Semua" || a.jenis_aset === filterJenisAset;
                    const matchKondisi = filterKondisiAset === "Semua" || a.kondisi === filterKondisiAset;
                    const matchStatus = filterStatusAset === "Semua" || a.status === filterStatusAset;
                    const matchInventaris = filterInventarisAset === "Semua" || a.status_inventaris === filterInventarisAset;
                    const matchLokasi = filterLokasiAset === "Semua" || String(a.lokasi_id) === filterLokasiAset;
                    const matchTanggal = !filterTanggalAset || a.tanggal_masuk?.startsWith(filterTanggalAset);
                    return matchSearch && matchJenis && matchKondisi && matchStatus && matchInventaris && matchLokasi && matchTanggal;
                });
            },
            renderRow: (item, index) => [index + 1, item.kode_aset, item.nama_aset, item.jenis_aset, item.detail_aset || "-", item.kondisi, formatRupiah(item.nilai_aset), item.lokasi?.nama_lokasi || "-", item.rfid_tag || "-", item.status, item.status_inventaris || "-", formatTanggal(item.tanggal_masuk)],
            exportRow: (item, index) => ({ No: index + 1, "Kode Aset": item.kode_aset, "Nama Aset": item.nama_aset, Jenis: item.jenis_aset, Detail: item.detail_aset || "-", Kondisi: item.kondisi, "Nilai Aset": item.nilai_aset, Lokasi: item.lokasi?.nama_lokasi || "-", "RFID Tag": item.rfid_tag || "-", Status: item.status, Inventaris: item.status_inventaris || "-", "Tgl Masuk": formatTanggal(item.tanggal_masuk) }),
        },
        lokasi: {
            title: "Laporan Data Lokasi",
            columns: ["No", "Nama Lokasi", "Deskripsi", "Jumlah Aset", "Dibuat"],
            getData: () => {
                const keyword = search.toLowerCase();
                return lokasis.filter((l) => l.nama_lokasi?.toLowerCase().includes(keyword) || l.deskripsi?.toLowerCase().includes(keyword));
            },
            renderRow: (item, index) => [index + 1, item.nama_lokasi, item.deskripsi || "-", item.asets_count ?? 0, formatTanggal(item.created_at)],
            exportRow: (item, index) => ({ No: index + 1, "Nama Lokasi": item.nama_lokasi, Deskripsi: item.deskripsi || "-", "Jumlah Aset": item.asets_count ?? 0, Dibuat: formatTanggal(item.created_at) }),
        },
        penilaian: {
            title: "Laporan Data Penilaian",
            columns: ["No", "Kode Aset", "Nama Aset", "Kondisi Fisik", "Usia Pemakaian", "Frekuensi", "Nilai Ekonomis", "Biaya Pemeliharaan", "Urgensi", "Total Nilai", "Prioritas", "Penilai", "Tanggal"],
            getData: () => {
                const keyword = search.toLowerCase();
                return penilaians.filter((p) => {
                    const matchSearch = p.aset?.nama_aset?.toLowerCase().includes(keyword) || p.aset?.kode_aset?.toLowerCase().includes(keyword) || p.user?.username?.toLowerCase().includes(keyword);
                    const matchPrioritas = filterPrioritas === "Semua" || getPrioritas(p.total_nilai) === filterPrioritas;
                    const matchTanggal = !filterTanggalPenilaian || p.created_at?.startsWith(filterTanggalPenilaian);
                    const matchWaktu = filterWaktuPenilaian === "Semua" || getTimelineGroup(p.created_at) === filterWaktuPenilaian;
                    return matchSearch && matchPrioritas && matchTanggal && matchWaktu;
                });
            },
            renderRow: (item, index) => [index + 1, item.aset?.kode_aset || "-", item.aset?.nama_aset || "-", item.kondisi_penilaian || "-", item.usia_pemakaian_aset || "-", item.frekuensi_penggunaan || "-", item.nilai_ekonomis || "-", item.biaya_pemeliharaan || "-", item.tingkat_urgensi || "-", item.total_nilai, getPrioritas(item.total_nilai), item.user?.username || "-", formatTanggal(item.created_at)],
            exportRow: (item, index) => ({ No: index + 1, "Kode Aset": item.aset?.kode_aset || "-", "Nama Aset": item.aset?.nama_aset || "-", "Kondisi Fisik": item.kondisi_penilaian || "-", "Usia Pemakaian": item.usia_pemakaian_aset || "-", Frekuensi: item.frekuensi_penggunaan || "-", "Nilai Ekonomis": item.nilai_ekonomis || "-", "Biaya Pemeliharaan": item.biaya_pemeliharaan || "-", Urgensi: item.tingkat_urgensi || "-", "Total Nilai": item.total_nilai, Prioritas: getPrioritas(item.total_nilai), Penilai: item.user?.username || "-", Tanggal: formatTanggal(item.created_at) }),
        },
        pemeliharaan: {
            title: "Laporan Data Pemeliharaan",
            columns: ["No", "Kode Aset", "Nama Aset", "Deskripsi", "Biaya", "Tgl Mulai", "Tgl Selesai", "Diinput Oleh", "Status"],
            getData: () => {
                const keyword = search.toLowerCase();
                return pemeliharaans.filter((p) => {
                    const matchSearch = p.aset?.nama_aset?.toLowerCase().includes(keyword) || p.aset?.kode_aset?.toLowerCase().includes(keyword) || p.deskripsi?.toLowerCase().includes(keyword) || p.user?.username?.toLowerCase().includes(keyword);
                    const matchStatus = filterStatusPemeliharaan === "Semua" || getStatusPemeliharaan(p) === filterStatusPemeliharaan;
                    const matchTanggal = !filterTanggalPemeliharaan || p.tanggal?.startsWith(filterTanggalPemeliharaan);
                    const matchWaktu = filterWaktuPemeliharaan === "Semua" || getTimelineGroup(p.tanggal) === filterWaktuPemeliharaan;
                    return matchSearch && matchStatus && matchTanggal && matchWaktu;
                });
            },
            renderRow: (item, index) => [index + 1, item.aset?.kode_aset || "-", item.aset?.nama_aset || "-", item.deskripsi, formatRupiah(item.biaya), formatTanggal(item.tanggal), formatTanggal(item.tanggal_selesai), item.user?.username || item.user?.nama || "-", getStatusPemeliharaan(item)],
            exportRow: (item, index) => ({ No: index + 1, "Kode Aset": item.aset?.kode_aset || "-", "Nama Aset": item.aset?.nama_aset || "-", Deskripsi: item.deskripsi, Biaya: item.biaya, "Tgl Mulai": formatTanggal(item.tanggal), "Tgl Selesai": formatTanggal(item.tanggal_selesai), "Diinput Oleh": item.user?.username || item.user?.nama || "-", Status: getStatusPemeliharaan(item) }),
        },
        scan: {
            title: "Laporan Data Riwayat Scan",
            columns: ["No", "Kode Aset", "Nama Aset", "RFID Tag", "Lokasi", "User", "Waktu"],
            getData: () => {
                const keyword = search.toLowerCase();
                return scans.filter((s) => {
                    const matchSearch =
                        s.aset?.nama_aset?.toLowerCase().includes(keyword) ||
                        s.aset?.kode_aset?.toLowerCase().includes(keyword) ||
                        s.aset?.rfid_tag?.toLowerCase().includes(keyword) ||
                        s.lokasi?.nama_lokasi?.toLowerCase().includes(keyword) ||
                        s.user?.username?.toLowerCase().includes(keyword);
                    const matchLokasi = filterLokasiScan === "Semua" || String(s.lokasi_id) === filterLokasiScan;
                    const matchTanggal = !filterTanggalScan || s.created_at?.startsWith(filterTanggalScan);
                    const matchWaktu = filterWaktuScan === "Semua" || getTimelineGroup(s.created_at) === filterWaktuScan;
                    return matchSearch && matchLokasi && matchTanggal && matchWaktu;
                });
            },
            renderRow: (item, index) => [index + 1, item.aset?.kode_aset || "-", item.aset?.nama_aset || "-", item.aset?.rfid_tag || "-", item.lokasi?.nama_lokasi || "-", item.user?.username || item.user?.nama || "-", formatTanggal(item.created_at)],
            exportRow: (item, index) => ({ No: index + 1, "Kode Aset": item.aset?.kode_aset || "-", "Nama Aset": item.aset?.nama_aset || "-", "RFID Tag": item.aset?.rfid_tag || "-", Lokasi: item.lokasi?.nama_lokasi || "-", User: item.user?.username || item.user?.nama || "-", Waktu: formatTanggal(item.created_at) }),
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

        autoTable(doc, {
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
        scan: scans.length,
    };

    // ==================== RENDER ====================
    const renderTimeFilters = (waktuState, setWaktuState, setTanggalState) => (
        <div className="flex flex-wrap gap-2 w-full mt-2">
            {["Semua", "Hari Ini", "Kemarin", "Minggu Ini", "Bulan Ini", "Bulan Lalu", "Lebih Lama"].map((waktu) => {
                const isActive = waktuState === waktu;
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
                        onClick={() => { setWaktuState(waktu); setTanggalState(""); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${isActive ? activeColors[waktu] : colors[waktu]}`}
                    >
                        {waktu === "Semua" ? "📋 Semua Waktu" : `${timelineConfig[waktu]?.icon || ""} ${waktu}`}
                    </button>
                );
            })}
        </div>
    );

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
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-lime-500 to-lime-700 hover:from-lime-600 hover:to-lime-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <TableCellsIcon className="w-5 h-5" />
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================== STAT CARDS ==================== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key);
                                resetFilters();
                            }}
                            className={`relative rounded-2xl shadow-lg p-5 text-white overflow-hidden group transition-all duration-300 text-left ${isActive
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
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600">
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
                                    className={`flex-1 min-w-[140px] py-3.5 px-4 font-semibold transition-all text-sm ${activeTab === tab.key
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
                                    className="flex items-center gap-1.5 px-3 py-2 bg-lime-50 hover:bg-lime-100 text-lime-600 font-medium rounded-lg transition text-sm border border-lime-200 disabled:opacity-50"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    Excel
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Per-tab filters */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        {activeTab === "user" && (
                            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                <option value="Semua">Semua Role</option>
                                <option value="Administrator">Administrator</option>
                                <option value="Petugas">Petugas</option>
                                <option value="Pimpinan">Pimpinan</option>
                            </select>
                        )}
                        {activeTab === "aset" && (
                            <>
                                <div className="flex flex-wrap gap-2 w-full mt-2">
                                    <select value={filterJenisAset} onChange={(e) => setFilterJenisAset(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Jenis</option>
                                        <option value="Hardware">Hardware</option>
                                        <option value="Software">Software</option>
                                        <option value="Jaringan (Networking)">Jaringan</option>
                                        <option value="Server & Storage">Server & Storage</option>
                                    </select>
                                    <select value={filterKondisiAset} onChange={(e) => setFilterKondisiAset(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Kondisi</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Rusak Ringan">Rusak Ringan</option>
                                        <option value="Rusak Berat">Rusak Berat</option>
                                    </select>
                                    <select value={filterStatusAset} onChange={(e) => setFilterStatusAset(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Status</option>
                                        <option value="Aktif">Aktif</option>
                                        <option value="Non-Aktif">Non-Aktif</option>
                                    </select>
                                    <select value={filterInventarisAset} onChange={(e) => setFilterInventarisAset(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Inventaris</option>
                                        <option value="Sudah Terinventarisir">Sudah Terinventarisir</option>
                                        <option value="Belum Terinventarisir">Belum Terinventarisir</option>
                                    </select>
                                    <select value={filterLokasiAset} onChange={(e) => setFilterLokasiAset(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Lokasi</option>
                                        {lokasis.map((l) => <option key={l.id} value={String(l.id)}>{l.nama_lokasi}</option>)}
                                    </select>
                                    <input type="date" title="Filter Tanggal Masuk" value={filterTanggalAset} onChange={(e) => setFilterTanggalAset(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
                                </div>
                            </>
                        )}
                        {activeTab === "penilaian" && (
                            <div className="flex flex-col w-full">
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <select value={filterPrioritas} onChange={(e) => setFilterPrioritas(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Prioritas</option>
                                        <option value="Tinggi">Tinggi (≥70)</option>
                                        <option value="Sedang">Sedang (45-69)</option>
                                        <option value="Rendah">Rendah (&lt;45)</option>
                                    </select>
                                    <input type="date" title="Filter Tanggal Penilaian" value={filterTanggalPenilaian} onChange={(e) => { setFilterTanggalPenilaian(e.target.value); setFilterWaktuPenilaian("Semua"); }} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
                                </div>
                                {renderTimeFilters(filterWaktuPenilaian, setFilterWaktuPenilaian, setFilterTanggalPenilaian)}
                            </div>
                        )}
                        {activeTab === "pemeliharaan" && (
                            <div className="flex flex-col w-full">
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <select value={filterStatusPemeliharaan} onChange={(e) => setFilterStatusPemeliharaan(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Status</option>
                                        <option value="Berlangsung">Berlangsung</option>
                                        <option value="Selesai">Selesai</option>
                                    </select>
                                    <input type="date" title="Filter Tanggal Pemeliharaan" value={filterTanggalPemeliharaan} onChange={(e) => { setFilterTanggalPemeliharaan(e.target.value); setFilterWaktuPemeliharaan("Semua"); }} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
                                </div>
                                {renderTimeFilters(filterWaktuPemeliharaan, setFilterWaktuPemeliharaan, setFilterTanggalPemeliharaan)}
                            </div>
                        )}
                        {activeTab === "scan" && (
                            <div className="flex flex-col w-full">
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <select value={filterLokasiScan} onChange={(e) => setFilterLokasiScan(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm">
                                        <option value="Semua">Semua Lokasi</option>
                                        {lokasis.map((l) => <option key={l.id} value={String(l.id)}>{l.nama_lokasi}</option>)}
                                    </select>
                                    <input type="date" title="Filter Tanggal Scan" value={filterTanggalScan} onChange={(e) => { setFilterTanggalScan(e.target.value); setFilterWaktuScan("Semua"); }} className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
                                </div>
                                {renderTimeFilters(filterWaktuScan, setFilterWaktuScan, setFilterTanggalScan)}
                            </div>
                        )}
                        {(filterRole !== "Semua" || filterJenisAset !== "Semua" || filterKondisiAset !== "Semua" || filterStatusAset !== "Semua" || filterInventarisAset !== "Semua" || filterLokasiAset !== "Semua" || filterTanggalAset !== "" || filterPrioritas !== "Semua" || filterStatusPemeliharaan !== "Semua" || filterLokasiScan !== "Semua" || filterTanggalScan !== "" || filterWaktuScan !== "Semua" || filterTanggalPenilaian !== "" || filterWaktuPenilaian !== "Semua" || filterTanggalPemeliharaan !== "" || filterWaktuPemeliharaan !== "Semua") && (
                            <button onClick={resetFilters} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition text-sm flex items-center gap-1 mt-2">
                                <XMarkIcon className="w-3.5 h-3.5" /> Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* TABLE */}
                <div className="p-6" style={{ overflow: "hidden", maxWidth: "100%" }}>
                    {loading ? (
                        <div className="text-center py-20">
                            <ArrowPathIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-gray-600 font-medium">Memuat data laporan...</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", WebkitOverflowScrolling: "touch" }}>
                            <table className="divide-y divide-gray-200" style={{ minWidth: "max-content", width: "100%" }}>
                                <thead className="bg-gray-50">
                                    <tr>
                                        {config.columns.map((col, i) => (
                                            <th
                                                key={i}
                                                className={`px-4 py-3 text-sm font-bold text-gray-700 uppercase whitespace-nowrap ${i === 0 ? "text-center" : "text-left"
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
                                                        className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${cellIndex === 0
                                                            ? "text-center font-semibold"
                                                            : ""
                                                            }`}
                                                    >
                                                        {/* Special rendering for status-like cells */}
                                                        {activeTab === "aset" && cellIndex === 7 ? (
                                                            <span
                                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cell === "Aktif"
                                                                    ? "bg-lime-100 text-lime-800"
                                                                    : "bg-red-100 text-red-800"
                                                                    }`}
                                                            >
                                                                {cell}
                                                            </span>
                                                        ) : activeTab === "user" && cellIndex === 3 ? (
                                                            <span
                                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cell === "Administrator"
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
                                                                className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${cell === "Tinggi"
                                                                    ? "bg-red-500"
                                                                    : cell === "Sedang"
                                                                        ? "bg-yellow-500"
                                                                        : "bg-lime-600"
                                                                    }`}
                                                            >
                                                                {cell}
                                                            </span>
                                                        ) : activeTab === "pemeliharaan" && cellIndex === 8 ? (
                                                            <span
                                                                className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${cell === "Selesai"
                                                                    ? "bg-lime-600"
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
