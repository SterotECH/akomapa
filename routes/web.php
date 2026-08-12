<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::inertia('/pos', 'Placeholder', ['title' => 'POS', 'task' => 'T6'])
        ->name('pos.index');

    Route::inertia('/products', 'Placeholder', ['title' => 'Products', 'task' => 'T7'])
        ->name('products.index');

    Route::inertia('/stock', 'Placeholder', ['title' => 'Stock', 'task' => 'T8'])
        ->name('stock.index');

    Route::inertia('/reports', 'Placeholder', ['title' => 'Reports', 'task' => 'T9'])
        ->name('reports.index');
});
