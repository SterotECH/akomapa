<?php

namespace App\Models;

use Database\Factories\SaleFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $sale_number
 * @property string|null $customer_id
 * @property string $sold_at
 * @property int $total
 * @property int $items_count
 * @property string|null $voided_at
 * @property string|null $void_reason
 */
class Sale extends Model
{
    /** @use HasFactory<SaleFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'sale_number',
        'customer_id',
        'sold_at',
        'total',
        'items_count',
        'voided_at',
        'void_reason',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'integer',
            'items_count' => 'integer',
            'sold_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(SaleLineItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * V5: check if sale is voided.
     */
    public function isVoided(): bool
    {
        return $this->voided_at !== null;
    }

    /**
     * V5: only same-day voids allowed.
     */
    public function canBeVoided(): bool
    {
        if ($this->isVoided()) {
            return false;
        }

        return $this->sold_at->isToday();
    }

    /**
     * Scope: non-voided sales only.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('voided_at');
    }

    /**
     * Scope: voided sales only.
     */
    public function scopeVoided($query)
    {
        return $query->whereNotNull('voided_at');
    }

    /**
     * Generate a unique sale number: SALE-YYYYMMDD-XXXX.
     */
    public static function generateSaleNumber(): string
    {
        $date = now()->format('Ymd');
        $count = static::where('sale_number', 'like', "SALE-{$date}-%")->count() + 1;

        return sprintf('SALE-%s-%04d', $date, $count);
    }
}
