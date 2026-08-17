<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::pluck('id', 'name');

        $products = [
            // Food & Beverages
            ['name' => 'Indomie Instant Noodles (Pack of 10)', 'sku' => 'FOOD-001', 'unit' => 'pack', 'cost_price' => 1800, 'selling_price' => 2200, 'reorder_threshold' => 10, 'category' => 'Food & Beverages'],
            ['name' => 'Tomato Mix (Gino)', 'sku' => 'FOOD-002', 'unit' => 'tin', 'cost_price' => 800, 'selling_price' => 1000, 'reorder_threshold' => 15, 'category' => 'Food & Beverages'],
            ['name' => 'Cooking Oil (Borges)', 'sku' => 'FOOD-003', 'unit' => 'bottle', 'cost_price' => 3500, 'selling_price' => 4000, 'reorder_threshold' => 8, 'category' => 'Food & Beverages'],
            ['name' => 'Rice (Jasmine, 5kg)', 'sku' => 'FOOD-004', 'unit' => 'bag', 'cost_price' => 4500, 'selling_price' => 5200, 'reorder_threshold' => 5, 'category' => 'Food & Beverages'],
            ['name' => 'Milo (750g)', 'sku' => 'FOOD-005', 'unit' => 'tin', 'cost_price' => 2800, 'selling_price' => 3200, 'reorder_threshold' => 10, 'category' => 'Food & Beverages'],
            ['name' => 'Peak Milk (Powdered)', 'sku' => 'FOOD-006', 'unit' => 'tin', 'cost_price' => 2200, 'selling_price' => 2500, 'reorder_threshold' => 8, 'category' => 'Food & Beverages'],
            ['name' => 'Biscuit (LU, Pack)', 'sku' => 'FOOD-007', 'unit' => 'pack', 'cost_price' => 1200, 'selling_price' => 1500, 'reorder_threshold' => 12, 'category' => 'Food & Beverages'],
            ['name' => 'Mineral Water (1.5L)', 'sku' => 'FOOD-008', 'unit' => 'bottle', 'cost_price' => 300, 'selling_price' => 500, 'reorder_threshold' => 20, 'category' => 'Food & Beverages'],

            // Household Items
            ['name' => 'Mama Dishwashing Liquid', 'sku' => 'HH-001', 'unit' => 'bottle', 'cost_price' => 800, 'selling_price' => 1000, 'reorder_threshold' => 15, 'category' => 'Household Items'],
            ['name' => 'Kleenit Bleach (1L)', 'sku' => 'HH-002', 'unit' => 'bottle', 'cost_price' => 600, 'selling_price' => 800, 'reorder_threshold' => 10, 'category' => 'Household Items'],
            ['name' => 'Trash Bags (Roll of 20)', 'sku' => 'HH-003', 'unit' => 'roll', 'cost_price' => 500, 'selling_price' => 700, 'reorder_threshold' => 10, 'category' => 'Household Items'],
            ['name' => 'Matchbox (Pack)', 'sku' => 'HH-004', 'unit' => 'pack', 'cost_price' => 200, 'selling_price' => 300, 'reorder_threshold' => 20, 'category' => 'Household Items'],

            // Personal Care
            ['name' => 'Close-Up Toothpaste', 'sku' => 'PC-001', 'unit' => 'tube', 'cost_price' => 600, 'selling_price' => 800, 'reorder_threshold' => 12, 'category' => 'Personal Care'],
            ['name' => 'Williams Talcum Powder', 'sku' => 'PC-002', 'unit' => 'bottle', 'cost_price' => 700, 'selling_price' => 900, 'reorder_threshold' => 10, 'category' => 'Personal Care'],
            ['name' => 'Vaseline Petroleum Jelly', 'sku' => 'PC-003', 'unit' => 'jar', 'cost_price' => 500, 'selling_price' => 700, 'reorder_threshold' => 8, 'category' => 'Personal Care'],
            ['name' => 'Nivea Body Lotion (400ml)', 'sku' => 'PC-004', 'unit' => 'bottle', 'cost_price' => 1800, 'selling_price' => 2200, 'reorder_threshold' => 6, 'category' => 'Personal Care'],

            // Electronics
            ['name' => 'Eveready Batteries (AA, 4-pack)', 'sku' => 'ELEC-001', 'unit' => 'pack', 'cost_price' => 800, 'selling_price' => 1000, 'reorder_threshold' => 15, 'category' => 'Electronics'],
            ['name' => 'USB Cable (Type-C)', 'sku' => 'ELEC-002', 'unit' => 'piece', 'cost_price' => 1500, 'selling_price' => 2000, 'reorder_threshold' => 8, 'category' => 'Electronics'],

            // Stationery
            ['name' => 'Exam Float File', 'sku' => 'STAT-001', 'unit' => 'piece', 'cost_price' => 1200, 'selling_price' => 1500, 'reorder_threshold' => 10, 'category' => 'Stationery & Office'],
            ['name' => 'Bic Pen (Box of 50)', 'sku' => 'STAT-002', 'unit' => 'box', 'cost_price' => 2500, 'selling_price' => 3000, 'reorder_threshold' => 8, 'category' => 'Stationery & Office'],
            ['name' => 'A4 Paper (Ream)', 'sku' => 'STAT-003', 'unit' => 'ream', 'cost_price' => 2800, 'selling_price' => 3200, 'reorder_threshold' => 5, 'category' => 'Stationery & Office'],
        ];

        foreach ($products as $data) {
            $categoryId = $categories[$data['category']] ?? null;
            unset($data['category']);

            Product::updateOrCreate(
                ['sku' => $data['sku']],
                array_merge($data, ['category_id' => $categoryId])
            );
        }
    }
}
