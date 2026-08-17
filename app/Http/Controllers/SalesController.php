<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaleStoreRequest;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleLineItem;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesController extends Controller
{
    public function store(SaleStoreRequest $request): RedirectResponse
    {
        $items = $request->validated('items');
        $customerId = $request->validated('customer_id');

        return DB::transaction(function () use ($items, $customerId) {
            // Validate stock availability (NFR-3: no negative stock)
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        "items.{$item['product_id']}" => "Product {$product->name} is not active.",
                    ]);
                }

                $requestedQuantity = $item['quantity'];
                $unitPrice = $item['unit_price'] ?? $product->selling_price;
                $lineTotal = $requestedQuantity * $unitPrice;

                // Check stock
                $currentStock = $product->stock_on_hand;
                if ($currentStock < $requestedQuantity) {
                    throw ValidationException::withMessages([
                        "items.{$item['product_id']}" => "Insufficient stock for {$product->name}. Available: {$currentStock}, requested: {$requestedQuantity}.",
                    ]);
                }

                // Create stock movement (negative for sale)
                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => StockMovement::TYPE_SALE,
                    'quantity' => -$requestedQuantity,
                    'occurred_at' => now(),
                    'note' => null,
                    'sale_id' => null, // Will be updated after sale is created
                ]);
            }

            // Calculate totals
            $total = 0;
            $itemsCount = 0;
            foreach ($items as &$item) {
                $product = Product::find($item['product_id']);
                $unitPrice = $item['unit_price'] ?? $product->selling_price;
                $item['unit_price'] = $unitPrice;
                $item['line_total'] = $item['quantity'] * $unitPrice;
                $total += $item['line_total'];
                $itemsCount += $item['quantity'];
            }
            unset($item);

            // Create sale
            $sale = Sale::create([
                'sale_number' => Sale::generateSaleNumber(),
                'customer_id' => $customerId,
                'sold_at' => now(),
                'total' => $total,
                'items_count' => $itemsCount,
            ]);

            // Create line items and update stock movement sale_id
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);

                SaleLineItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'product_snapshot' => SaleLineItem::createSnapshot($product),
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $item['line_total'],
                ]);

                // Update the stock movement to reference this sale
                StockMovement::where('product_id', $item['product_id'])
                    ->where('type', StockMovement::TYPE_SALE)
                    ->whereNull('sale_id')
                    ->where('occurred_at', '>=', now()->subSeconds(5))
                    ->update(['sale_id' => $sale->id]);
            }

            return redirect()->route('pos.index')->with('success', 'Sale completed.');
        });
    }

    public function void(Sale $sale): RedirectResponse
    {
        if (! $sale->canBeVoided()) {
            return redirect()->route('pos.index')->with('error', 'This sale cannot be voided (already voided or not from today).');
        }

        return DB::transaction(function () use ($sale) {
            // Remove the original sale stock movements to restore stock
            foreach ($sale->lineItems as $lineItem) {
                StockMovement::where('product_id', $lineItem->product_id)
                    ->where('type', StockMovement::TYPE_SALE)
                    ->where('sale_id', $sale->id)
                    ->delete();
            }

            // Mark sale as voided
            $sale->update([
                'voided_at' => now(),
                'void_reason' => 'Voided by owner',
            ]);

            return redirect()->route('pos.index')->with('success', 'Sale voided and stock restored.');
        });
    }
}
