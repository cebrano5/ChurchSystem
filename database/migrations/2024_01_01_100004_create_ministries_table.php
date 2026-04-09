<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Ministries Table
 * 
 * Ministries are service groups or programs within a local society.
 * Examples: Youth Ministry, Music Ministry, Outreach Ministry.
 * 
 * leader_id is a nullable FK to members — the ministry may not have
 * an assigned leader yet when it is created.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ministries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_society_id')
                  ->constrained('local_societies')
                  ->onDelete('cascade');
            $table->string('name');                   // Ministry name
            $table->text('description')->nullable();  // What the ministry does
            // Leader is a member; nullable since leader may not be set yet
            $table->foreignId('leader_id')
                  ->nullable()
                  ->constrained('members')
                  ->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ministries');
    }
};
