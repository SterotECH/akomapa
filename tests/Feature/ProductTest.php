<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleLineItem;
use App\Models\StockMovement;
use App\Models\User;

test('stock_on_hand accessor sums restock minus sale quantities', function () {
    $product = Product::factory()->create();

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 100,
    ]);
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_SALE,
        'quantity' => -30,
    ]);
    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_ADJUSTMENT,
        'quantity' => -5,
    ]);

    expect($product->fresh()->stock_on_hand)->toBe(65);
});

test('stock_on_hand is zero with no movements', function () {
    $product = Product::factory()->create();

    expect($product->stock_on_hand)->toBe(0);
});

test('is_low_stock returns true when stock at or below threshold', function () {
    $product = Product::factory()->create(['reorder_threshold' => 10]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 10,
    ]);

    expect($product->fresh()->is_low_stock)->toBeTrue();
});

test('is_low_stock returns false when stock above threshold', function () {
    $product = Product::factory()->create(['reorder_threshold' => 5]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 20,
    ]);

    expect($product->fresh()->is_low_stock)->toBeFalse();
});

test('stock_value accessor returns cost_price times stock_on_hand', function () {
    $product = Product::factory()->create(['cost_price' => 500]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 10,
    ]);

    expect($product->fresh()->stock_value)->toBe(5000);
});

test('over-sell guard prevents selling more than available', function () {
    $product = Product::factory()->create(['selling_price' => 1000]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 5,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('sales.store'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 10],
            ],
        ])
        ->assertSessionHasErrors("items.{$product->id}");
});

test('sale total is calculated from line items', function () {
    $product = Product::factory()->create(['selling_price' => 2500]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 50,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('sales.store'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
        ]);

    $sale = Sale::first();
    expect($sale->total)->toBe(7500);
    expect($sale->items_count)->toBe(3);
});

test('sale creates line items with correct snapshot', function () {
    $product = Product::factory()->create([
        'selling_price' => 1000,
        'unit' => 'piece',
    ]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 20,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('sales.store'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ]);

    $lineItem = SaleLineItem::first();
    expect($lineItem->quantity)->toBe(2);
    expect($lineItem->unit_price)->toBe(1000);
    expect($lineItem->line_total)->toBe(2000);
    $snapshot = json_decode($lineItem->product_snapshot, true);
    expect($snapshot)->toHaveKey('name');
    expect($snapshot['name'])->toBe($product->name);
});

test('voiding a sale restores stock via adjustment movement', function () {
    $product = Product::factory()->create(['selling_price' => 500]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 30,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)->post(route('sales.store'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 4],
        ],
    ]);

    $sale = Sale::first();
    $stockBefore = $product->fresh()->stock_on_hand;

    $this->actingAs($user)->post(route('sales.void', $sale->id));

    // Stock should be restored
    $stockAfter = $product->fresh()->stock_on_hand;
    expect($stockAfter)->toBe($stockBefore + 4);
});
