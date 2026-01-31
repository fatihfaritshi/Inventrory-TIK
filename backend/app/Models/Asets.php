<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aset extends Model
{
    protected $table = 'asets';

    protected $fillable = [
        'kode_aset',
        'nama_aset',
        'jenis_aset',
        'detail_aset',
        'kondisi',
        'nilai_aset',
        'lokasi_id',
        'rfid_tag',
        'tanggal_masuk',
        'status',
        'status_inventaris',
        'foto_aset',
    ];

    /**
     * Relasi ke tabel lokasi
     */
    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class);
    }
}
