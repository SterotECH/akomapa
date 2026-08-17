<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property string $id
 * @property string $product_id
 * @property string $type
 * @property int $quantity
 * @property string $occurred_at
 * @property string|null $note
 * @property string|null $sale_id
 * @property Product|null $product
 */
class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'type' => $this->type,
            'quantity' => $this->quantity,
            'occurred_at' => $this->occurred_at->toISOString(),
            'note' => $this->note,
            'sale_id' => $this->sale_id,
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
