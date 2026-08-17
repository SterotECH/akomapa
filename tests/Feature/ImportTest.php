<?php

use App\Models\Product;
use App\Models\User;

test('unauthenticated user cannot import products', function () {
    $file = $this->createCsvFile([
        ['sku' => 'IMP-001', 'name' => 'Imported Product', 'unit' => 'piece', 'cost_price' => 5.00, 'selling_price' => 8.00],
    ]);

    $this->post(route('products.import'), ['file' => $file])
        ->assertRedirect(route('login'));
});

test('owner can import new products from csv', function () {
    $user = User::factory()->create();

    $file = $this->createCsvFile([
        ['sku' => 'IMP-001', 'name' => 'Imported Product', 'category' => 'Imported Cat', 'unit' => 'piece', 'cost_price' => 5.00, 'selling_price' => 8.00, 'reorder_threshold' => 10],
        ['sku' => 'IMP-002', 'name' => 'Second Product', 'category' => '', 'unit' => 'box', 'cost_price' => 10.50, 'selling_price' => 15.00, 'reorder_threshold' => 5],
    ]);

    $this->actingAs($user)
        ->post(route('products.import'), ['file' => $file])
        ->assertRedirect();

    $this->assertDatabaseHas('products', ['sku' => 'IMP-001', 'cost_price' => 500, 'selling_price' => 800]);
    $this->assertDatabaseHas('products', ['sku' => 'IMP-002', 'cost_price' => 1050, 'selling_price' => 1500]);
    $this->assertDatabaseHas('categories', ['name' => 'Imported Cat']);
});

test('import upserts by sku', function () {
    $user = User::factory()->create();
    Product::factory()->create(['sku' => 'UPS-001', 'name' => 'Original']);

    $file = $this->createCsvFile([
        ['sku' => 'UPS-001', 'name' => 'Updated Name', 'unit' => 'kg', 'cost_price' => 3.00, 'selling_price' => 5.00],
    ]);

    $this->actingAs($user)
        ->post(route('products.import'), ['file' => $file])
        ->assertRedirect();

    $this->assertDatabaseHas('products', ['sku' => 'UPS-001', 'name' => 'Updated Name']);
});

test('owner can download product import template', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('products.import-template'))
        ->assertOk();
});

test('owner can import stock restock from csv', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['sku' => 'RST-001']);

    $file = $this->createCsvFile([
        ['sku' => 'RST-001', 'quantity' => 50, 'note' => 'Bulk restock'],
    ]);

    $this->actingAs($user)
        ->post(route('stock.import'), ['file' => $file])
        ->assertRedirect();

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => 'restock',
        'quantity' => 50,
    ]);
});

test('import with invalid file type fails', function () {
    $user = User::factory()->create();
    $file = tempnam(sys_get_temp_dir(), 'test').'.txt';
    file_put_contents($file, 'not a csv');

    $this->actingAs($user)
        ->post(route('products.import'), ['file' => $file])
        ->assertSessionHasErrors('file');
});

function createCsvFile(array $rows): string
{
    $file = tempnam(sys_get_temp_dir(), 'import').'.csv';
    $handle = fopen($file, 'w');

    if (! empty($rows)) {
        fputcsv($handle, array_keys($rows[0]));
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }
    }

    fclose($handle);

    return $file;
}
