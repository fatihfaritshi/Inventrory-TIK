<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('asets', function (Blueprint $table) {
            $table->id(); // aset_id (PK)

            $table->string('kode_aset', 50)->unique(); // kode inventaris unik
            $table->string('nama_aset', 100);          // nama aset
            $table->string('jenis_aset', 50);          // komputer, jaringan, dll
            $table->string('detail_aset', 100)->nullable(); // merk / spesifikasi
            $table->enum('kondisi', ['Baik', 'Rusak Ringan', 'Rusak Berat']);
            $table->decimal('nilai_aset', 15, 2);      // nilai aset (Rp)

            $table->unsignedBigInteger('lokasi_id');   // FK ke lokasi
            $table->string('rfid_tag', 100)->unique(); // ID unik RFID

            $table->date('tanggal_masuk');             // tanggal dicatat
            $table->enum('status', ['Aktif', 'Non-Aktif']);
            $table->enum('status_inventaris', ['INTRA', 'EXTRA']);

            $table->string('foto_aset', 255)->nullable(); // path / URL foto

            $table->timestamps();

            // Foreign Key
            $table->foreign('lokasi_id')
                  ->references('id')
                  ->on('lokasis')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asets');
    }
};