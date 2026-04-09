<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Donations Table
 * 
 * Records all financial contributions made by members.
 * Donation types classiy the purpose: tithes, offerings, special donations.
 * local_society_id is included for scoped reporting (per society).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')
                  ->constrained('members')
                  ->onDelete('cascade');
            $table->foreignId('local_society_id')
                  ->constrained('local_societies')
                  ->onDelete('cascade');
            $table->decimal('amount', 12, 2);              // Monetary amount (supports large values)
            $table->enum('donation_type', [
                'Tithe',
                'Offering',
                'Special Donation',
                'Building Fund',
                'Mission Fund',
            ])->default('Offering');
            $table->date('donation_date');                 // Date the donation was made
            $table->enum('payment_method', [
                'Cash',
                'Check',
                'Bank Transfer',
                'Online',
            ])->default('Cash');
            $table->text('notes')->nullable();             // Optional notes on the donation
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
