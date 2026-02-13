<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->enum('type', ['sale', 'rent']);
            $table->enum('status', ['available', 'sold', 'rented', 'pending'])->default('available');
            $table->decimal('price', 15, 2);
            $table->integer('bedrooms');
            $table->integer('bathrooms');
            $table->integer('garages')->nullable();
            $table->decimal('area', 10, 2); // Sq ft or sq m
            $table->string('address');
            $table->string('city');
            $table->string('state');
            $table->string('country');
            $table->string('zip_code')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
