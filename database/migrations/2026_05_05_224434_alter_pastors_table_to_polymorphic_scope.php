<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pastors', function (Blueprint $table) {
            // Remove the old foreign key
            $table->dropForeign(['local_society_id']);
            $table->dropColumn('local_society_id');

            // Add polymorphic scope
            // For National Admin, these will be null
            $table->string('scope_type')->nullable();
            $table->unsignedBigInteger('scope_id')->nullable();
            
            $table->index(['scope_type', 'scope_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pastors', function (Blueprint $table) {
            $table->dropIndex(['scope_type', 'scope_id']);
            $table->dropColumn(['scope_type', 'scope_id']);
            
            $table->foreignId('local_society_id')->nullable()->constrained()->onDelete('cascade');
        });
    }
};
