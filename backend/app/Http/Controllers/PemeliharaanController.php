<?php

namespace App\Http\Controllers;

use App\Models\Pemeliharaan;
use Illuminate\Http\Request;

class PemeliharaanController extends Controller
{
    /**
     * GET /api/pemeliharaans
     */
    public function index()
    {
        $data = Pemeliharaan::with('aset')->get();

        return response()->json([
            'message' => 'Data pemeliharaan berhasil diambil',
            'data' => $data
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
            'deskripsi' => 'nullable|string',
            'biaya' => 'required|numeric',
            'tanggal_selesai' => 'nullable|date',
        ]);

        $pemeliharaan = Pemeliharaan::create($request->all());

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
        $data = Pemeliharaan::with('aset')->find($id);

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
            'aset_id' => 'required|exists:asets,id',
            'tanggal' => 'required|date',
            'deskripsi' => 'nullable|string',
            'biaya' => 'required|numeric',
            'tanggal_selesai' => 'nullable|date',
        ]);

        $pemeliharaan->update($request->all());

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
}