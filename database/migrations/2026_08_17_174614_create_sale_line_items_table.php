<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sale_line_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('product_id')->constrained();
            $table->string('product_snapshot'); // JSON: product name, sku, unit at time of sale
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('unit_price'); // pesewas; may override catalog
            $table->unsignedInteger('line_total'); // quantity * unit_price
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_line_items');
    }
};
