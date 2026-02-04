<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penilaian extends Model
{
    use HasFactory;

    protected $primaryKey = 'penilaian_id';

    protected $fillable = [
        'aset_id',
        'user_id',
        'frekuensi_penggunaan',
        'usia_pemakaian_aset',
        'kondisi_penilaian',
        'nilai_ekonomis',
        'biaya_pemeliharaan',
        'tingkat_urgensi',
        'total_nilai'
    ];

    /**
     * Relasi ke Aset
     */
    public function aset()
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }

    /**
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
