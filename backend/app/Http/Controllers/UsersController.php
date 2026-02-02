<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    // =======================
    // GET /api/users
    // =======================
    public function index(Request $request)
    {
        $search = $request->query('search');

        $users = User::when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%");
            });
        })->orderBy('id', 'desc')->get();

        return response()->json([
            'message' => 'Data user berhasil diambil',
            'data' => $users
        ]);
    }

    // =======================
    // POST /api/users
    // =======================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'password' => 'required|string|min:6',
            'role' => 'required|in:Administrator,Petugas,Pimpinan',
        ]);

        $user = User::create([
            'nama' => $validated['nama'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']), // WAJIB HASH
            'role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    // =======================
    // PUT /api/users/{id}
    // =======================
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:Administrator,Petugas,Pimpinan',
        ]);

        // Jika password diisi → hash
        if ($request->filled('password')) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']); // penting!
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'data' => $user
        ]);
    }

    // =======================
    // DELETE /api/users/{id}
    // =======================
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus'
        ]);
    }
}
