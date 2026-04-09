<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Local Societies Table
 * 
 * Local societies are individual church congregations — the base unit
 * of the hierarchy. Members, ministries, and events all belong here.
 * 
 * Foreign Key: district_id → districts.id
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('local_societies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')
                  ->constrained('districts')
                  ->onDelete('cascade');
            $table->string('name');                         // Society name
            $table->string('address')->nullable();          // Physical address
            $table->string('contact_person')->nullable();   // Primary contact name
            $table->string('contact_phone')->nullable();    // Contact phone number
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('local_societies');
    }
};
