<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatScan extends Model
{
    protected $table = 'riwayat_scans';
    protected $primaryKey = 'scan_id';

    protected $fillable = [
        'aset_id',
        'lokasi_id',
        'user_id',
    ];

    public function aset()
    {
        return $this->belongsTo(Aset::class, 'aset_id');
    }

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class, 'lokasi_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
