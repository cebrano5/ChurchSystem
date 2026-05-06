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
        if (!Schema::hasColumn('annual_conferences', 'deleted_at')) {
            Schema::table('annual_conferences', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (!Schema::hasColumn('districts', 'deleted_at')) {
            Schema::table('districts', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (!Schema::hasColumn('local_societies', 'deleted_at')) {
            Schema::table('local_societies', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (!Schema::hasColumn('pastors', 'deleted_at')) {
            Schema::table('pastors', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('annual_conferences', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('districts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('local_societies', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('pastors', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
