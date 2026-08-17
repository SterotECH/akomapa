<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('/pos', [PosController::class, 'index'])
        ->name('pos.index');

    Route::get('/products', [ProductsController::class, 'index'])
        ->name('products.index');

    Route::get('/stock', [StockController::class, 'index'])
        ->name('stock.index');

    Route::get('/reports', [ReportsController::class, 'index'])
        ->name('reports.index');
});
