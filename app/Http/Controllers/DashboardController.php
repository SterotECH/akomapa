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
            ->lowStock()
            ->with('category')
            ->get();

        // Recent stock movements
        $recentMovements = StockMovement::with('product')
            ->orderBy('occurred_at', 'desc')
            ->limit(10)
            ->get();

        // Last 7 days sales for chart
        $chartData = Sale::active()
            ->where('sold_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('date(sold_at) as date, COALESCE(SUM(total), 0) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->date => $row->total]);

        $salesChart = collect(range(0, 6))
            ->map(fn ($i) => [
                'label' => now()->subDays(6 - $i)->format('D'),
                'value' => $chartData[now()->subDays(6 - $i)->format('Y-m-d')] ?? 0,
            ])
            ->toArray();

        return Inertia::render('Dashboard', [
            'today' => [
                'sales_count' => $todaySales->count,
                'sales_total' => $todaySales->total,
                'low_stock_count' => $lowStockProducts->count(),
            ],
            'lowStock' => ProductResource::collection($lowStockProducts)->resolve(),
            'recentMovements' => StockMovementResource::collection($recentMovements)->resolve(),
            'salesChart' => $salesChart,
        ]);
    }
}
