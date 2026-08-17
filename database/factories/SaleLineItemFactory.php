<?php

namespace Database\Factories;

use App\Models\SaleLineItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleLineItem>
 */
class SaleLineItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sale_id' => SaleFactory::new(),
            'product_id' => ProductFactory::new(),
            'product_snapshot' => json_encode([
                'name' => fake()->words(3, true),
                'sku' => strtoupper(fake()->bothify('???-####')),
                'unit' => fake()->randomElement(['piece', 'box', 'kg']),
            ]),
            'quantity' => fake()->numberBetween(1, 10),
            'unit_price' => fake()->numberBetween(100, 50000),
            'line_total' => fn (array $attributes) => $attributes['quantity'] * $attributes['unit_price'],
        ];
    }
}
