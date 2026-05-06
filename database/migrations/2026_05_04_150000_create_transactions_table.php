<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Transactions Table
 *
 * Tracks all cash movement for the church — both inflows (income) and
 * outflows (expenses). Scoped to a local society for reporting clarity.
 * Complements the `donations` table which tracks member-specific contributions.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['inflow', 'outflow']);
            $table->string('category', 100);         // e.g. "Tithes", "Utilities"
            $table->decimal('amount', 12, 2);
            $table->text('description')->nullable();
            $table->date('transaction_date');
            $table->enum('payment_method', ['Cash', 'Check', 'Bank Transfer', 'Online', 'Other'])->default('Cash');
            // Scoped to a local society; null = org-level/general entry
            $table->foreignId('local_society_id')->nullable()->constrained('local_societies')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
