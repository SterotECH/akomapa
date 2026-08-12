<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('unauthenticated guests are redirected from the POS', function () {
    $this->get(route('pos.index'))->assertRedirect(route('login'));
});

test('owner can open the POS', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('pos.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Pos')
            ->where('auth.user.id', fn (string $id) => strlen($id) === 26));
});
