<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class cat_toyFactory extends Factory
{
    protected $model = \App\Models\cat_toy::class;

    public function definition(): array
    {
        return [
            'product_name' => $this->faker->word(),
            'image' => 'dummy.jpg',
            'description' => $this->faker->sentence(),
            'stock' => $this->faker->numberBetween(1, 20),
            'price' => $this->faker->numberBetween(10000, 50000),
        ];
    }
}
