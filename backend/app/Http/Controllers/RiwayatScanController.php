<?php

namespace App\Http\Controllers;

use App\Models\RiwayatScan;
use App\Models\Aset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
     * POST /api/bulk-scan-rfid
     * Bulk scan RFID: match rfid_tags to assets, update locations, create scan history
     */
    public function bulkScanRfid(Request $request)
    {
        $request->validate([
            'lokasi_id' => 'required|exists:lokasis,id',
            'rfid_list' => 'required|array|min:1',
            'rfid_list.*' => 'required|string',
            'user_id' => 'required|exists:users,id',
        ]);

        $lokasiId = $request->lokasi_id;
        $rfidList = array_unique($request->rfid_list);
        $userId = $request->user_id;

        $success = [];
        $notFound = [];

        DB::beginTransaction();
        try {
            // Find all assets matching the RFID tags
            $foundAsets = Aset::whereIn('rfid_tag', $rfidList)->get()->keyBy('rfid_tag');

            foreach ($rfidList as $rfidTag) {
                if ($foundAsets->has($rfidTag)) {
                    $aset = $foundAsets->get($rfidTag);

                    // Update asset location
                    $aset->update(['lokasi_id' => $lokasiId]);

                    // Create scan history record
                    RiwayatScan::create([
                        'aset_id' => $aset->id,
                        'lokasi_id' => $lokasiId,
                        'user_id' => $userId,
                    ]);

                    $success[] = $rfidTag;
                } else {
                    $notFound[] = $rfidTag;
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Bulk scan RFID selesai',
                'success' => $success,
                'not_found' => $notFound,
                'total_success' => count($success),
                'total_not_found' => count($notFound),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memproses bulk scan: ' . $e->getMessage(),
            ], 500);
        }
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
