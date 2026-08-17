<?php

namespace App\Models;

use Database\Factories\StockMovementFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $product_id
 * @property string $type
 * @property int $quantity
 * @property string $occurred_at
 * @property string|null $note
 * @property string|null $sale_id
 */
class StockMovement extends Model
{
    /** @use HasFactory<StockMovementFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'product_id',
        'type',
        'quantity',
        'occurred_at',
        'note',
        'sale_id',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'occurred_at' => 'datetime',
        ];
    }

    public const TYPE_RESTOCK = 'restock';

    public const TYPE_SALE = 'sale';

    public const TYPE_ADJUSTMENT = 'adjustment';

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Scope: only restock movements.
     */
    public function scopeRestock($query)
    {
        return $query->where('type', self::TYPE_RESTOCK);
    }

    /**
     * Scope: only sale movements.
     */
    public function scopeSale($query)
    {
        return $query->where('type', self::TYPE_SALE);
    }

    /**
     * Scope: only adjustment movements.
     */
    public function scopeAdjustment($query)
    {
        return $query->where('type', self::TYPE_ADJUSTMENT);
    }
}
