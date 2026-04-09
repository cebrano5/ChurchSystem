<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Events Table
 * 
 * Events are church activities organized by local societies.
 * Examples: Worship Services, Bible Study, Outreach Programs.
 * Attendance is tracked through the 'attendance' table.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_society_id')
                  ->constrained('local_societies')
                  ->onDelete('cascade');
            $table->string('name');                     // Event title
            $table->date('event_date');                 // When the event occurs
            $table->string('location')->nullable();     // Venue
            $table->text('description')->nullable();    // What the event is about
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
