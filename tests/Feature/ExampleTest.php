<?php

test('root redirects into the app shell', function () {
    $this->get('/')->assertRedirect(route('dashboard'));
});

test('authed shell routes render the placeholder shell', function () {
    foreach (['dashboard', 'pos.index', 'products.index', 'stock.index', 'reports.index'] as $route) {
        $this->get(route($route))->assertOk();
    }
});

test('logout returns to the dashboard', function () {
    $this->post(route('logout'))->assertRedirect(route('dashboard'));
});
