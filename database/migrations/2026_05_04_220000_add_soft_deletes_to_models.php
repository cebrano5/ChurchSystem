<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('ministries', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('events', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('ministries', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
