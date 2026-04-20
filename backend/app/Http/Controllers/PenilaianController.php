<?php

namespace App\Http\Controllers;

use App\Models\Penilaian;
use App\Models\Pemeliharaan;
use App\Services\FuzzyMarcosService;
use Illuminate\Http\Request;

class PenilaianController extends Controller
{
    protected $fuzzyMarcosService;

    public function __construct(FuzzyMarcosService $fuzzyMarcosService)
    {
        $this->fuzzyMarcosService = $fuzzyMarcosService;
    }

    /**
     * GET /api/penilaians
     */
    public function index()
    {
        $penilaians = Penilaian::with(['aset', 'user'])
            ->orderBy('total_nilai', 'desc')
            ->get();

        return response()->json([
            'message' => 'Data penilaian berhasil diambil',
            'data' => $penilaians
        ]);
    }

    /**
     * POST /api/penilaians
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'aset_id' => 'required|exists:asets,id',
            'user_id' => 'required|exists:users,id',
            'frekuensi_penggunaan' => 'required|in:Sangat Sering,Sering,Kadang,Jarang,Sangat Jarang',
            'usia_pemakaian_aset' => 'required|in:Baru,Relatif Baru,Sedang,Lama,Sangat Lama',
            'kondisi_penilaian' => 'required|in:Sangat Baik,Baik,Cukup,Buruk,Sangat Buruk',
            'nilai_ekonomis' => 'required|in:Sangat Tinggi,Tinggi,Sedang,Rendah,Sangat Rendah',
            'biaya_pemeliharaan' => 'required|in:Sangat Rendah,Rendah,Sedang,Tinggi,Sangat Tinggi',
            'tingkat_urgensi' => 'required|in:Sangat Urgen,Urgen,Sedang,Rendah,Tidak Urgen',
        ]);

        // Hitung total nilai menggunakan Fuzzy-MARCOS
        $totalNilai = $this->fuzzyMarcosService->calculateSingleMarcos($validated);
        
        $validated['total_nilai'] = $totalNilai;

        $penilaian = Penilaian::create($validated);

        // Load relasi
        $penilaian->load(['aset', 'user']);

        return response()->json([
            'message' => 'Penilaian berhasil ditambahkan',
            'data' => $penilaian,
            'total_nilai' => $totalNilai,
            'prioritas' => $totalNilai >= 70 ? 'Tinggi' : ($totalNilai >= 45 ? 'Sedang' : 'Rendah')
        ], 201);
    }

    /**
     * GET /api/penilaians/ranking
     */
    public function ranking()
    {
        $penilaians = Penilaian::with(['aset', 'user'])
            ->orderBy('total_nilai', 'desc')
            ->get();

        $ranking = $penilaians->map(function($item, $index) {
            return [
                'rank' => $index + 1,
                'penilaian_id' => $item->penilaian_id,
                'aset' => [
                    'id' => $item->aset->id,
                    'kode_aset' => $item->aset->kode_aset,
                    'nama_aset' => $item->aset->nama_aset,
                ],
                'user' => [
                    'id' => $item->user->id,
                    'username' => $item->user->username,
                ],
                'kriteria' => [
                    'frekuensi_penggunaan' => $item->frekuensi_penggunaan,
                    'usia_pemakaian_aset' => $item->usia_pemakaian_aset,
                    'kondisi_penilaian' => $item->kondisi_penilaian,
                    'nilai_ekonomis' => $item->nilai_ekonomis,
                    'biaya_pemeliharaan' => $item->biaya_pemeliharaan,
                    'tingkat_urgensi' => $item->tingkat_urgensi,
                ],
                'total_nilai' => $item->total_nilai,
                'prioritas' => $item->total_nilai >= 70 ? 'Tinggi' : 
                              ($item->total_nilai >= 45 ? 'Sedang' : 'Rendah'),
                'created_at' => $item->created_at,
            ];
        });

        return response()->json([
            'message' => 'Ranking penilaian berhasil diambil',
            'data' => $ranking
        ]);
    }

    /**
     * POST /api/penilaians/recalculate
     */
    public function recalculate()
    {
        $penilaians = Penilaian::all();

        if ($penilaians->isEmpty()) {
            return response()->json([
                'message' => 'Tidak ada data penilaian untuk dihitung ulang',
                'total_updated' => 0
            ]);
        }

        // Siapkan semua data dalam satu array untuk diproses sekaligus
        $dataArray = $penilaians->map(function ($p) {
            return [
                'penilaian_id'         => $p->id,
                'aset_id'              => $p->aset_id,
                'kondisi_penilaian'    => $p->kondisi_penilaian,
                'usia_pemakaian_aset'  => $p->usia_pemakaian_aset,
                'frekuensi_penggunaan' => $p->frekuensi_penggunaan,
                'tingkat_urgensi'      => $p->tingkat_urgensi,
                'biaya_pemeliharaan'   => $p->biaya_pemeliharaan,
                'nilai_ekonomis'       => $p->nilai_ekonomis,
            ];
        })->all();

        // Hitung Fuzzy-MARCOS untuk semua penilaian sekaligus
        $results = $this->fuzzyMarcosService->calculateMultipleMarcos($dataArray);

        // Update total_nilai di database berdasarkan hasil
        $updated = 0;
        foreach ($results as $result) {
            $penilaian = $penilaians->firstWhere('id', $result['penilaian_id']);
            if ($penilaian) {
                $penilaian->update(['total_nilai' => $result['total_nilai']]);
                $updated++;
            }
        }

        return response()->json([
            'message' => "Berhasil menghitung ulang {$updated} penilaian menggunakan Fuzzy-MARCOS",
            'total_updated' => $updated
        ]);
    }

    /**
     * GET /api/penilaians/{id}
     */
    public function show($id)
    {
        $penilaian = Penilaian::with(['aset', 'user'])->find($id);

        if (!$penilaian) {
            return response()->json([
                'message' => 'Penilaian tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail penilaian',
            'data' => $penilaian
        ]);
    }

    /**
     * PUT /api/penilaians/{id}
     */
    public function update(Request $request, $id)
    {
        $penilaian = Penilaian::find($id);

        if (!$penilaian) {
            return response()->json([
                'message' => 'Penilaian tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'aset_id' => 'required|exists:asets,id',
            'user_id' => 'required|exists:users,id',
            'frekuensi_penggunaan' => 'required|in:Sangat Sering,Sering,Kadang,Jarang,Sangat Jarang',
            'usia_pemakaian_aset' => 'required|in:Baru,Relatif Baru,Sedang,Lama,Sangat Lama',
            'kondisi_penilaian' => 'required|in:Sangat Baik,Baik,Cukup,Buruk,Sangat Buruk',
            'nilai_ekonomis' => 'required|in:Sangat Tinggi,Tinggi,Sedang,Rendah,Sangat Rendah',
            'biaya_pemeliharaan' => 'required|in:Sangat Rendah,Rendah,Sedang,Tinggi,Sangat Tinggi',
            'tingkat_urgensi' => 'required|in:Sangat Urgen,Urgen,Sedang,Rendah,Tidak Urgen',
        ]);

        // Hitung ulang total nilai
        $totalNilai = $this->fuzzyMarcosService->calculateSingleMarcos($validated);
        $validated['total_nilai'] = $totalNilai;

        $penilaian->update($validated);
        $penilaian->load(['aset', 'user']);

        return response()->json([
            'message' => 'Penilaian berhasil diperbarui',
            'data' => $penilaian
        ]);
    }

    /**
     * DELETE /api/penilaians/{id}
     */
    public function destroy($id)
    {
        $penilaian = Penilaian::find($id);

        if (!$penilaian) {
            return response()->json([
                'message' => 'Penilaian tidak ditemukan'
            ], 404);
        }

        $penilaian->delete();

        return response()->json([
            'message' => 'Penilaian berhasil dihapus'
        ]);
    }
}