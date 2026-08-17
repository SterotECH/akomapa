<?php

namespace Database\Factories;

use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => ProductFactory::new(),
            'type' => StockMovement::TYPE_RESTOCK,
            'quantity' => fake()->numberBetween(1, 100),
            'occurred_at' => fake()->dateTimeThisMonth(),
            'note' => null,
            'sale_id' => null,
        ];
    }

    public function restock(): static
    {
        return $this->state(fn () => [
            'type' => StockMovement::TYPE_RESTOCK,
            'quantity' => fake()->numberBetween(1, 100),
        ]);
    }

    public function sale(): static
    {
        return $this->state(fn () => [
            'type' => StockMovement::TYPE_SALE,
            'quantity' => -fake()->numberBetween(1, 10),
        ]);
    }

    public function adjustment(): static
    {
        return $this->state(fn () => [
            'type' => StockMovement::TYPE_ADJUSTMENT,
        ]);
    }
}
