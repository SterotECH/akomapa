<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustmentRequest;
use App\Http\Requests\RestockRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $movements = StockMovement::with('product')
            ->orderBy('occurred_at', 'desc')
            ->limit(100)
            ->get();

        $lowStockProducts = Product::active()
            ->whereColumn('reorder_threshold', '>=', 'stock_on_hand')
            ->with('category')
            ->get();

        return Inertia::render('Stock', [
            'movements' => StockMovementResource::collection($movements),
            'lowStock' => ProductResource::collection($lowStockProducts),
            'products' => ProductResource::collection(Product::active()->orderBy('name')->get()),
        ]);
    }

    public function restock(RestockRequest $request): RedirectResponse
    {
        $items = $request->validated('items');
        $note = $request->validated('note');
        $occurredAt = $request->validated('occurred_at') ?? now();

        foreach ($items as $item) {
            Product::where('id', $item['product_id'])->increment('stock_on_hand', $item['quantity']);

            StockMovement::create([
                'product_id' => $item['product_id'],
                'type' => StockMovement::TYPE_RESTOCK,
                'quantity' => $item['quantity'],
                'occurred_at' => $occurredAt,
                'note' => $note,
            ]);
        }

        return redirect()->route('stock.index')->with('success', 'Stock restocked.');
    }

    public function adjustments(AdjustmentRequest $request): RedirectResponse
    {
        $items = $request->validated('items');
        $note = $request->validated('note');
        $occurredAt = $request->validated('occurred_at') ?? now();

        foreach ($items as $item) {
            $quantity = $item['quantity'];
            $product = Product::findOrFail($item['product_id']);

            // Prevent negative stock
            if ($product->stock_on_hand + $quantity < 0) {
                return redirect()->route('stock.index')->with('error', "Insufficient stock for {$product->name}. Current: {$product->stock_on_hand}");
            }

            StockMovement::create([
                'product_id' => $item['product_id'],
                'type' => StockMovement::TYPE_ADJUSTMENT,
                'quantity' => $quantity,
                'occurred_at' => $occurredAt,
                'note' => $note,
            ]);
        }

        return redirect()->route('stock.index')->with('success', 'Stock adjusted.');
    }
}
