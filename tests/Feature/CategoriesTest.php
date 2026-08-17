<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('renders the categories index page', function () {
    $this->get(route('categories.index'))->assertStatus(200);
});

it('can create a category', function () {
    $this->post(route('categories.store'), ['name' => 'Beverages'])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['name' => 'Beverages']);
});

it('validates category name is required', function () {
    $this->post(route('categories.store'), ['name' => ''])
        ->assertSessionHasErrors('name');
});

it('validates category name is unique', function () {
    Category::factory()->create(['name' => 'Beverages']);

    $this->post(route('categories.store'), ['name' => 'Beverages'])
        ->assertSessionHasErrors('name');
});

it('can update a category', function () {
    $category = Category::factory()->create(['name' => 'Old Name']);

    $this->patch(route('categories.update', $category), ['name' => 'New Name'])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Name']);
});

it('can delete an empty category', function () {
    $category = Category::factory()->create();

    $this->delete(route('categories.destroy', $category))
        ->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

it('cannot delete a category with products', function () {
    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $this->delete(route('categories.destroy', $category))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});
