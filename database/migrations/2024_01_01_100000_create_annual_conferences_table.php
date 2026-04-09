<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Annual Conferences Table
 * 
 * Represents the second level of the church hierarchy.
 * Each conference covers a geographic region and is supervised
 * by the National Office.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annual_conferences', function (Blueprint $table) {
            $table->id();
            $table->string('name');                        // Conference name
            $table->string('region')->nullable();          // Geographic region
            $table->text('description')->nullable();       // Additional details
            $table->date('established_at')->nullable();    // When the conference was established
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_conferences');
    }
};
