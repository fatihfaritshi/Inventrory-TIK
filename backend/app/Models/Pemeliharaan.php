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
        'user_id',
        'tanggal',
        'deskripsi',
        'biaya',
        'tanggal_selesai',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'tanggal_selesai' => 'date',
        'biaya' => 'decimal:2',
    ];

    /**
     * Relasi: banyak pemeliharaan milik satu aset
     */
    public function aset()
    {
        return $this->belongsTo(Aset::class, 'aset_id', 'id');
    }

    /**
     * Relasi: pemeliharaan diinput oleh satu user
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}