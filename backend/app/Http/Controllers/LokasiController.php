<?php

namespace App\Http\Controllers;

use App\Models\Lokasi;
use Illuminate\Http\Request;

class LokasiController extends Controller
{
    // GET /api/lokasis
    public function index()
    {
        return response()->json(Lokasi::all());
    }

    // POST /api/lokasis
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        $lokasi = Lokasi::create($request->all());

        return response()->json([
            'message' => 'Lokasi berhasil ditambahkan',
            'data' => $lokasi
        ], 201);
    }

    // GET /api/lokasis/{id}
    public function show($id)
    {
        $lokasi = Lokasi::findOrFail($id);
        return response()->json($lokasi);
    }

    // PUT /api/lokasis/{id}
    public function update(Request $request, $id)
    {
        $lokasi = Lokasi::findOrFail($id);

        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        $lokasi->update($validated);

        return response()->json([
            'message' => 'Lokasi berhasil diperbarui',
            'data' => $lokasi
        ]);
    }

    // DELETE /api/lokasis/{id}
    public function destroy($id)
    {
        $lokasi = Lokasi::findOrFail($id);
        $lokasi->delete();

        return response()->json([
            'message' => 'Lokasi berhasil dihapus'
        ]);
    }
}
