<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nama' => 'Petugas Sistem',
            'username' => 'petugas',
            'password' => Hash::make('petugas'),
            'role' => 'Petugas',
        ]);

        User::create([
            'nama' => 'Administrator Sistem',
            'username' => 'administrator',
            'password' => Hash::make('administrator'),
            'role' => 'Administrator',
        ]);

        User::create([
            'nama' => 'Pimpinan Instansi',
            'username' => 'pimpinan',
            'password' => Hash::make('pimpinan123'),
            'role' => 'Pimpinan',
        ]);
    }
}
