<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Imports\ProductImport;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"))
            ->when($request->category_id, fn ($q, $categoryId) => $q->where('category_id', $categoryId));

        $products = $query->orderBy('name')->get();

        return Inertia::render('Products', [
            'products' => ProductResource::collection($products)->resolve(),
            'categories' => CategoryResource::collection(Category::orderBy('name')->get())->resolve(),
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function store(ProductStoreRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        return redirect()->route('products.index')->with('success', 'Product created.');
    }

    public function update(ProductUpdateRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return redirect()->route('products.index')->with('success', 'Product updated.');
    }

    public function deactivate(Product $product): RedirectResponse
    {
        $product->update(['is_active' => false]);

        return redirect()->route('products.index')->with('success', 'Product deactivated.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,xlsx', 'max:10240'],
        ]);

        $import = new ProductImport;
        Excel::import($import, $request->file('file'));

        $message = "Imported: {$import->imported['created']} created, {$import->imported['updated']} updated.";
        if ($import->imported['rejected'] > 0) {
            $message .= " Rejected: {$import->imported['rejected']} rows.";
        }

        return redirect()->route('products.index')->with('success', $message);
    }

    public function importTemplate(): StreamedResponse
    {
        return Excel::download(new class implements FromCollection, WithHeadings
        {
            public function collection()
            {
                return collect([]);
            }

            public function headings(): array
            {
                return ['sku', 'name', 'barcode', 'category', 'unit', 'cost_price', 'selling_price', 'reorder_threshold'];
            }
        }, 'product_import_template.csv');
    }
}
