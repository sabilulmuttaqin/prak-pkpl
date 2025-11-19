<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Transaksi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TransaksiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_transactions()
    {
        Transaksi::factory()->count(3)->create();

        $response = $this->getJson('/api/transaksis');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [['id', 'nama', 'total']]
                ]
            ]);
    }

    /** @test */
    public function it_can_create_a_transaction()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('bukti.jpg');

        $data = [
            'id_transaksi' => 'TRX001',
            'nama' => 'Budi',
            'alamat' => 'Jl. Mawar No. 5',
            'no_telp' => '08123456789',
            'daftar_barang' => 'Cat Food, Cat Toy',
            'total' => 120000,
            'bukti_transfer' => $file,
            'validate' => 'not yet',
        ];

        $response = $this->postJson('/api/transaksis', $data);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Data Transaksi Berhasil Ditambahkan!']);

        $this->assertDatabaseHas('transaksis', ['nama' => 'Budi']);
    }

    /** @test */
    public function it_can_show_a_transaction()
    {
        $trx = Transaksi::factory()->create();

        $response = $this->getJson('/api/transaksis/' . $trx->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Detail Data Transaksi!']);
    }

    /** @test */
    public function it_can_update_a_transaction()
    {
        Storage::fake('public');
        $trx = Transaksi::factory()->create();

        $file = UploadedFile::fake()->image('new_bukti.jpg');

        $data = [
            'nama' => 'Sabil',
            'alamat' => 'Jl. Melati No. 7',
            'no_telp' => '089999999',
            'daftar_barang' => 'Cat Food, Cat Toy, Vitamin',
            'total' => 150000,
            'bukti_transfer' => $file,
            'validate' => 'approved',
        ];

        $response = $this->putJson('/api/transaksis/' . $trx->id, $data);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Data Transaksi Berhasil Diubah!']);

        $this->assertDatabaseHas('transaksis', ['nama' => 'Sabil']);
    }

    /** @test */
    public function it_can_update_status()
    {
        $trx = Transaksi::factory()->create(['validate' => 'not yet']);

        $response = $this->putJson('/api/transaksis/' . $trx->id . '/status', [
            'validate' => 'approved'
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Status updated']);

        $this->assertDatabaseHas('transaksis', ['validate' => 'approved']);
    }

    /** @test */
    public function it_can_delete_a_transaction()
    {
        $trx = Transaksi::factory()->create();

        $response = $this->deleteJson('/api/transaksis/' . $trx->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Deleted']);

        $this->assertDatabaseMissing('transaksis', ['id' => $trx->id]);
    }
}
