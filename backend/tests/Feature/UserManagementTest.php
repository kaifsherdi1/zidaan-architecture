<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private const STRONG = 'Str0ng!Pass';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_manager_cannot_create_an_admin_or_manager(): void
    {
        Sanctum::actingAs($this->userWithRole('manager'));

        foreach (['admin', 'manager'] as $role) {
            $this->postJson('/api/admin/users', [
                'name' => 'X', 'email' => "{$role}@x.test", 'role' => $role,
                'password' => self::STRONG, 'password_confirmation' => self::STRONG,
            ])->assertForbidden();
        }

        $this->postJson('/api/admin/users', [
            'name' => 'Agent', 'email' => 'agent@x.test', 'role' => 'agent',
            'password' => self::STRONG, 'password_confirmation' => self::STRONG,
        ])->assertCreated();
    }

    public function test_manager_cannot_promote_self_or_touch_admins(): void
    {
        $manager = $this->userWithRole('manager');
        $admin = $this->userWithRole('admin');
        Sanctum::actingAs($manager);

        $this->putJson("/api/admin/users/{$manager->id}", ['role' => 'admin'])->assertForbidden();
        $this->postJson("/api/admin/users/{$manager->id}/assign-role", ['role_id' => Role::where('slug', 'admin')->value('id')])->assertForbidden();
        $this->putJson("/api/admin/users/{$admin->id}", ['is_active' => false])->assertForbidden();
        $this->deleteJson("/api/admin/users/{$admin->id}")->assertForbidden();

        $this->assertSame('manager', $manager->fresh()->roleSlug());
        $this->assertTrue($admin->fresh()->is_active);
        $this->assertNull($admin->fresh()->deleted_at);
    }

    public function test_manager_can_manage_agents_and_clients(): void
    {
        Sanctum::actingAs($this->userWithRole('manager'));
        $client = $this->userWithRole('user');

        $this->putJson("/api/admin/users/{$client->id}", ['role' => 'agent'])->assertOk();
        $this->assertSame('agent', $client->fresh()->roleSlug());
    }

    public function test_admin_cannot_demote_deactivate_or_delete_self(): void
    {
        $admin = $this->userWithRole('admin');
        $this->userWithRole('admin'); // a second admin, so "last admin" isn't what blocks it
        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/users/{$admin->id}", ['role' => 'user'])->assertStatus(422);
        $this->putJson("/api/admin/users/{$admin->id}", ['is_active' => false])->assertStatus(422);
        $this->deleteJson("/api/admin/users/{$admin->id}")->assertStatus(422);
    }

    public function test_admin_can_demote_and_remove_another_admin(): void
    {
        $actor = $this->userWithRole('admin');
        $other = $this->userWithRole('admin');
        Sanctum::actingAs($actor);

        // Two admins: demoting one is fine.
        $this->putJson("/api/admin/users/{$other->id}", ['role' => 'manager'])->assertOk();

        // Re-promote, then deactivate the actor via the other so only one active admin remains.
        $this->putJson("/api/admin/users/{$other->id}", ['role' => 'admin'])->assertOk();
        $actor->update(['is_active' => false]);
        $third = $this->userWithRole('admin');
        Sanctum::actingAs($third);
        $this->deleteJson("/api/admin/users/{$other->id}")->assertOk(); // $third remains
        $this->putJson("/api/admin/users/{$third->id}", ['role' => 'user'])->assertStatus(422); // self
    }

    public function test_deactivating_a_user_revokes_their_tokens_and_blocks_requests(): void
    {
        $admin = $this->userWithRole('admin');
        $client = $this->userWithRole('user');
        $token = $client->createToken('t')->plainTextToken;

        $this->withToken($token)->getJson('/api/me')->assertOk();

        Sanctum::actingAs($admin);
        $this->putJson("/api/admin/users/{$client->id}", ['is_active' => false])->assertOk();
        $this->assertSame(0, $client->tokens()->count());

        // Even a token that somehow survived is refused for an inactive account.
        $client->refresh();
        $survivor = $client->createToken('t2')->plainTextToken;
        $this->app['auth']->forgetGuards();
        $this->withToken($survivor)->getJson('/api/me')->assertForbidden();
    }

    public function test_force_delete_refuses_an_agent_with_listings(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));
        $agent = $this->userWithRole('agent');
        Property::factory()->create(['agent_id' => $agent->id]);

        $this->deleteJson("/api/admin/users/{$agent->id}/force")->assertStatus(422);
        $this->assertNotNull(User::find($agent->id));
        $this->assertSame(1, Property::count());
    }

    public function test_user_list_rejects_arbitrary_sort_columns_gracefully(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->getJson('/api/admin/users?sort_by=password&sort_order=sideways&per_page=100000')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 100);
    }

    public function test_role_changes_are_audit_logged(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));
        $client = $this->userWithRole('user');

        $this->putJson("/api/admin/users/{$client->id}", ['role' => 'agent'])->assertOk();

        $this->assertDatabaseHas('activity_logs', ['action' => 'user.role_changed', 'subject_id' => $client->id]);
        $this->getJson('/api/admin/activity')->assertOk()->assertJsonPath('data.0.action', 'user.role_changed');
    }

    public function test_activity_log_is_admin_only(): void
    {
        Sanctum::actingAs($this->userWithRole('manager'));
        $this->getJson('/api/admin/activity')->assertForbidden();
    }
}
