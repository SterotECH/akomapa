<?php

namespace Database\Factories;

use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sale_number' => Sale::generateSaleNumber(),
            'customer_id' => null,
            'sold_at' => fake()->dateTimeThisMonth(),
            'total' => fake()->numberBetween(100, 50000),
            'items_count' => fake()->numberBetween(1, 10),
            'voided_at' => null,
            'void_reason' => null,
        ];
    }

    public function withCustomer(): static
    {
        return $this->state(fn () => [
            'customer_id' => CustomerFactory::new(),
        ]);
    }

    public function voided(): static
    {
        return $this->state(fn () => [
            'voided_at' => now(),
            'void_reason' => fake()->sentence(),
        ]);
    }
}
