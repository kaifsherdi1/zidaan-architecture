<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Property;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function requestViewing($client, Property $property, string $time = '10:00')
    {
        Sanctum::actingAs($client);

        return $this->postJson('/api/user/bookings', [
            'property_id' => $property->id,
            'visit_date' => now()->addDays(3)->toDateString(),
            'visit_time' => $time,
        ]);
    }

    public function test_full_lifecycle_notifies_both_sides(): void
    {
        $agent = $this->userWithRole('agent');
        $client = $this->userWithRole('user');
        $property = Property::factory()->create(['agent_id' => $agent->id]);

        $id = $this->requestViewing($client, $property)->assertCreated()->json('data.id');
        $this->assertSame($agent->id, Booking::find($id)->agent_id);
        $this->assertTrue(Notification::where('user_id', $agent->id)->where('type', 'booking.created')->exists());

        Sanctum::actingAs($agent);
        $this->getJson('/api/agent/bookings')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson("/api/agent/bookings/{$id}/status", ['status' => 'approved'])->assertOk();
        $this->assertTrue(Notification::where('user_id', $client->id)->where('type', 'booking.approved')->exists());
        $this->putJson("/api/agent/bookings/{$id}/status", ['status' => 'completed'])->assertOk();

        $this->assertSame('completed', Booking::find($id)->status);
    }

    public function test_agent_cannot_change_another_agents_booking(): void
    {
        $owner = $this->userWithRole('agent');
        $intruder = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $owner->id]);
        $id = $this->requestViewing($this->userWithRole('user'), $property)->json('data.id');

        Sanctum::actingAs($intruder);
        $this->putJson("/api/agent/bookings/{$id}/status", ['status' => 'rejected'])->assertNotFound();
        $this->assertSame('pending', Booking::find($id)->status);
    }

    public function test_agent_sees_only_bookings_on_their_own_listings(): void
    {
        // The old code filtered by the agents-table id instead of the user id,
        // so an agent could see whichever user's bookings shared that number.
        $a = $this->userWithRole('agent');
        $b = $this->userWithRole('agent');
        Agent::factory()->create(['user_id' => $a->id]);
        $property = Property::factory()->create(['agent_id' => $b->id]);
        $this->requestViewing($this->userWithRole('user'), $property)->assertCreated();

        Sanctum::actingAs($a);
        $this->getJson('/api/agent/bookings')->assertOk()->assertJsonCount(0, 'data');
        Sanctum::actingAs($b);
        $this->getJson('/api/agent/bookings')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_terminal_statuses_cannot_be_reopened(): void
    {
        $agent = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $agent->id]);
        $id = $this->requestViewing($this->userWithRole('user'), $property)->json('data.id');

        Sanctum::actingAs($agent);
        $this->putJson("/api/agent/bookings/{$id}/status", ['status' => 'rejected'])->assertOk();
        $this->putJson("/api/agent/bookings/{$id}/status", ['status' => 'approved'])->assertStatus(422);
        $this->putJson("/api/agent/bookings/{$id}/status", ['status' => 'completed'])->assertStatus(422);
    }

    public function test_cannot_approve_two_viewings_in_the_same_slot(): void
    {
        $agent = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $agent->id]);
        $first = $this->requestViewing($this->userWithRole('user'), $property)->json('data.id');
        $second = $this->requestViewing($this->userWithRole('user'), $property)->json('data.id');

        Sanctum::actingAs($agent);
        $this->putJson("/api/agent/bookings/{$first}/status", ['status' => 'approved'])->assertOk();
        $this->putJson("/api/agent/bookings/{$second}/status", ['status' => 'approved'])->assertStatus(422);

        // and a new request for that slot is refused up front
        $this->requestViewing($this->userWithRole('user'), $property)->assertStatus(422);
    }

    public function test_duplicate_open_request_is_refused(): void
    {
        $client = $this->userWithRole('user');
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);

        $this->requestViewing($client, $property, '10:00')->assertCreated();
        $this->requestViewing($client, $property, '15:00')->assertStatus(422);
        $this->assertSame(1, Booking::count());
    }

    public function test_sold_listing_cannot_be_booked(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id, 'status' => 'sold']);

        $this->requestViewing($this->userWithRole('user'), $property)
            ->assertStatus(422)
            ->assertJsonPath('message', 'This property has already been sold, so viewings are closed.');
    }

    public function test_client_cannot_see_or_cancel_another_clients_booking(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);
        $id = $this->requestViewing($this->userWithRole('user'), $property)->json('data.id');

        Sanctum::actingAs($this->userWithRole('user'));
        $this->getJson("/api/user/bookings/{$id}")->assertNotFound();
        $this->postJson("/api/user/bookings/{$id}/cancel")->assertNotFound();
        $this->assertSame('pending', Booking::find($id)->status);
    }

    public function test_client_can_cancel_own_booking_once(): void
    {
        $client = $this->userWithRole('user');
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);
        $id = $this->requestViewing($client, $property)->json('data.id');

        $this->postJson("/api/user/bookings/{$id}/cancel", ['reason' => 'Plans changed'])->assertOk();
        $this->postJson("/api/user/bookings/{$id}/cancel")->assertStatus(422);
    }

    public function test_bookings_list_survives_a_trashed_property(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);
        $this->requestViewing($this->userWithRole('user'), $property)->assertCreated();
        $property->delete();

        Sanctum::actingAs($this->userWithRole('admin'));
        $this->getJson('/api/admin/bookings')->assertOk()->assertJsonPath('data.0.property.id', $property->id);
    }
}
