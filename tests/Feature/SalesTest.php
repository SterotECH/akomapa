<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;

test('unauthenticated user cannot create sale', function () {
    $product = Product::factory()->create();

    $this->post(route('sales.store'), [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertRedirect(route('login'));
});

test('owner can create a sale', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['selling_price' => 1000]);

    // Give product stock
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 50,
    ]);

    $this->actingAs($user)
        ->post(route('sales.store'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('sales', [
        'total' => 2000,
        'items_count' => 2,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_SALE,
        'quantity' => -2,
    ]);
});

test('sale with insufficient stock fails', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    // Give minimal stock
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 5,
    ]);

    $this->actingAs($user)
        ->post(route('sales.store'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 10],
            ],
        ])
        ->assertSessionHasErrors("items.{$product->id}");
});

test('sale with empty items fails', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('sales.store'), [
            'items' => [],
        ])
        ->assertSessionHasErrors('items');
});

test('owner can void a same-day sale', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['selling_price' => 1000]);

    // Give stock
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 50,
    ]);

    // Create sale
    $this->actingAs($user)->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 3],
        ],
    ]);

    $sale = Sale::first();

    $this->actingAs($user)
        ->post(route('sales.void', $sale->id))
        ->assertRedirect();

    $this->assertDatabaseHas('sales', [
        'id' => $sale->id,
        'voided_at' => now()->format('Y-m-d H:i:s'),
    ]);

    // Stock should be restored
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_ADJUSTMENT,
        'quantity' => 3,
        'sale_id' => $sale->id,
    ]);
});
