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
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->json('specializations')->nullable(); // residential, commercial, luxury, etc.
            $table->integer('years_of_experience')->default(0);
            $table->decimal('commission_rate', 5, 2)->default(3.00); // percentage
            $table->string('license_number')->nullable();
            $table->date('license_expiry')->nullable();

            // Social Media
            $table->string('facebook_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('instagram_url')->nullable();

            // Performance Stats
            $table->integer('properties_sold')->default(0);
            $table->integer('properties_rented')->default(0);
            $table->decimal('total_sales_value', 15, 2)->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);

            $table->boolean('is_verified')->default(false);
            $table->boolean('is_available')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('is_verified');
            $table->index('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
