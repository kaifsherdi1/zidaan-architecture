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
        // Always: roles + the environment-configured admin account.
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
        ]);

        // Demo data (weak-password test logins, sample catalogue). Independent of
        // APP_ENV — a "production" portfolio/demo deploy sets SEED_DEMO_DATA=true
        // on purpose so visitors see a populated site; a real client deployment
        // leaves it unset/false.
        if (filter_var(env('SEED_DEMO_DATA', ! app()->environment('production')), FILTER_VALIDATE_BOOLEAN)) {
            $this->seedDemoAccounts();

            $this->call([
                DemoAgentSeeder::class,
                RealEstateSeeder::class,
            ]);
        }
    }

    private function seedDemoAccounts(): void
    {
        $accounts = [
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
    }
}
