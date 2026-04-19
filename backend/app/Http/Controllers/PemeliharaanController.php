<?php

namespace App\Http\Controllers;

use App\Models\Pemeliharaan;
use App\Models\Penilaian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PemeliharaanController extends Controller
{
    /**
     * GET /api/pemeliharaans
     * Ambil semua data pemeliharaan dengan relasi
     */
    public function index()
    {
        $data = Pemeliharaan::with(['aset.lokasi'])
            ->orderBy('tanggal', 'desc')
            ->get();

        return response()->json([
            'message' => 'Data pemeliharaan berhasil diambil',
            'data' => $data
        ]);
    }

    /**
     * GET /api/pemeliharaans/prioritas
     * Ambil daftar aset berdasarkan prioritas dari penilaian
     */
    public function getPrioritas()
    {
        $subQuery = Penilaian::select('aset_id', DB::raw('MAX(total_nilai) as max_nilai'))
            ->groupBy('aset_id');

        // Ambil aset_id yang sudah memiliki pemeliharaan
        $maintainedAsetIds = Pemeliharaan::pluck('aset_id')->unique()->toArray();

        $penilaians = Penilaian::with(['aset.lokasi', 'user'])
            ->joinSub($subQuery, 'latest', function ($join) {
                $join->on('penilaians.aset_id', '=', 'latest.aset_id')
                    ->on('penilaians.total_nilai', '=', 'latest.max_nilai');
            })
            ->whereNotIn('penilaians.aset_id', $maintainedAsetIds)
            ->select('penilaians.*') 
            ->orderByDesc('penilaians.total_nilai')
            ->get();

        $data = $penilaians->map(function ($item) {

            $lastMaintenance = Pemeliharaan::where('aset_id', $item->aset_id)
                ->latest('tanggal')
                ->first();

            if ($item->total_nilai >= 70) {
                $prioritas = 'Tinggi';
                $rekomendasi = 'Perlu pemeliharaan segera';
            } elseif ($item->total_nilai >= 45) {
                $prioritas = 'Sedang';
                $rekomendasi = 'Jadwalkan pemeliharaan';
            } else {
                $prioritas = 'Rendah';
                $rekomendasi = 'Kondisi masih baik';
            }

            return [
                'id' => $item->penilaian_id, 
                'aset_id' => $item->aset_id,

                'aset' => [
                    'id' => $item->aset->id ?? null,
                    'kode_aset' => $item->aset->kode_aset ?? '-',
                    'nama_aset' => $item->aset->nama_aset ?? '-',
                    'lokasi' => $item->aset->lokasi->nama_lokasi ?? '-',
                ],

                'user' => [
                    'id' => $item->user->id ?? null,
                    'username' => $item->user->username ?? '-',
                ],

                'total_nilai' => $item->total_nilai,
                'status_prioritas' => $prioritas,
                'rekomendasi' => $rekomendasi,

                'last_maintenance' => $lastMaintenance ? [
                    'id' => $lastMaintenance->pemeliharaan_id, 
                    'tanggal' => $lastMaintenance->tanggal,
                    'tanggal_selesai' => $lastMaintenance->tanggal_selesai,
                    'biaya' => $lastMaintenance->biaya,
                    'deskripsi' => $lastMaintenance->deskripsi,
                ] : null,

                'created_at' => $item->created_at,
            ];
        });

        return response()->json([
            'message' => 'Daftar prioritas pemeliharaan berhasil diambil',
            'data' => $data
        ]);
    }

    /**
     * GET /api/pemeliharaans/statistik
     * Statistik pemeliharaan
     */
    public function statistik()
    {
        $total = Pemeliharaan::count();
        $bulanIni = Pemeliharaan::whereMonth('tanggal', date('m'))
            ->whereYear('tanggal', date('Y'))
            ->count();
        
        $selesai = Pemeliharaan::whereNotNull('tanggal_selesai')->count();
        $berlangsung = Pemeliharaan::whereNull('tanggal_selesai')->count();
        
        $totalBiaya = Pemeliharaan::sum('biaya');
        $biayaBulanIni = Pemeliharaan::whereMonth('tanggal', date('m'))
            ->whereYear('tanggal', date('Y'))
            ->sum('biaya');

        return response()->json([
            'total_pemeliharaan' => $total,
            'pemeliharaan_bulan_ini' => $bulanIni,
            'pemeliharaan_selesai' => $selesai,
            'pemeliharaan_berlangsung' => $berlangsung,
            'total_biaya' => $totalBiaya,
            'biaya_bulan_ini' => $biayaBulanIni,
        ]);
    }

    /**
     * POST /api/pemeliharaans
     */
    public function store(Request $request)
    {
        $request->validate([
            'aset_id' => 'required|exists:asets,id',
            'tanggal' => 'required|date',
            'deskripsi' => 'required|string',
            'biaya' => 'required|numeric|min:0',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal',
        ]);

        $pemeliharaan = Pemeliharaan::create($request->all());
        $pemeliharaan->load('aset');

        return response()->json([
            'message' => 'Data pemeliharaan berhasil ditambahkan',
            'data' => $pemeliharaan
        ], 201);
    }

    /**
     * GET /api/pemeliharaans/{id}
     */
    public function show($id)
    {
        $data = Pemeliharaan::with(['aset.lokasi'])->find($id);

        if (!$data) {
            return response()->json([
                'message' => 'Data pemeliharaan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pemeliharaan',
            'data' => $data
        ]);
    }

    /**
     * PUT /api/pemeliharaans/{id}
     */
    public function update(Request $request, $id)
    {
        $pemeliharaan = Pemeliharaan::find($id);

        if (!$pemeliharaan) {
            return response()->json([
                'message' => 'Data pemeliharaan tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'aset_id' => 'sometimes|required|exists:asets,id',
            'tanggal' => 'sometimes|required|date',
            'deskripsi' => 'sometimes|required|string',
            'biaya' => 'sometimes|required|numeric|min:0',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal',
        ]);

        $pemeliharaan->update($request->all());
        $pemeliharaan->load('aset');

        return response()->json([
            'message' => 'Data pemeliharaan berhasil diperbarui',
            'data' => $pemeliharaan
        ]);
    }

    /**
     * DELETE /api/pemeliharaans/{id}
     */
    public function destroy($id)
    {
        $pemeliharaan = Pemeliharaan::find($id);

        if (!$pemeliharaan) {
            return response()->json([
                'message' => 'Data pemeliharaan tidak ditemukan'
            ], 404);
        }

        $pemeliharaan->delete();

        return response()->json([
            'message' => 'Data pemeliharaan berhasil dihapus'
        ]);
    }

    /**
     * POST /api/pemeliharaans/{id}/selesai
     * Tandai pemeliharaan sebagai selesai
     */
    public function markAsCompleted($id)
    {
        $pemeliharaan = Pemeliharaan::find($id);

        if (!$pemeliharaan) {
            return response()->json([
                'message' => 'Data pemeliharaan tidak ditemukan'
            ], 404);
        }

        $pemeliharaan->update([
            'tanggal_selesai' => now()->toDateString()
        ]);

        return response()->json([
            'message' => 'Pemeliharaan berhasil ditandai selesai',
            'data' => $pemeliharaan
        ]);
    }
}