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
        $productId = $this->route('product')?->id;

        return [
            'sku' => ['required', 'string', Rule::unique('products,sku')->ignore($productId)],
            'name' => ['required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', Rule::unique('products,barcode')->ignore($productId)],
            'category_id' => ['nullable', 'exists:categories,id'],
            'unit' => ['required', 'string', 'max:50'],
            'cost_price' => ['required', 'integer', 'min:0'],
            'selling_price' => ['required', 'integer', 'min:0'],
            'reorder_threshold' => ['required', 'integer', 'min:0'],
        ];
    }
}
