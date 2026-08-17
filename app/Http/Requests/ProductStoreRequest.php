<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'unique:products,barcode'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'unit' => ['required', 'string', 'max:50'],
            'cost_price' => ['required', 'integer', 'min:0'],
            'selling_price' => ['required', 'integer', 'min:0'],
            'reorder_threshold' => ['required', 'integer', 'min:0'],
        ];
    }
}
