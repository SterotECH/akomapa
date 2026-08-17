<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StockImport implements ToCollection, WithHeadingRow, WithValidation
{
    public array $imported = ['success' => 0, 'rejected' => 0];

    public array $errors = [];

    public function rules(): array
    {
        return [
            'sku' => ['nullable', 'string'],
            'barcode' => ['nullable', 'string'],
            'quantity' => ['required', 'integer', 'gt:0'],
            'note' => ['nullable', 'string'],
            'occurred_at' => ['nullable', 'date'],
        ];
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            try {
                // Find product by SKU or barcode
                $product = null;
                if (! empty($row['sku'])) {
                    $product = Product::where('sku', $row['sku'])->first();
                } elseif (! empty($row['barcode'])) {
                    $product = Product::where('barcode', $row['barcode'])->first();
                }

                if (! $product) {
                    throw new \Exception('Product not found by SKU or barcode');
                }

                $occurredAt = ! empty($row['occurred_at'])
                    ? $row['occurred_at']
                    : now();

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => StockMovement::TYPE_RESTOCK,
                    'quantity' => $row['quantity'],
                    'occurred_at' => $occurredAt,
                    'note' => $row['note'] ?? null,
                ]);

                $this->imported['success']++;
            } catch (\Exception $e) {
                $this->imported['rejected']++;
                $this->errors[] = [
                    'row' => $index + 2,
                    'sku' => $row['sku'] ?? $row['barcode'] ?? 'unknown',
                    'reason' => $e->getMessage(),
                ];
            }
        }
    }
}
