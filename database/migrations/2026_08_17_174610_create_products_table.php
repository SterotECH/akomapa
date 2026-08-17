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
        Schema::create('products', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('barcode')->nullable()->unique();
            $table->foreignUlid('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('unit')->default('piece');
            $table->unsignedInteger('cost_price');
            $table->unsignedInteger('selling_price');
            $table->unsignedInteger('reorder_threshold')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
