<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductImport implements ToCollection, WithHeadingRow, WithValidation
{
    public array $imported = ['created' => 0, 'updated' => 0, 'rejected' => 0];

    public array $errors = [];

    public function rules(): array
    {
        return [
            'sku' => ['required', 'string'],
            'name' => ['required', 'string'],
            'barcode' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'unit' => ['required', 'string'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'reorder_threshold' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            try {
                // Find or create category
                $categoryId = null;
                if (! empty($row['category'])) {
                    $category = Category::firstOrCreate(
                        ['name' => $row['category']]
                    );
                    $categoryId = $category->id;
                }

                // Convert prices from GHS (decimal) to pesewas (integer)
                $costPrice = (int) round($row['cost_price'] * 100);
                $sellingPrice = (int) round($row['selling_price'] * 100);

                // Upsert by SKU
                $existing = Product::where('sku', $row['sku'])->first();

                if ($existing) {
                    $existing->update([
                        'name' => $row['name'],
                        'barcode' => $row['barcode'] ?? $existing->barcode,
                        'category_id' => $categoryId ?? $existing->category_id,
                        'unit' => $row['unit'],
                        'cost_price' => $costPrice,
                        'selling_price' => $sellingPrice,
                        'reorder_threshold' => $row['reorder_threshold'] ?? $existing->reorder_threshold,
                    ]);
                    $this->imported['updated']++;
                } else {
                    Product::create([
                        'sku' => $row['sku'],
                        'name' => $row['name'],
                        'barcode' => $row['barcode'] ?? null,
                        'category_id' => $categoryId,
                        'unit' => $row['unit'],
                        'cost_price' => $costPrice,
                        'selling_price' => $sellingPrice,
                        'reorder_threshold' => $row['reorder_threshold'] ?? 0,
                    ]);
                    $this->imported['created']++;
                }
            } catch (\Exception $e) {
                $this->imported['rejected']++;
                $this->errors[] = [
                    'row' => $index + 2, // +2 for header row and 0-index
                    'sku' => $row['sku'] ?? 'unknown',
                    'reason' => $e->getMessage(),
                ];
            }
        }
    }
}
