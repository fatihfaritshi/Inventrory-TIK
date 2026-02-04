<?php

namespace App\Http\Controllers;

use App\Models\Penilaian;
use Illuminate\Http\Request;

class PenilaianController extends Controller
{
    /**
     * GET /api/penilaians
     */
    public function index()
    {
        $penilaians = Penilaian::with(['aset', 'user'])->get();

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
            'frekuensi_penggunaan' => 'required',
            'usia_pemakaian_aset' => 'required',
            'kondisi_penilaian' => 'required',
            'nilai_ekonomis' => 'required',
            'biaya_pemeliharaan' => 'required',
            'tingkat_urgensi' => 'required',
            'total_nilai' => 'required|integer',
        ]);

        $penilaian = Penilaian::create($validated);

        return response()->json([
            'message' => 'Penilaian berhasil ditambahkan',
            'data' => $penilaian
        ], 201);
    }

    /**
     * GET /api/penilaians/{id}
     */
    public function show($id)
    {
        $penilaian = Penilaian::with(['aset', 'user'])
            ->find($id);

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
            'frekuensi_penggunaan' => 'required',
            'usia_pemakaian_aset' => 'required',
            'kondisi_penilaian' => 'required',
            'nilai_ekonomis' => 'required',
            'biaya_pemeliharaan' => 'required',
            'tingkat_urgensi' => 'required',
            'total_nilai' => 'required|integer',
        ]);

        $penilaian->update($validated);

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
