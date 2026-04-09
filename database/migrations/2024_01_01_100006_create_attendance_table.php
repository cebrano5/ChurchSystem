<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Attendance Table
 * 
 * Junction table tracking which members attended which events.
 * A unique constraint on (event_id, member_id) prevents duplicate records.
 * 
 * This is a many-to-many relationship: 
 *   Members ↔ Events (through attendance)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')
                  ->constrained('events')
                  ->onDelete('cascade');
            $table->foreignId('member_id')
                  ->constrained('members')
                  ->onDelete('cascade');
            $table->timestamp('recorded_at')->useCurrent(); // When the record was logged
            $table->timestamps();

            // Prevent duplicate attendance records for the same member + event
            $table->unique(['event_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
