<?php

namespace Database\Factories;

use App\Models\cat_food;
use Illuminate\Database\Eloquent\Factories\Factory;

class cat_foodFactory extends Factory
{
    protected $model = cat_food::class;

    public function definition()
    {
        return [
            'product_name' => $this->faker->word(),
            'image' => 'default.jpg',
            'description' => $this->faker->sentence(10),
            'stock' => $this->faker->numberBetween(1, 50),
            'price' => $this->faker->numberBetween(10000, 50000),
        ];
    }
}
