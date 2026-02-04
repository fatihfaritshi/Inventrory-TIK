<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('penilaians', function (Blueprint $table) {
            $table->id('penilaian_id');

            $table->foreignId('aset_id')
                ->constrained('asets')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('frekuensi_penggunaan', [
                'Sangat Sering',
                'Sering',
                'Kadang',
                'Jarang',
                'Sangat Jarang'
            ]);

            $table->enum('usia_pemakaian_aset', [
                'Baru',
                'Relatif Baru',
                'Sedang',
                'Lama',
                'Sangat Lama'
            ]);

            $table->enum('kondisi_penilaian', [
                'Sangat Baik',
                'Baik',
                'Cukup',
                'Buruk',
                'Sangat Buruk'
            ]);

            $table->enum('nilai_ekonomis', [
                'Sangat Tinggi',
                'Tinggi',
                'Sedang',
                'Rendah',
                'Sangat Rendah'
            ]);

            $table->enum('biaya_pemeliharaan', [
                'Sangat Rendah',
                'Rendah',
                'Sedang',
                'Tinggi',
                'Sangat Tinggi'
            ]);

            $table->enum('tingkat_urgensi', [
                'Sangat Urgen',
                'Urgen',
                'Sedang',
                'Rendah',
                'Tidak Urgen'
            ]);

            $table->integer('total_nilai');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penilaians');
    }
};
