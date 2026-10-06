<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Enquiry;
use App\Models\Notification;
use App\Models\Property;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CatalogueAndAccountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_public_catalogue_cache_is_invalidated_when_a_listing_is_deleted(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);

        $this->getJson('/api/properties')->assertOk()->assertJsonCount(1, 'data'); // primes the cache

        Sanctum::actingAs($this->userWithRole('manager'));
        $this->deleteJson("/api/manager/properties/{$property->id}")->assertNoContent();

        $this->getJson('/api/properties')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_bulk_delete_also_invalidates_the_catalogue_cache(): void
    {
        $agent = $this->userWithRole('agent');
        $ids = Property::factory()->count(2)->create(['agent_id' => $agent->id])->pluck('id')->all();
        $this->getJson('/api/properties')->assertJsonCount(2, 'data');

        Sanctum::actingAs($this->userWithRole('admin'));
        $this->postJson('/api/manager/properties/bulk-delete', ['ids' => $ids])->assertOk();

        $this->getJson('/api/properties')->assertJsonCount(0, 'data');
    }

    public function test_public_catalogue_ignores_bad_sort_input(): void
    {
        Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);

        $this->getJson('/api/properties?sort_by=price&sort_dir=drop&per_page=5000')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 60);
    }

    public function test_agent_cannot_use_manager_property_endpoints(): void
    {
        $agent = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $agent->id]);
        Sanctum::actingAs($agent);

        $this->putJson("/api/manager/properties/{$property->id}", ['title' => 'Hijacked'])->assertForbidden();
        $this->getJson('/api/agent/properties')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_listing_photos_can_be_removed_and_cover_is_promoted(): void
    {
        Storage::fake('public');
        $agent = $this->userWithRole('agent');
        Sanctum::actingAs($this->userWithRole('manager'));

        $id = $this->post('/api/manager/properties', [
            'title' => 'Sea-facing 3BHK', 'description' => 'Bright corner flat.', 'type' => 'sale',
            'category' => 'apartment', 'status' => 'available', 'price' => 32500000,
            'address' => '12 Carter Road', 'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip_code' => '400050',
            'bedrooms' => 3, 'bathrooms' => 3, 'area' => 1650, 'agent_id' => $agent->id,
            'images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.jpg')],
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

        $images = Property::find($id)->images;
        $this->assertCount(2, $images);
        $this->assertSame(1, $images->where('is_main', true)->count());

        $this->deleteJson("/api/manager/properties/{$id}/images/{$images->firstWhere('is_main', true)->id}")->assertOk();
        $remaining = Property::find($id)->images;
        $this->assertCount(1, $remaining);
        $this->assertTrue($remaining->first()->is_main);
    }

    public function test_changing_password_requires_the_current_password(): void
    {
        $client = $this->userWithRole('user', ['password' => 'Old@Pass1']);
        Sanctum::actingAs($client);

        $this->putJson('/api/user/profile', ['password' => 'New@Pass1', 'password_confirmation' => 'New@Pass1'])
            ->assertStatus(422)->assertJsonValidationErrors('current_password');
        $this->putJson('/api/user/profile', ['current_password' => 'wrong', 'password' => 'New@Pass1', 'password_confirmation' => 'New@Pass1'])
            ->assertStatus(422)->assertJsonValidationErrors('current_password');
        $this->putJson('/api/user/profile', ['current_password' => 'Old@Pass1', 'password' => 'New@Pass1', 'password_confirmation' => 'New@Pass1'])
            ->assertOk();

        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('New@Pass1', $client->fresh()->password));
    }

    public function test_profile_details_persist(): void
    {
        $client = $this->userWithRole('user');
        Sanctum::actingAs($client);

        $this->putJson('/api/user/profile', ['name' => 'Asha Rao', 'phone' => '+91 98200 11223'])->assertOk();
        $this->assertSame('Asha Rao', $client->fresh()->name);
        $this->putJson('/api/user/profile', ['email' => null, 'phone' => null])->assertStatus(422);
    }

    public function test_enquiry_reaches_staff_and_honeypot_drops_bots(): void
    {
        $admin = $this->userWithRole('admin');

        $this->postJson('/api/contact', ['name' => 'Bot', 'email' => 'bot@x.test', 'message' => 'spam', 'website' => 'http://spam'])->assertCreated();
        $this->assertSame(0, Enquiry::count());

        $this->postJson('/api/contact', ['name' => 'Meera', 'email' => 'meera@x.test', 'subject' => 'Sell enquiry', 'address' => 'Baner, Pune'])->assertCreated();
        $this->assertSame('sell', Enquiry::first()->type);
        $this->assertTrue(Notification::where('user_id', $admin->id)->where('type', 'enquiry.created')->exists());

        Sanctum::actingAs($admin);
        $id = Enquiry::first()->id;
        $this->putJson("/api/admin/enquiries/{$id}", ['status' => 'in_progress', 'assigned_to' => $admin->id])->assertOk();
        $this->putJson("/api/admin/enquiries/{$id}", ['assigned_to' => $this->userWithRole('user')->id])->assertStatus(422);
    }

    public function test_removing_an_agent_requires_reassigning_their_listings(): void
    {
        $leaving = $this->userWithRole('agent');
        $taking = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $leaving->id]);
        $booking = Booking::factory()->create(['property_id' => $property->id, 'agent_id' => $leaving->id, 'status' => 'pending']);
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->deleteJson("/api/admin/agents/{$leaving->id}")->assertStatus(422)->assertJsonValidationErrors('reassign_to');
        $this->deleteJson("/api/admin/agents/{$leaving->id}", ['reassign_to' => $taking->id])->assertOk();

        $this->assertSame($taking->id, $property->fresh()->agent_id);
        $this->assertSame($taking->id, $booking->fresh()->agent_id);
        $this->assertSoftDeleted('users', ['id' => $leaving->id]);
    }

    public function test_public_agent_directory_hides_deactivated_agents(): void
    {
        $this->userWithRole('agent', ['name' => 'Active Agent']);
        $this->userWithRole('agent', ['name' => 'Former Agent', 'is_active' => false]);

        $this->getJson('/api/agents')->assertOk()->assertJsonCount(1, 'data');

        $token = $this->userWithRole('manager')->createToken('t')->plainTextToken;
        $this->withToken($token)->getJson('/api/agents')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_api_errors_are_json_without_stack_traces(): void
    {
        config(['app.debug' => false]);

        $this->getJson('/api/properties/999999')->assertNotFound()->assertJsonMissingPath('trace');
        $this->getJson('/api/me')->assertUnauthorized();
    }
}
