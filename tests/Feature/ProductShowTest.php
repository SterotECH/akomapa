<?php

use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('renders the product show page', function () {
    $product = Product::factory()->create();

    $this->get(route('products.show', $product))
        ->assertStatus(200);
});

it('shows 404 for missing product', function () {
    $this->get(route('products.show', 'nonexistent-id'))
        ->assertStatus(404);
});
