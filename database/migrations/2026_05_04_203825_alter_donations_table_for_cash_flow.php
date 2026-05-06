<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->enum('type', ['inflow', 'outflow'])->default('inflow')->after('amount');
            $table->string('category', 100)->nullable()->after('type');
        });

        // Migrate existing donation_type to category
        DB::statement('UPDATE donations SET category = donation_type');

        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn('donation_type');
        });

        // Make member_id nullable
        Schema::table('donations', function (Blueprint $table) {
            $table->unsignedBigInteger('member_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->enum('donation_type', ['Tithe', 'Offering', 'Special Donation', 'Building Fund', 'Mission Fund'])->default('Offering');
        });

        DB::statement('UPDATE donations SET donation_type = category');

        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->dropColumn('category');
            $table->unsignedBigInteger('member_id')->nullable(false)->change();
        });
    }
};
