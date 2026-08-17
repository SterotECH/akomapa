<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleLineItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Reports', [
            'activeTab' => $request->tab ?? 'stock-levels',
            'dateFrom' => $request->from ?? now()->startOfMonth()->format('Y-m-d'),
            'dateTo' => $request->to ?? now()->format('Y-m-d'),
        ]);
    }

    public function stockLevels(): Response
    {
        $products = Product::with('category')
            ->orderBy('name')
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'category' => $product->category?->name,
                'unit' => $product->unit,
                'stock_on_hand' => $product->stock_on_hand,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'cost_value' => $product->cost_price * $product->stock_on_hand,
                'selling_value' => $product->selling_price * $product->stock_on_hand,
                'is_active' => $product->is_active,
            ]);

        $totalCostValue = $products->sum('cost_value');
        $totalSellingValue = $products->sum('selling_value');

        return Inertia::render('Reports', [
            'activeTab' => 'stock-levels',
            'stockLevels' => $products,
            'totals' => [
                'cost_value' => $totalCostValue,
                'selling_value' => $totalSellingValue,
            ],
        ]);
    }

    public function lowStock(): Response
    {
        $products = Product::active()
            ->lowStock()
            ->with('category')
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'stock_on_hand' => $product->stock_on_hand,
                'reorder_threshold' => $product->reorder_threshold,
                'shortfall' => $product->reorder_threshold - $product->stock_on_hand,
            ])
            ->sortByDesc('shortfall')
            ->values();

        return Inertia::render('Reports', [
            'activeTab' => 'low-stock',
            'lowStock' => $products,
        ]);
    }

    public function sales(Request $request): Response
    {
        $from = $request->from ? Carbon::parse($request->from) : now()->startOfDay();
        $to = $request->to ? Carbon::parse($request->to)->endOfDay() : now()->endOfDay();

        // Non-voided sales in range
        $sales = Sale::active()
            ->whereBetween('sold_at', [$from, $to])
            ->get();

        // Summary
        $summary = [
            'sales_count' => $sales->count(),
            'total_revenue' => $sales->sum('total'),
            'items_sold' => $sales->sum('items_count'),
        ];

        // Items sold breakdown
        $itemsSold = SaleLineItem::whereHas('sale', fn ($q) => $q->active())
            ->whereHas('sale', fn ($q) => $q->whereBetween('sold_at', [$from, $to]))
            ->with('product')
            ->get()
            ->groupBy('product_id')
            ->map(fn ($items, $productId) => [
                'product_id' => $productId,
                'sku' => $items->first()->product?->sku,
                'name' => $items->first()->product?->name ?? 'Deleted Product',
                'unit' => $items->first()->product?->unit,
                'quantity_sold' => $items->sum('quantity'),
                'gross_revenue' => $items->sum('line_total'),
            ])
            ->values();

        // Voided sales in range
        $voidedSales = Sale::voided()
            ->whereBetween('voided_at', [$from, $to])
            ->get();

        $voidedSummary = [
            'count' => $voidedSales->count(),
            'value' => $voidedSales->sum('total'),
        ];

        return Inertia::render('Reports', [
            'activeTab' => 'sales',
            'sales' => [
                'summary' => $summary,
                'items_sold' => $itemsSold,
                'voided' => $voidedSummary,
            ],
            'dateFrom' => $from->format('Y-m-d'),
            'dateTo' => $to->format('Y-m-d'),
        ]);
    }
}
