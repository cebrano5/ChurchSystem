<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Districts Table
 * 
 * Districts are administrative subdivisions under a conference.
 * Each district supervises several local societies.
 * 
 * Foreign Key: annual_conference_id → annual_conferences.id
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annual_conference_id')
                  ->constrained('annual_conferences')
                  ->onDelete('cascade');               // Deleting a conference removes its districts
            $table->string('name');                    // District name
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('districts');
    }
};
