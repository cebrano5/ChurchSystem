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
        Schema::table('annual_conferences', function (Blueprint $table) {
            $table->string('location_name')->nullable()->after('longitude');
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->string('location_name')->nullable()->after('longitude');
        });

        Schema::table('local_societies', function (Blueprint $table) {
            $table->string('location_name')->nullable()->after('longitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('annual_conferences', function (Blueprint $table) {
            $table->dropColumn('location_name');
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->dropColumn('location_name');
        });

        Schema::table('local_societies', function (Blueprint $table) {
            $table->dropColumn('location_name');
        });
    }
};
