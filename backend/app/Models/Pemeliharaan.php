<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pemeliharaan extends Model
{
    use HasFactory;

    protected $table = 'pemeliharaans';

    protected $primaryKey = 'pemeliharaan_id';

    protected $fillable = [
        'aset_id',
        'tanggal',
        'deskripsi',
        'biaya',
        'tanggal_selesai',
    ];

    // Relasi: banyak pemeliharaan milik satu aset
    public function aset()
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }
}