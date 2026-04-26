<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change column to enum
        DB::statement("ALTER TABLE asets MODIFY jenis_aset ENUM(
            'Hardware',
            'Server & Storage',
            'Jaringan (Networking)',
            'Keamanan Jaringan',
            'Komunikasi & Telekomunikasi',
            'Output & Presentasi',
            'Multimedia & Surveillance',
            'Daya & Proteksi',
            'Pendingin & Infrastruktur',
            'Aksesoris & Peripheral',
            'Media Penyimpanan Portable',
            'Software',
            'Furniture & Mebel',
            'Instalasi & Kelistrikan',
            'Keamanan Fisik & Akses',
            'Peralatan Kantor',
            'Kendaraan Operasional',
            'Peralatan Lapangan & Operasional'
        ) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE asets MODIFY jenis_aset VARCHAR(50) NOT NULL");
    }
};
