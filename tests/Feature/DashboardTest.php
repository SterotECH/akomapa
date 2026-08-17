<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('unauthenticated guests are redirected from the dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('owner can open the dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('auth.user.id', fn (string $id) => strlen($id) === 26));
});

test('dashboard returns today summary and low stock', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['reorder_threshold' => 100]);

    // Create today's sale
    Sale::factory()->create([
        'total' => 5000,
        'items_count' => 2,
        'sold_at' => now(),
    ]);

    // Create low stock product movement
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 5,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('today')
            ->has('lowStock')
            ->has('recentMovements'));
});
