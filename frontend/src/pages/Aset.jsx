// frontend/pages/Asets.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Asets() {
  const [asets, setAsets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user")) || { username: "Guest", role: "Petugas" };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/asets")
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        // Sesuai response controller, data ada di result.data
        setAsets(result.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar role={user.role} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar user={user} />

        {/* Konten */}
        <main className="p-6 bg-gray-100 flex-1">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Daftar Aset</h1>

            {loading ? (
              <div className="text-center py-10 text-gray-600">Loading data aset...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Kode Aset</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nama Aset</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Jenis</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Kondisi</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nilai</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Lokasi</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Tanggal Masuk</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Foto</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {asets.map((aset) => (
                      <tr key={aset.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 text-sm text-gray-700">{aset.kode_aset}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{aset.nama_aset}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{aset.jenis_aset}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{aset.kondisi}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">Rp {aset.nilai_aset.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{aset.lokasi?.nama_lokasi || "-"}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{new Date(aset.tanggal_masuk).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                            {aset.foto_aset ? (
                                <img src={`http://127.0.0.1:8000/storage/${aset.foto_aset}`} alt={aset.nama_aset} className="w-16 h-16 object-cover rounded" />
                            ) : (
                                <span className="text-gray-400">Tidak ada</span>
                            )}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            aset.status.toLowerCase() === "aktif" ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"
                          }`}>
                            {aset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
