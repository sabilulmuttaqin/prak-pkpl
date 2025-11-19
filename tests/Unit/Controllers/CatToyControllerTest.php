<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\cat_toy;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CatToyControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_store_new_cat_toy()
    {
        Storage::fake('public/cat_toys');

        $file = UploadedFile::fake()->image('toy.jpg');

        $response = $this->postJson('/api/cat_toys', [
            'product_name' => 'Mainan Bola',
            'image' => $file,
            'description' => 'Mainan bola warna-warni untuk kucing.',
            'stock' => 10,
            'price' => 15000,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Data Cat Toys Berhasil Ditambahkan!'
            ]);

        Storage::disk('public')->assertExists('cat_toys/' . $file->hashName());
        $this->assertDatabaseHas('cat_toys', ['product_name' => 'Mainan Bola']);
    }

    /** @test */
    public function it_can_show_a_cat_toy()
    {
        $toy = cat_toy::factory()->create();

        $response = $this->getJson('/api/cat_toys/' . $toy->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'product_name', 'description', 'stock', 'price']
            ]);
    }

    /** @test */
    public function it_can_update_a_cat_toy()
    {
        Storage::fake('public');
        $toy = cat_toy::factory()->create();

        $response = $this->putJson('/api/cat_toys/' . $toy->id, [
            'product_name' => 'Mainan Tikus Updated',
            'description' => 'Mainan tikus dengan bahan kain lembut.',
            'stock' => 25,
            'price' => 20000,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Data Cat Toys Berhasil Diubah!'
            ]);

        $this->assertDatabaseHas('cat_toys', ['product_name' => 'Mainan Tikus Updated']);
    }

    /** @test */
    public function it_can_delete_a_cat_toy()
    {
        Storage::fake('public/cat_toys');

        $toy = cat_toy::factory()->create(['image' => 'toy_delete.jpg']);

        // Simulasi file ada di storage
        Storage::disk('public')->put('cat_toys/toy_delete.jpg', 'dummy content');

        $response = $this->deleteJson('/api/cat_toys/' . $toy->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Data Cat Toys Berhasil Dihapus!'
            ]);

        Storage::disk('public')->assertMissing('cat_toys/toy_delete.jpg');
        $this->assertDatabaseMissing('cat_toys', ['id' => $toy->id]);
    }
}
