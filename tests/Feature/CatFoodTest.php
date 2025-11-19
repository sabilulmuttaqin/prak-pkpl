<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\cat_food;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\WithoutMiddleware;

class CatFoodTest extends TestCase
{
    use RefreshDatabase, WithFaker, WithoutMiddleware;

    /** @test */
    public function it_can_list_cat_foods()
    {
        // Buat user
        $user = User::factory()->create();

        // Buat data dummy cat_food
        cat_food::factory(3)->create();

        // Jalankan request dengan autentikasi user
        $response = $this->actingAs($user)->getJson('/api/cat_foods');

        // Cek respons
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'current_page',
                    'data' => [
                        ['id', 'product_name', 'price', 'stock']
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_create_a_cat_food()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $data = [
            'product_name' => 'Whiskas Tuna',
            'image' => UploadedFile::fake()->image('whiskas.jpg'),
            'description' => 'Makanan kucing rasa tuna segar untuk bulu halus dan sehat.',
            'stock' => 10,
            'price' => 25000,
        ];

        $response = $this->actingAs($user)->postJson('/api/cat_foods', $data);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Data Cat Food Berhasil Ditambahkan!']);

        $this->assertDatabaseHas('cat_foods', ['product_name' => 'Whiskas Tuna']);
    }

    /** @test */
    public function it_can_show_a_cat_food()
    {
        $user = User::factory()->create();
        $cat = cat_food::factory()->create();

        $response = $this->actingAs($user)->getJson("/api/cat_foods/{$cat->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Detail Data Post!']);
    }

    /** @test */
    public function it_can_update_a_cat_food()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $cat = cat_food::factory()->create();

        $data = [
            'product_name' => 'Me-O Chicken',
            'stock' => 15,
            'price' => 27000,
            'description' => 'Me-O rasa ayam premium bergizi tinggi untuk kucing sehat.'
        ];

        $response = $this->actingAs($user)->putJson("/api/cat_foods/{$cat->id}", $data);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Data Cat Food Berhasil Diubah!']);

        $this->assertDatabaseHas('cat_foods', ['product_name' => 'Me-O Chicken']);
    }

    /** @test */
    public function it_can_delete_a_cat_food()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $cat = cat_food::factory()->create([
            'image' => 'old_image.jpg'
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/cat_foods/{$cat->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Data Cat Food Berhasil Dihapus!']);

        $this->assertDatabaseMissing('cat_foods', ['id' => $cat->id]);
    }
}
