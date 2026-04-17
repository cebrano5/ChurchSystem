<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Make Events Polymorphic
 * 
 * Replaces the local_society_id with a polymorphic relationship
 * so that any tier (National, Conference, District, Society) 
 * can create events. 
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add polymorphic columns
        Schema::table('events', function (Blueprint $table) {
            $table->nullableMorphs('organizer'); 
        });

        // 2. Migrate existing data (Setting current events' organizer to their LocalSociety)
        // Check if there's existing events to avoid errors
        $events = DB::table('events')->get();
        foreach ($events as $event) {
            DB::table('events')->where('id', $event->id)->update([
                'organizer_id' => $event->local_society_id,
                'organizer_type' => 'App\\Models\\LocalSociety',
            ]);
        }

        // 3. Drop the old foreign key constraint and column
        Schema::table('events', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['local_society_id']);
            }
            $table->dropColumn('local_society_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Add back the column
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('local_society_id')
                  ->nullable()
                  ->constrained('local_societies')
                  ->onDelete('cascade');
        });

        // 2. Restore data if possible
        $events = DB::table('events')->where('organizer_type', 'App\\Models\\LocalSociety')->get();
        foreach ($events as $event) {
            DB::table('events')->where('id', $event->id)->update([
                'local_society_id' => $event->organizer_id,
            ]);
        }

        // 3. Drop polymorphic columns
        Schema::table('events', function (Blueprint $table) {
            $table->dropMorphs('organizer');
        });
    }
};
