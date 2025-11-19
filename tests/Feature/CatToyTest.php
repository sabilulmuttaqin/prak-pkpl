<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\cat_toy;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CatToyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_cat_toys()
    {
        cat_toy::factory()->count(3)->create();

        $response = $this->getJson('/api/cat_toys');

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
    public function it_can_create_a_cat_toy()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('toy.jpg');

        $data = [
            'product_name' => 'Bola Tikus',
            'image' => $file,
            'description' => 'Mainan kucing berbentuk bola dengan bulu.',
            'stock' => 5,
            'price' => 15000,
        ];

        $response = $this->postJson('/api/cat_toys', $data);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('cat_toys', ['product_name' => 'Bola Tikus']);
    }

    /** @test */
    public function it_can_show_a_cat_toy()
    {
        $toy = cat_toy::factory()->create();

        $response = $this->getJson('/api/cat_toys/' . $toy->id);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /** @test */
    public function it_can_update_a_cat_toy()
    {
        $toy = cat_toy::factory()->create();

        $data = [
            'product_name' => 'Mainan Baru',
            'stock' => 10,
            'price' => 30000,
            'description' => 'Deskripsi update mainan kucing',
        ];

        $response = $this->putJson('/api/cat_toys/' . $toy->id, $data);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('cat_toys', ['product_name' => 'Mainan Baru']);
    }

    /** @test */
    public function it_can_delete_a_cat_toy()
    {
        Storage::fake('public');
        $toy = cat_toy::factory()->create([
            'image' => 'dummy.jpg'
        ]);

        $response = $this->deleteJson('/api/cat_toys/' . $toy->id);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('cat_toys', ['id' => $toy->id]);
    }
}
