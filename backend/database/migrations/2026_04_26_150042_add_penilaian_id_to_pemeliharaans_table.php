<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pemeliharaans', function (Blueprint $table) {
            $table->unsignedBigInteger('penilaian_id')->nullable()->after('aset_id');
            $table->foreign('penilaian_id')->references('penilaian_id')->on('penilaians')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pemeliharaans', function (Blueprint $table) {
            $table->dropForeign(['penilaian_id']);
            $table->dropColumn('penilaian_id');
        });
    }
};
