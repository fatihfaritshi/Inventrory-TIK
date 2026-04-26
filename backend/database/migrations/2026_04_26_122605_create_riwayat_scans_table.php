<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('riwayat_scans', function (Blueprint $table) {
            $table->id('scan_id');

            $table->foreignId('aset_id')
                ->constrained('asets')
                ->cascadeOnDelete();

            $table->foreignId('lokasi_id')
                ->constrained('lokasis')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps(); // created_at = waktu_scan
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_scans');
    }
};
