<?php

namespace App\Models;

use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $name
 * @property string|null $phone
 */
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory, HasUlids;

    protected $fillable = ['name', 'phone'];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    /**
     * Scope: search by name or phone (fuzzy).
     */
    public function scopeSearch($query, ?string $search)
    {
        if (! $search) {
            return $query;
        }

        return $query->whereLike('name', "%{$search}%")
            ->orWhereLike('phone', "%{$search}%");
    }
}
