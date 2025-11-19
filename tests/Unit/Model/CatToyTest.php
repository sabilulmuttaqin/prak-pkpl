<?php

namespace Tests\Unit\Model;

use Tests\TestCase;
use App\Models\cat_toy;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CatToyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_cat_toy()
    {
        $toy = cat_toy::create([
            'product_name' => 'Mainan Bola',
            'image' => 'toy.jpg',
            'description' => 'Mainan bola berwarna-warni untuk kucing.',
            'stock' => 5,
            'price' => 10000,
        ]);

        $this->assertDatabaseHas('cat_toys', ['product_name' => 'Mainan Bola']);
    }

    /** @test */
    public function it_returns_correct_image_url()
    {
        $toy = cat_toy::create([
            'product_name' => 'Mainan Tikus',
            'image' => 'toy.jpg',
            'description' => 'Mainan lucu berbentuk tikus kecil.',
            'stock' => 5,
            'price' => 12000,
        ]);

        $this->assertStringContainsString(
            '/storage/cat_toys/',
            $toy->image
        );
    }
}
