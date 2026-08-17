<?php

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('unauthenticated guests are redirected from the stock screen', function () {
    $this->get(route('stock.index'))->assertRedirect(route('login'));
});

test('owner can open the stock screen', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('stock.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Stock')
            ->where('auth.user.id', fn (string $id) => strlen($id) === 26));
});

test('stock index returns products, movements, and low stock', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['reorder_threshold' => 100]);
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => 'restock',
        'quantity' => 50,
    ]);

    $this->actingAs($user)
        ->get(route('stock.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Stock')
            ->has('products')
            ->has('movements')
            ->has('lowStock', 1));
});

test('owner can restock a product', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)
        ->post(route('stock.restock'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 50],
            ],
            'note' => 'Initial stock',
            'occurred_at' => now()->toIso8601String(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 50,
    ]);
});

test('owner can adjust stock', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => 'restock',
        'quantity' => 100,
    ]);

    $this->actingAs($user)
        ->post(route('stock.adjustments'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => -10],
            ],
            'note' => 'Damaged',
            'occurred_at' => now()->toIso8601String(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_ADJUSTMENT,
        'quantity' => -10,
    ]);
});

test('restock with empty items fails', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('stock.restock'), [
            'items' => [],
            'note' => 'Empty restock',
        ])
        ->assertSessionHasErrors('items');
});

test('unauthenticated user cannot restock', function () {
    $product = Product::factory()->create();

    $this->post(route('stock.restock'), [
        'items' => [['product_id' => $product->id, 'quantity' => 10]],
        'note' => 'Guest restock',
    ])->assertRedirect(route('login'));
});
