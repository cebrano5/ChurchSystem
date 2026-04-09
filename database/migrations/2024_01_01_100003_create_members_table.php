<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Members Table
 * 
 * Stores church member records. Members belong to a local society.
 * They can participate in events (attendance) and make donations.
 * 
 * Foreign Key: local_society_id → local_societies.id
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_society_id')
                  ->constrained('local_societies')
                  ->onDelete('cascade');

            // Personal information
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->date('date_of_birth')->nullable();

            // Contact information
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();

            // Membership information
            $table->date('membership_date')->nullable();
            $table->enum('status', ['Active', 'Inactive', 'Transferred', 'Deceased'])
                  ->default('Active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
