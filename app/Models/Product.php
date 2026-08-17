<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $sku
 * @property string $name
 * @property string|null $barcode
 * @property string|null $category_id
 * @property string $unit
 * @property int $cost_price
 * @property int $selling_price
 * @property int $reorder_threshold
 * @property bool $is_active
 * @property int $stock_on_hand
 * @property bool $is_low_stock
 * @property int $stock_value
 */
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'sku',
        'name',
        'barcode',
        'category_id',
        'unit',
        'cost_price',
        'selling_price',
        'reorder_threshold',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cost_price' => 'integer',
            'selling_price' => 'integer',
            'reorder_threshold' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function saleLineItems(): HasMany
    {
        return $this->hasMany(SaleLineItem::class);
    }

    /**
     * Derived: sum of all stock movement quantities for this product.
     * V4: sale decrements, restock increments, adjustment can be either.
     */
    public function getStockOnHandAttribute(): int
    {
        return $this->stockMovements()->sum('quantity');
    }

    /**
     * V3: low stock = stock_on_hand <= reorder_threshold.
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->stock_on_hand <= $this->reorder_threshold;
    }

    /**
     * cost_price * stock_on_hand (minor units).
     */
    public function getStockValueAttribute(): int
    {
        return $this->cost_price * $this->stock_on_hand;
    }

    /**
     * Scope: active products only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: products at or below reorder threshold.
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('reorder_threshold', '>=', 'stock_on_hand');
    }
}
