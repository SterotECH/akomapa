<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Shop identity
    |--------------------------------------------------------------------------
    |
    | The shop's public identity, shown across the app (topbar, reports,
    | print headers) and read from here rather than hardcoded in views.
    |
    */

    'name' => 'Akomapa Neat Enterprise',

    'address' => 'Ablekuma 10 Plot, GC-104-444',

    /*
    |--------------------------------------------------------------------------
    | Owner credentials
    |--------------------------------------------------------------------------
    |
    | The single Owner account (ADR-0005) is seeded from here. Only one user
    | exists in the system, so the default password is the known login for
    | this prototype and must be changed before any real deployment.
    |
    */

    'owner' => [
        'name' => 'Akomapa Owner',
        'username' => 'owner',
        'password' => env('SHOP_OWNER_PASSWORD', 'akomapa123'),
    ],

];
