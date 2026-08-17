<?php

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
            ->where('auth.user.id', fn (string $id) => strlen($id) === 26));
});
