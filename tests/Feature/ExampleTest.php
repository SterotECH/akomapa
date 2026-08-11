<?php

use App\Models\User;

test('root redirects into the app shell', function () {
    $this->get('/')->assertRedirect(route('dashboard'));
});

test('authed shell routes render the placeholder shell', function () {
    $this->actingAs(User::factory()->create());

    foreach (['dashboard', 'pos.index', 'products.index', 'stock.index', 'reports.index'] as $route) {
        $this->get(route($route))->assertOk();
    }
});

test('logout signs the owner out', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('logout'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});
