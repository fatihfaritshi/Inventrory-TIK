<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lokasi extends Model
{
    use HasFactory;

    protected $table = 'lokasis';

    protected $fillable = [
        'nama_lokasi',
        'deskripsi',
    ];

    // Relasi ke aset (1 lokasi punya banyak aset)
    public function asets()
    {
        return $this->hasMany(Asets::class, 'lokasi_id');
    }
}
