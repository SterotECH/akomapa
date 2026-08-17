<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'sku' => ['sometimes', 'required', 'string', Rule::unique('products', 'sku')->ignore($productId, 'id')],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', Rule::unique('products', 'barcode')->ignore($productId, 'id')],
            'category_id' => ['nullable', 'exists:categories,id'],
            'unit' => ['sometimes', 'required', 'string', 'max:50'],
            'cost_price' => ['sometimes', 'required', 'integer', 'min:0'],
            'selling_price' => ['sometimes', 'required', 'integer', 'min:0'],
            'reorder_threshold' => ['sometimes', 'required', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
