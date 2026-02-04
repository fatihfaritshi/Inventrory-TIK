import DashboardLayout from "../layouts/DashboardLayout";

export default function Penilaian() {
    return (
    <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
            <h2 className="text-lg font-semibold">Total Aset</h2>
            <p className="text-3xl font-bold mt-2">124</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
            <h2 className="text-lg font-semibold">Aset Aktif</h2>
            <p className="text-3xl font-bold mt-2">98</p>
        </div>
        </div>
    );
}

