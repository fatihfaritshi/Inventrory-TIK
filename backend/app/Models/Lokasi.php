<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Aset; 

class Lokasi extends Model
{
    use HasFactory;

    protected $table = 'lokasis';

    protected $fillable = [
        'nama_lokasi',
        'deskripsi',
    ];

    public function asets()
    {
        return $this->hasMany(Aset::class, 'lokasi_id');
    }
}