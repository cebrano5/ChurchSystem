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
        $tables = [
            'users', 'annual_conferences', 'districts', 'local_societies', 
            'pastors', 'members', 'ministries', 'events', 'donations'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');
                });
            }
        }
    }

    public function down(): void
    {
        $tables = [
            'users', 'annual_conferences', 'districts', 'local_societies', 
            'pastors', 'members', 'ministries', 'events', 'donations'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropForeign([$tableName . '_deleted_by_foreign']);
                    $table->dropColumn('deleted_by');
                });
            }
        }
    }
};
