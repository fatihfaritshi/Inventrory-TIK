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
            'username' => 'petugas',
            'password' => Hash::make('petugas'),
            'role' => 'Petugas',
        ]);

        User::create([
            'username' => 'administrator',
            'password' => Hash::make('administrator'),
            'role' => 'Administrator',
        ]);

        User::create([
            'username' => 'pimpinan',
            'password' => Hash::make('pimpinan123'),
            'role' => 'Pimpinan',
        ]);
    }
}
