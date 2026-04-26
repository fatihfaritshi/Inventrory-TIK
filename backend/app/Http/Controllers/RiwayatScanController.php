<?php

namespace App\Http\Controllers;

use App\Models\RiwayatScan;
use Illuminate\Http\Request;

class RiwayatScanController extends Controller
{
    /**
     * GET /api/riwayat-scans
     */
    public function index()
    {
        $data = RiwayatScan::with(['aset.lokasi', 'lokasi', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Data riwayat scan berhasil diambil',
            'data' => $data
        ]);
    }

    /**
     * POST /api/riwayat-scans
     */
    public function store(Request $request)
    {
        $request->validate([
            'aset_id' => 'required|exists:asets,id',
            'lokasi_id' => 'required|exists:lokasis,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $scan = RiwayatScan::create($request->only(['aset_id', 'lokasi_id', 'user_id']));
        $scan->load(['aset', 'lokasi', 'user']);

        return response()->json([
            'message' => 'Data scan berhasil dicatat',
            'data' => $scan
        ], 201);
    }

    /**
     * GET /api/riwayat-scans/{id}
     */
    public function show($id)
    {
        $data = RiwayatScan::with(['aset.lokasi', 'lokasi', 'user'])->find($id);

        if (!$data) {
            return response()->json(['message' => 'Data scan tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail riwayat scan',
            'data' => $data
        ]);
    }

    /**
     * DELETE /api/riwayat-scans/{id}
     */
    public function destroy($id)
    {
        $scan = RiwayatScan::find($id);

        if (!$scan) {
            return response()->json(['message' => 'Data scan tidak ditemukan'], 404);
        }

        $scan->delete();

        return response()->json(['message' => 'Data scan berhasil dihapus']);
    }
}
