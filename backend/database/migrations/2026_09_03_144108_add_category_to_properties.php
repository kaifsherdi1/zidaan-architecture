<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Property typology: apartment, shop, single_floor, duplex, double_floor, third_floor.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('category')->nullable()->after('type')->index();
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
