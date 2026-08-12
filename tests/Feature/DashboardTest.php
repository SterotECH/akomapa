<?php

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
