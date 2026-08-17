<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('unauthenticated guests are redirected from the reports screen', function () {
    $this->get(route('reports.index'))->assertRedirect(route('login'));
});

test('owner can open the reports screen', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports')
            ->has('activeTab')
            ->has('dateFrom')
            ->has('dateTo'));
});

test('stock levels endpoint returns product data', function () {
    $user = User::factory()->create();
    Product::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('reports.stock-levels'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports')
            ->has('stockLevels', 3)
            ->has('totals'));
});

test('low stock endpoint returns low stock products', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['reorder_threshold' => 100]);

    StockMovement::factory()->create([
        'product_id' => $product->id,
        'type' => StockMovement::TYPE_RESTOCK,
        'quantity' => 5,
    ]);

    $this->actingAs($user)
        ->get(route('reports.low-stock'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports')
            ->has('lowStock', 1));
});

test('sales endpoint returns sales data with date range', function () {
    $user = User::factory()->create();

    Sale::factory()->create([
        'total' => 3000,
        'items_count' => 1,
        'sold_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('reports.sales', [
            'from' => now()->startOfDay()->toDateString(),
            'to' => now()->endOfDay()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reports')
            ->has('sales.summary')
            ->where('sales.summary.sales_count', 1)
            ->where('sales.summary.total_revenue', 3000));
});
