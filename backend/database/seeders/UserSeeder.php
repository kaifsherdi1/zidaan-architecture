<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();
        $managerRole = Role::where('slug', 'manager')->first();
        $agentRole = Role::where('slug', 'agent')->first();
        $userRole = Role::where('slug', 'user')->first();

        // Create Admin User
        User::firstOrCreate(
        ['email' => 'admin@realestate.com'],
        [
            'name' => 'Admin User',
            'password' => Hash::make('password123'),
            'role_id' => $adminRole->id,
            'phone' => '+1234567890',
            'is_active' => true,
            'email_verified_at' => now(),
        ]
        );

        // Create Manager User
        User::firstOrCreate(
        ['email' => 'manager@realestate.com'],
        [
            'name' => 'Manager User',
            'password' => Hash::make('password123'),
            'role_id' => $managerRole->id,
            'phone' => '+1234567891',
            'is_active' => true,
            'email_verified_at' => now(),
        ]
        );

        // Create Agent User
        User::firstOrCreate(
        ['email' => 'agent@realestate.com'],
        [
            'name' => 'Agent User',
            'password' => Hash::make('password123'),
            'role_id' => $agentRole->id,
            'phone' => '+1234567892',
            'is_active' => true,
            'email_verified_at' => now(),
        ]
        );

        // Create Regular User
        User::firstOrCreate(
        ['email' => 'user@realestate.com'],
        [
            'name' => 'Regular User',
            'password' => Hash::make('password123'),
            'role_id' => $userRole->id,
            'phone' => '+1234567893',
            'is_active' => true,
            'email_verified_at' => now(),
        ]
        );

        $this->command->info('Users seeded successfully!');
        $this->command->info('Admin: admin@realestate.com / password123');
        $this->command->info('Manager: manager@realestate.com / password123');
        $this->command->info('Agent: agent@realestate.com / password123');
        $this->command->info('User: user@realestate.com / password123');
    }
}
