<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penilaian extends Model
{
    use HasFactory;

    // ✅ Set primary key custom
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

    // ✅ Cast total_nilai sebagai double
    protected $casts = [
        'total_nilai' => 'double',
        'aset_id' => 'integer',
        'user_id' => 'integer',
    ];

    /**
     * Relasi ke Aset
     */
    public function aset()
    {
        return $this->belongsTo(Aset::class, 'aset_id', 'id');
    }

    /**
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}