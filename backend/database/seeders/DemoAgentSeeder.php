<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAgentSeeder extends Seeder
{
    public function run(): void
    {
        $agentRole = Role::firstOrCreate(
            ['slug' => 'agent'],
            ['name' => 'Agent', 'description' => 'Access to assigned properties and client bookings']
        );

        $agents = [
            ['name' => 'Amara Zidaan', 'email' => 'amara@zidaan.com', 'phone' => '+1 213 555 0110'],
            ['name' => 'Idris Fenn', 'email' => 'idris@zidaan.com', 'phone' => '+44 20 7946 0111'],
            ['name' => 'Noor Haddad', 'email' => 'noor@zidaan.com', 'phone' => '+971 4 555 0112'],
            ['name' => 'Elena Petrova', 'email' => 'elena@zidaan.com', 'phone' => '+1 646 555 0113'],
            ['name' => 'Daniel Okafor', 'email' => 'daniel@zidaan.com', 'phone' => '+234 1 555 0114'],
            ['name' => 'Sofia Marchetti', 'email' => 'sofia@zidaan.com', 'phone' => '+39 02 555 0115'],
        ];

        foreach ($agents as $agent) {
            User::updateOrCreate(
                ['email' => $agent['email']],
                [
                    'name' => $agent['name'],
                    'phone' => $agent['phone'],
                    'password' => Hash::make('password'),
                    'role_id' => $agentRole->id,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('Seeded ' . count($agents) . ' demo agents.');
    }
}
