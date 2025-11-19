<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Transaksi extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_transaksi',
        'nama',
        'alamat',
        'no_telp',
        'daftar_barang',
        'total',
        'bukti_transfer',
        'validate',
    ];

    protected $casts = [
        'daftar_barang' => 'array',
    ];

    protected function image(): Attribute
    {
        return Attribute::make(get: fn($bukti_transfer) => url('/storage/bukti_transfer/' . $bukti_transfer),);
    }
}
