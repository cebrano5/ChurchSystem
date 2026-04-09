<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\AnnualConference;
use App\Models\District;
use App\Models\LocalSociety;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\Event;
use App\Models\Attendance;
use App\Models\Donation;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Includes the requested National Admin account and sample hierarchy data.
     */
    public function run(): void
    {
        // 1. Create the National Admin Account (Requested by User)
        User::create([
            'name'       => 'Super Administrator',
            'username'   => 'NationalAdmin123',
            'password'   => Hash::make('adminpassword123'),
            'role'       => 'national_admin',
            'scope_id'   => null, // Global access
            'scope_type' => null,
        ]);

        // 2. Create Sample Hierarchy (Conference -> District -> Society)
        $conference = AnnualConference::create([
            'name'           => 'Pacific Northwest Annual Conference',
            'region'         => 'West Coast USA',
            'description'    => 'Overseeing churches in WA, OR, and ID.',
            'established_at' => Carbon::parse('1950-01-01'),
        ]);

        $district = District::create([
            'annual_conference_id' => $conference->id,
            'name'                 => 'Seattle Metro District',
            'description'          => 'Churches within the greater Seattle area.',
        ]);

        $society = LocalSociety::create([
            'district_id'    => $district->id,
            'name'           => 'First Free Methodist Church of Seattle',
            'address'        => '3200 3rd Ave W, Seattle, WA 98119',
            'contact_person' => 'Pastor John Smith',
            'contact_phone'  => '206-555-0100',
        ]);

        // 3. Create Scoped Admin Accounts
        User::create([
            'name'       => 'Conference Director',
            'username'   => 'ConfAdmin',
            'password'   => Hash::make('password'),
            'role'       => 'conference_admin',
            'scope_id'   => $conference->id,
            'scope_type' => AnnualConference::class,
        ]);

        User::create([
            'name'       => 'District Superintendent',
            'username'   => 'DistAdmin',
            'password'   => Hash::make('password'),
            'role'       => 'district_admin',
            'scope_id'   => $district->id,
            'scope_type' => District::class,
        ]);

        User::create([
            'name'       => 'Lead Pastor',
            'username'   => 'SocietyAdmin',
            'password'   => Hash::make('password'),
            'role'       => 'society_admin',
            'scope_id'   => $society->id,
            'scope_type' => LocalSociety::class,
        ]);

        // 4. Create Sample Members
        $members = [];
        for ($i = 1; $i <= 10; $i++) {
            $members[] = Member::create([
                'local_society_id' => $society->id,
                'first_name'       => 'Member' . $i,
                'last_name'        => 'Sample',
                'gender'           => $i % 2 == 0 ? 'Female' : 'Male',
                'date_of_birth'    => Carbon::now()->subYears(20 + $i),
                'status'           => 'Active',
            ]);
        }

        // 5. Create Sample Ministries
        $youthMinistry = Ministry::create([
            'local_society_id' => $society->id,
            'name'             => 'Youth Ministry',
            'leader_id'        => $members[0]->id,
        ]);

        $musicMinistry = Ministry::create([
            'local_society_id' => $society->id,
            'name'             => 'Worship & Music Arts',
            'leader_id'        => $members[1]->id,
        ]);

        // 6. Create Sample Event & Attendance
        $event = Event::create([
            'local_society_id' => $society->id,
            'name'             => 'Sunday Morning Worship',
            'event_date'       => Carbon::now()->subDays(2),
            'location'         => 'Main Sanctuary',
        ]);

        // 5 members attended
        for ($i = 0; $i < 5; $i++) {
            Attendance::create([
                'event_id'  => $event->id,
                'member_id' => $members[$i]->id,
            ]);
        }

        // 7. Create Sample Donations
        foreach ($members as $index => $member) {
            Donation::create([
                'member_id'        => $member->id,
                'local_society_id' => $society->id,
                'amount'           => 100.00 + ($index * 10),
                'donation_type'    => 'Tithe',
                'donation_date'    => Carbon::now()->subDays(2),
                'payment_method'   => 'Cash',
            ]);
        }
    }
}
