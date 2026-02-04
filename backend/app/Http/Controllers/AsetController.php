<?php

namespace App\Http\Controllers;

use App\Models\Aset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AsetController extends Controller
{
    /**
     * GET /api/asets
     * Menampilkan semua data aset
     */
    public function index()
    {
        $asets = Aset::with('lokasi')->get();

        return response()->json([
            'message' => 'Data aset berhasil diambil',
            'data' => $asets
        ]);
    }

    /**
     * POST /api/asets
     * Menyimpan data aset baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_aset' => 'required|unique:asets,kode_aset',
            'nama_aset' => 'required',
            'jenis_aset' => 'required',
            'detail_aset' => 'nullable',
            'kondisi' => 'required|in:Baik,Rusak Ringan,Rusak Berat',
            'nilai_aset' => 'required|numeric',
            'lokasi_id' => 'required|exists:lokasis,id',
            'rfid_tag' => 'required|unique:asets,rfid_tag',
            'tanggal_masuk' => 'required|date',
            'status' => 'required|in:Aktif,Non-Aktif',
            'status_inventaris' => 'required|in:INTRA,EXTRA',
            'foto_aset' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->all();

        // Upload foto jika ada
        if ($request->hasFile('foto_aset')) {
            $data['foto_aset'] = $request->file('foto_aset')
                ->store('foto_aset', 'public');
        }

        $aset = Aset::create($data);

        return response()->json([
            'message' => 'Aset berhasil ditambahkan',
            'data' => $aset
        ], 201);
    }

    /**
     * GET /api/asets/{id}
     * Menampilkan detail aset
     */
    public function show($id)
    {
        $aset = Aset::with('lokasi')->find($id);

        if (!$aset) {
            return response()->json([
                'message' => 'Aset tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail aset',
            'data' => $aset
        ]);
    }

    /**
     * PUT /api/asets/{id}
     * Update data aset
     */
    public function update(Request $request, $id)
    {
        $aset = Aset::find($id);

        if (!$aset) {
            return response()->json([
                'message' => 'Aset tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'kode_aset' => 'required|unique:asets,kode_aset,' . $id,
            'nama_aset' => 'required',
            'jenis_aset' => 'required',
            'detail_aset' => 'nullable',
            'kondisi' => 'required|in:Baik,Rusak Ringan,Rusak Berat',
            'nilai_aset' => 'required|numeric',
            'lokasi_id' => 'required|exists:lokasis,id',
            'rfid_tag' => 'required|unique:asets,rfid_tag,' . $id,
            'tanggal_masuk' => 'required|date',
            'status' => 'required|in:Aktif,Non-Aktif',
            'status_inventaris' => 'required|in:INTRA,EXTRA',
            'foto_aset' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->all();

        // Jika upload foto baru
        if ($request->hasFile('foto_aset')) {

            // hapus foto lama
            if ($aset->foto_aset) {
                Storage::disk('public')->delete($aset->foto_aset);
            }

            $data['foto_aset'] = $request->file('foto_aset')
                ->store('foto_aset', 'public');
        }

        $aset->update($data);

        return response()->json([
            'message' => 'Aset berhasil diperbarui',
            'data' => $aset
        ]);
    }

    /**
     * DELETE /api/asets/{id}
     * Hapus data aset
     */
    public function destroy($id)
    {
        $aset = Aset::find($id);

        if (!$aset) {
            return response()->json([
                'message' => 'Aset tidak ditemukan'
            ], 404);
        }

        // Hapus foto jika ada
        if ($aset->foto_aset) {
            Storage::disk('public')->delete($aset->foto_aset);
        }

        $aset->delete();

        return response()->json([
            'message' => 'Aset berhasil dihapus'
        ]);
    }
}