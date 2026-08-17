<?php

namespace App\Models;

use Database\Factories\SaleLineItemFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $sale_id
 * @property string $product_id
 * @property string $product_snapshot
 * @property int $quantity
 * @property int $unit_price
 * @property int $line_total
 */
class SaleLineItem extends Model
{
    /** @use HasFactory<SaleLineItemFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'sale_id',
        'product_id',
        'product_snapshot',
        'quantity',
        'unit_price',
        'line_total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'line_total' => 'integer',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Create a snapshot of the product at time of sale.
     */
    public static function createSnapshot(Product $product): string
    {
        return json_encode([
            'name' => $product->name,
            'sku' => $product->sku,
            'unit' => $product->unit,
        ]);
    }
}
