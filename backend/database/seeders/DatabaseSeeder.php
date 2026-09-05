<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        // Test accounts, one per role.
        $accounts = [
            ['admin',   'Studio Admin',   'admin@zidaan.com',   'Password@123'],
            ['manager', 'Studio Manager', 'manager@zidaan.com', 'Password@123'],
            ['user',    'Test User',      'test@example.com',    'Password@123'],
        ];

        foreach ($accounts as [$roleSlug, $name, $email, $password]) {
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($password),
                    'role_id' => Role::where('slug', $roleSlug)->value('id'),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->call([
            AdminUserSeeder::class,
            DemoAgentSeeder::class,
            RealEstateSeeder::class,
        ]);
    }
}
