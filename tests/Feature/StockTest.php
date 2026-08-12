<?php

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
