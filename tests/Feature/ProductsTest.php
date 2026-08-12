<?php

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
