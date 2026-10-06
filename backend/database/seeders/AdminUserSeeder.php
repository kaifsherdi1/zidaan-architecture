<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();

        if (! $adminRole) {
            $this->command->error('Admin role not found. Run RoleSeeder first.');
            return;
        }

        // Credentials come from the environment so nothing personal is committed.
        $email = env('ADMIN_EMAIL', 'admin@zidaan.local');
        $name = env('ADMIN_NAME', 'Studio Admin');
        $password = env('ADMIN_PASSWORD');

        if (! $password) {
            if (app()->environment('production')) {
                throw new \RuntimeException('Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding a production database.');
            }
            $password = 'ChangeMe@123'; // local development only
        }
        $weak = ! preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/', $password)
            || stripos($password, 'password') !== false; // e.g. the documented demo "Password@123"
        if (app()->environment('production') && $weak) {
            throw new \RuntimeException('ADMIN_PASSWORD must be at least 12 characters with upper and lower case letters, a number and a symbol.');
        }

        $user = User::withTrashed()->firstOrNew(['email' => $email]);
        $user->fill([
            'name' => $name,
            'role_id' => $adminRole->id,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $user->deleted_at = null;

        // Only (re)set the password when the account is new — never clobber a
        // password an admin has since changed.
        if (! $user->exists) {
            $user->password = Hash::make($password);
        }

        $user->save();

        $this->command->info("Admin ensured: {$email}");
    }
}
