<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('unauthenticated guests are redirected from the products screen', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

test('owner can open the products screen', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Products')
            ->where('auth.user.id', fn (string $id) => strlen($id) === 26));
});

test('products index returns products and categories', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    Product::factory()->count(3)->create(['category_id' => $category->id]);

    $this->actingAs($user)
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Products')
            ->has('products', 3)
            ->has('categories', 1));
});

test('owner can create a product', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($user)
        ->post(route('products.store'), [
            'sku' => 'TEST-001',
            'name' => 'Test Product',
            'unit' => 'piece',
            'cost_price' => 500,
            'selling_price' => 800,
            'reorder_threshold' => 10,
            'category_id' => $category->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'sku' => 'TEST-001',
        'name' => 'Test Product',
    ]);
});

test('creating product with duplicate sku fails', function () {
    $user = User::factory()->create();
    Product::factory()->create(['sku' => 'DUP-001']);

    $this->actingAs($user)
        ->post(route('products.store'), [
            'sku' => 'DUP-001',
            'name' => 'Duplicate Product',
            'unit' => 'piece',
            'cost_price' => 500,
            'selling_price' => 800,
            'reorder_threshold' => 10,
        ])
        ->assertSessionHasErrors('sku');
});

test('creating product with missing required fields fails', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('products.store'), [])
        ->assertSessionHasErrors(['sku', 'name', 'unit', 'cost_price', 'selling_price', 'reorder_threshold']);
});

test('owner can update a product', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['name' => 'Original Name']);

    $this->actingAs($user)
        ->patch(route('products.update', $product->id), [
            'sku' => $product->sku,
            'name' => 'Updated Name',
            'unit' => 'box',
            'cost_price' => 1000,
            'selling_price' => 1500,
            'reorder_threshold' => 20,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Name',
    ]);
});

test('owner can deactivate a product', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch(route('products.deactivate', $product->id))
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'is_active' => false,
    ]);
});

test('unauthenticated user cannot create product', function () {
    $this->post(route('products.store'), [
        'sku' => 'GUEST-001',
        'name' => 'Guest Product',
        'unit' => 'piece',
        'cost_price' => 500,
        'selling_price' => 800,
        'reorder_threshold' => 10,
    ])->assertRedirect(route('login'));
});
