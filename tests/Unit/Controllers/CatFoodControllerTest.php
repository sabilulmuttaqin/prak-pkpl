<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\cat_food;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CatFoodControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_store_new_cat_food()
    {
        Storage::fake('public/cat_foods');
        $file = UploadedFile::fake()->image('whiskas.jpg');

        $response = $this->postJson('/api/cat_foods', [
            'product_name' => 'Whiskas Premium',
            'image' => $file,
            'description' => 'Makanan kucing berkualitas premium.',
            'stock' => 15,
            'price' => 35000,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Data Cat Food Berhasil Ditambahkan!'
            ]);

        Storage::disk('public')->assertExists('cat_foods/' . $file->hashName());
    }
    /** @test */
    public function it_can_show_single_cat_food()
    {
        $catFood = cat_food::factory()->create();

        $response = $this->getJson('/api/cat_foods/' . $catFood->id);
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'product_name', 'description', 'price', 'stock']
            ]);
    }

    /** @test */
    public function it_can_update_cat_food()
    {
        Storage::fake('public');
        $catFood = cat_food::factory()->create();

        $response = $this->putJson('/api/cat_foods/' . $catFood->id, [
            'product_name' => 'Whiskas Updated',
            'description' => 'Deskripsi baru yang sudah diperbarui.',
            'stock' => 30,
            'price' => 45000,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Data Cat Food Berhasil Diubah!'
            ]);

        $this->assertDatabaseHas('cat_foods', ['product_name' => 'Whiskas Updated']);
    }

    /** @test */
    public function it_can_delete_cat_food()
    {
        Storage::persistentFake('public/cat_foods');
        $catFood = cat_food::factory()->create([
            'image' => 'delete_me.jpg',
        ]);

        Storage::disk('public')->put('cat_foods/delete_me.jpg', 'dummy content');

        $response = $this->deleteJson('/api/cat_foods/' . $catFood->id);
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Data Cat Food Berhasil Dihapus!'
            ]);

        Storage::disk('public')->assertMissing('cat_foods/delete_me.jpg');
        $this->assertDatabaseMissing('cat_foods', ['id' => $catFood->id]);
    }
}
