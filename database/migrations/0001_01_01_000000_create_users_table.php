<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Users Table
 * 
 * Stores all system administrators across all hierarchy levels.
 * Uses a 'username' field instead of 'email' for login (Option B).
 * RBAC is implemented via 'role' (enum) and polymorphic scope columns
 * that link each user to their organizational unit.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');                             // Full display name
            $table->string('username')->unique();               // Login username (e.g. NationalAdmin123)
            $table->string('password');
            $table->enum('role', [                             // Role determines access level
                'national_admin',
                'conference_admin',
                'district_admin',
                'society_admin',
            ])->default('society_admin');
            // Polymorphic scope: links user to their org unit
            // national_admin has no scope (null = global access)
            $table->unsignedBigInteger('scope_id')->nullable();
            $table->string('scope_type')->nullable();           // e.g. 'App\Models\AnnualConference'
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('username')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
