<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pemeliharaans', function (Blueprint $table) {
            $table->id('pemeliharaan_id'); // PK, AI
            $table->unsignedBigInteger('aset_id'); // FK
            $table->date('tanggal');
            $table->text('deskripsi')->nullable();
            $table->decimal('biaya', 15, 2);
            $table->date('tanggal_selesai')->nullable();
            $table->timestamps();

            // Foreign Key
            $table->foreign('aset_id')
                  ->references('id')
                  ->on('asets')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pemeliharaans');
    }
};