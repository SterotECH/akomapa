<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::active()
            ->with('category')
            ->orderBy('name')
            ->get();

        $categories = Category::orderBy('name')->get();

        // Today's sales summary
        $todaySales = Sale::active()
            ->whereDate('sold_at', today())
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total), 0) as total')
            ->first();

        return Inertia::render('Pos', [
            'products' => ProductResource::collection($products)->resolve(),
            'categories' => CategoryResource::collection($categories)->resolve(),
            'today_sales' => [
                'count' => $todaySales->count,
                'total' => $todaySales->total,
            ],
        ]);
    }
}
