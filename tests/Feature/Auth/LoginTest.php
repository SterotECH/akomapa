<?php

use App\Models\User;

test('guest can see the login screen', function () {
    $this->get(route('login'))->assertOk();
});

test('authenticated users are redirected away from the login screen', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('login'))
        ->assertRedirect(route('dashboard'));
});

test('unauthenticated guests are redirected to the login screen', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('owner can log in with valid credentials', function () {
    User::factory()->create([
        'username' => 'owner',
        'password' => 'akomapa123',
    ]);

    $this->post(route('login'), [
        'username' => 'owner',
        'password' => 'akomapa123',
    ])
        ->assertRedirect(route('pos.index'));

    $this->assertAuthenticated();
});

test('login with an invalid password shows a generic error', function () {
    User::factory()->create([
        'username' => 'owner',
        'password' => 'akomapa123',
    ]);

    $this->from(route('login'))
        ->post(route('login'), [
            'username' => 'owner',
            'password' => 'wrong-password',
        ])
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('username');

    $this->assertGuest();
});

test('login is rate limited after repeated failures', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->from(route('login'))
            ->post(route('login'), [
                'username' => $user->username,
                'password' => 'wrong-password',
            ]);
    }

    $this->from(route('login'))
        ->post(route('login'), [
            'username' => $user->username,
            'password' => 'wrong-password',
        ])
        ->assertStatus(429);
});

test('owner can log out', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});
