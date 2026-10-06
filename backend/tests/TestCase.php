<?php

namespace Tests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /** Create an active user holding the given role slug (roles must be seeded). */
    protected function userWithRole(string $slug, array $attributes = []): User
    {
        return User::factory()->create($attributes + [
            'role_id' => Role::where('slug', $slug)->value('id'),
            'is_active' => true,
        ])->load('role');
    }
}
