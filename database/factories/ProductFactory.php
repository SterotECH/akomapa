<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => strtoupper(fake()->bothify('???-####')),
            'name' => fake()->words(3, true),
            'barcode' => fake()->unique()->numerify('############'),
            'unit' => fake()->randomElement(['piece', 'box', 'kg', 'bag', 'bottle']),
            'cost_price' => fake()->numberBetween(100, 50000),
            'selling_price' => fn (array $attributes) => $attributes['cost_price'] + fake()->numberBetween(50, 10000),
            'reorder_threshold' => fake()->numberBetween(5, 50),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function withCategory(): static
    {
        return $this->state(fn () => [
            'category_id' => CategoryFactory::new(),
        ]);
    }
}
