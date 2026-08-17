<?php

namespace App\Http\Resources;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property string $id
 * @property string $sale_number
 * @property string|null $customer_id
 * @property string $sold_at
 * @property int $total
 * @property int $items_count
 * @property string|null $voided_at
 * @property string|null $void_reason
 * @property Collection $line_items
 * @property Customer|null $customer
 */
class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sale_number' => $this->sale_number,
            'customer_id' => $this->customer_id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'sold_at' => $this->sold_at->toISOString(),
            'total' => $this->total,
            'items_count' => $this->items_count,
            'voided_at' => $this->voided_at?->toISOString(),
            'void_reason' => $this->void_reason,
            'line_items' => SaleLineItemResource::collection($this->whenLoaded('lineItems')),
        ];
    }
}
