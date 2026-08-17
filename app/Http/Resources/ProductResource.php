<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property string $id
 * @property string $sku
 * @property string $name
 * @property string|null $barcode
 * @property Category|null $category
 * @property string $unit
 * @property int $cost_price
 * @property int $selling_price
 * @property int $reorder_threshold
 * @property bool $is_active
 * @property int $stock_on_hand
 * @property bool $is_low_stock
 * @property int $stock_value
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'barcode' => $this->barcode,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'unit' => $this->unit,
            'cost_price' => $this->cost_price,
            'selling_price' => $this->selling_price,
            'reorder_threshold' => $this->reorder_threshold,
            'is_active' => $this->is_active,
            'stock_on_hand' => $this->stock_on_hand,
            'is_low_stock' => $this->is_low_stock,
            'stock_value' => $this->stock_value,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
