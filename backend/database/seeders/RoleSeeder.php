<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Full system access with all permissions',
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Property and agent management access',
            ],
            [
                'name' => 'Agent',
                'slug' => 'agent',
                'description' => 'Access to assigned properties and client bookings',
            ],
            [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Client access for browsing properties and making bookings',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
            ['slug' => $role['slug']],
                $role
            );
        }

        $this->command->info('Roles seeded successfully!');
    }
}
