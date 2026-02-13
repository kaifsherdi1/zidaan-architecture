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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('users')->onDelete('set null');

            $table->dateTime('visit_date');
            $table->time('visit_time');
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'rescheduled'])->default('pending');

            $table->text('user_message')->nullable();
            $table->text('agent_notes')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->dateTime('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');

            $table->dateTime('completed_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();

            // Rescheduling
            $table->dateTime('original_visit_date')->nullable();
            $table->integer('reschedule_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('property_id');
            $table->index('user_id');
            $table->index('agent_id');
            $table->index('status');
            $table->index('visit_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
