<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $adminRole = Role::where('slug', 'admin')->first();

    if (!$adminRole) {
      $this->command->error('Admin role not found. Please run RoleSeeder first.');
      return;
    }

    $user = User::firstOrCreate(
    ['email' => 'kaifsherdi19@gmail.com'],
    [
      'name' => 'kaif sherdi',
      'password' => Hash::make('kaifsherdi@1234'),
      'role_id' => $adminRole->id,
      'email_verified_at' => now(),
      'is_active' => true,
    ]
    );

    if ($user->wasRecentlyCreated) {
      $this->command->info('Admin user created successfully.');
    }
    else {
      $this->command->info('Admin user already exists.');
      // Optional: Update password/role if needed, but firstOrCreate handles the check.
      // If we want to force update the password:
      $user->update([
        'password' => Hash::make('kaifsherdi@1234'),
        'role_id' => $adminRole->id,
      ]);
      $this->command->info('Admin user updated.');
    }
  }
}
