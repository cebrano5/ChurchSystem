<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LocalSociety;
use App\Models\Pastor;

class MigrateExistingContactsToPastors extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-contacts-to-pastors';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing contact_person from local_societies to the new pastors table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $societies = LocalSociety::all();
        $count = 0;

        foreach ($societies as $society) {
            if ($society->contact_person) {
                // Check if already migrated
                $exists = Pastor::where('scope_type', LocalSociety::class)
                    ->where('scope_id', $society->id)
                    ->where('full_name', $society->contact_person)
                    ->exists();

                if (!$exists) {
                    Pastor::create([
                        'scope_type'       => LocalSociety::class,
                        'scope_id'         => $society->id,
                        'full_name'        => $society->contact_person,
                        'phone'            => $society->contact_phone,
                        'role_or_position' => 'Senior Pastor', // Default role
                        'status'           => 'Active',
                        'assigned_at'      => now(),
                    ]);
                    $count++;
                }
            }
        }

        $this->info("Successfully migrated {$count} contacts to the pastors table.");
    }
}
