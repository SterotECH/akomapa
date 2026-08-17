<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Today's sales summary
        $todaySales = Sale::active()
            ->whereDate('sold_at', today())
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total), 0) as total')
            ->first();

        // Low stock products
        $lowStockProducts = Product::active()
            ->whereColumn('reorder_threshold', '>=', 'stock_on_hand')
            ->with('category')
            ->get();

        // Recent stock movements
        $recentMovements = StockMovement::with('product')
            ->orderBy('occurred_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard', [
            'today' => [
                'sales_count' => $todaySales->count,
                'sales_total' => $todaySales->total,
                'low_stock_count' => $lowStockProducts->count(),
            ],
            'lowStock' => ProductResource::collection($lowStockProducts),
            'recentMovements' => StockMovementResource::collection($recentMovements),
        ]);
    }
}
