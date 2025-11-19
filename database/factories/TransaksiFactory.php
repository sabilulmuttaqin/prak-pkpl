<?php

namespace Database\Factories;

use App\Models\Transaksi;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransaksiFactory extends Factory
{
    protected $model = Transaksi::class;

    public function definition()
    {
        return [
            'id_transaksi' => 'TRX-' . $this->faker->unique()->numerify('###'),
            'nama' => $this->faker->name(),
            'alamat' => $this->faker->address(),
            'no_telp' => $this->faker->phoneNumber(),
            'daftar_barang' => $this->faker->sentence(3),
            'total' => $this->faker->numberBetween(10000, 100000),
            'bukti_transfer' => 'dummy.jpg',
            'validate' => 'not yet',
        ];
    }
}
