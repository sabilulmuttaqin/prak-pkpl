<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\cat_food;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CatFoodTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_cat_food_record()
    {
        $catFood = cat_food::create([
            'product_name' => 'Whiskas Tuna',
            'image' => 'whiskas.jpg',
            'description' => 'Makanan kucing bergizi tinggi dan lezat.',
            'stock' => 10,
            'price' => 25000,
        ]);

        $this->assertDatabaseHas('cat_foods', [
            'product_name' => 'Whiskas Tuna'
        ]);
    }

    /** @test */
    public function it_returns_correct_image_url()
    {
        $catFood = cat_food::create([
            'product_name' => 'Meo Adult',
            'image' => 'meo.jpg',
            'description' => 'Makanan kucing sehat dan bergizi.',
            'stock' => 20,
            'price' => 30000,
        ]);

        $this->assertStringContainsString(
            '/storage/cat_foods/',
            $catFood->image
        );
    }
}
