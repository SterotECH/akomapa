<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('/pos', [PosController::class, 'index'])
        ->name('pos.index');

    // Products
    Route::get('/products', [ProductsController::class, 'index'])
        ->name('products.index');
    Route::get('/products/{product}', [ProductsController::class, 'show'])
        ->name('products.show');
    Route::post('/products', [ProductsController::class, 'store'])
        ->name('products.store');
    Route::patch('/products/{product}', [ProductsController::class, 'update'])
        ->name('products.update');
    Route::patch('/products/{product}/deactivate', [ProductsController::class, 'deactivate'])
        ->name('products.deactivate');
    Route::post('/products/import', [ProductsController::class, 'import'])
        ->name('products.import');
    Route::get('/products/import/template', [ProductsController::class, 'importTemplate'])
        ->name('products.import-template');

    // Categories
    Route::get('/categories', [CategoriesController::class, 'index'])
        ->name('categories.index');
    Route::get('/categories/{category}', [CategoriesController::class, 'show'])
        ->name('categories.show');
    Route::post('/categories', [CategoriesController::class, 'store'])
        ->name('categories.store');
    Route::patch('/categories/{category}', [CategoriesController::class, 'update'])
        ->name('categories.update');
    Route::delete('/categories/{category}', [CategoriesController::class, 'destroy'])
        ->name('categories.destroy');

    // Stock
    Route::get('/stock', [StockController::class, 'index'])
        ->name('stock.index');
    Route::post('/stock/restock', [StockController::class, 'restock'])
        ->name('stock.restock');
    Route::post('/stock/adjustments', [StockController::class, 'adjustments'])
        ->name('stock.adjustments');
    Route::post('/stock/import', [StockController::class, 'import'])
        ->name('stock.import');

    // Sales
    Route::post('/sales', [SalesController::class, 'store'])
        ->name('sales.store');
    Route::post('/sales/{sale}/void', [SalesController::class, 'void'])
        ->name('sales.void');

    // Reports
    Route::get('/reports', [ReportsController::class, 'index'])
        ->name('reports.index');
    Route::get('/reports/stock-levels', [ReportsController::class, 'stockLevels'])
        ->name('reports.stock-levels');
    Route::get('/reports/low-stock', [ReportsController::class, 'lowStock'])
        ->name('reports.low-stock');
    Route::get('/reports/sales', [ReportsController::class, 'sales'])
        ->name('reports.sales');

    // Backup
    Route::get('/backup/download', [BackupController::class, 'download'])
        ->name('backup.download');
});
