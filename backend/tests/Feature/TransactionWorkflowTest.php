<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Transaction;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransactionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function payload(Property $property, array $overrides = []): array
    {
        return $overrides + [
            'property_id' => $property->id,
            'client_name' => 'R. Sharma',
            'transaction_date' => now()->toDateString(),
            'amount' => 7500000,
            'status' => 'completed',
        ];
    }

    public function test_agent_cannot_record_a_sale_on_another_agents_listing(): void
    {
        $owner = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $owner->id]);

        Sanctum::actingAs($this->userWithRole('agent'));
        $this->postJson('/api/agent/transactions', $this->payload($property))->assertForbidden();
        $this->assertSame(0, Transaction::count());
    }

    public function test_agent_transactions_are_always_pending_and_staff_are_alerted(): void
    {
        $this->userWithRole('admin');
        $agent = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $agent->id]);

        Sanctum::actingAs($agent);
        $this->postJson('/api/agent/transactions', $this->payload($property))
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');
        $this->assertSame('available', $property->fresh()->status);
        $this->assertDatabaseHas('notifications', ['type' => 'transaction.created']);
    }

    public function test_completing_closes_listing_and_blocks_a_second_sale(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id, 'type' => 'sale']);
        Sanctum::actingAs($this->userWithRole('admin'));

        $id = $this->postJson('/api/admin/transactions', $this->payload($property, ['status' => 'pending']))->assertCreated()->json('data.id');
        $this->putJson("/api/admin/transactions/{$id}", ['status' => 'completed'])->assertOk();
        $this->assertSame('sold', $property->fresh()->status);

        $this->postJson('/api/admin/transactions', $this->payload($property))->assertStatus(422);
    }

    public function test_cancelling_a_completed_deal_relists_the_property(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id, 'type' => 'rent']);
        Sanctum::actingAs($this->userWithRole('admin'));

        $id = $this->postJson('/api/admin/transactions', $this->payload($property))->json('data.id');
        $this->assertSame('rented', $property->fresh()->status);

        $this->putJson("/api/admin/transactions/{$id}", ['status' => 'cancelled'])->assertOk();
        $this->assertSame('available', $property->fresh()->status);

        // cancelled is terminal
        $this->putJson("/api/admin/transactions/{$id}", ['status' => 'completed'])->assertStatus(422);
    }

    public function test_completed_figures_are_frozen_and_record_cannot_be_deleted(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);
        Sanctum::actingAs($this->userWithRole('admin'));
        $id = $this->postJson('/api/admin/transactions', $this->payload($property))->json('data.id');

        $this->putJson("/api/admin/transactions/{$id}", ['amount' => 1])->assertStatus(422);
        $this->putJson("/api/admin/transactions/{$id}", ['notes' => 'Registry done'])->assertOk();
        $this->deleteJson("/api/admin/transactions/{$id}")->assertStatus(422);
        $this->assertSame('7500000.00', Transaction::find($id)->amount);
    }

    public function test_reports_and_dashboard_run_on_this_database_driver(): void
    {
        $agent = $this->userWithRole('agent');
        $property = Property::factory()->create(['agent_id' => $agent->id]);
        Sanctum::actingAs($this->userWithRole('admin'));
        $this->postJson('/api/admin/transactions', $this->payload($property))->assertCreated();

        $this->getJson('/api/admin/transactions/report')
            ->assertOk()
            ->assertJsonPath('total_completed', 1)
            ->assertJsonPath('by_month.0.month', now()->format('Y-m'));
        $this->getJson('/api/admin/dashboard/stats')->assertOk()->assertJsonPath('kpi.total_revenue', 7500000);

        Sanctum::actingAs($agent);
        $this->getJson('/api/agent/earnings')->assertOk()->assertJsonPath('total_completed', 1);
        $this->getJson('/api/agent/statistics')->assertOk();
        $this->getJson('/api/agent/dashboard')->assertOk();
    }

    public function test_ledger_survives_a_trashed_property(): void
    {
        $property = Property::factory()->create(['agent_id' => $this->userWithRole('agent')->id]);
        Sanctum::actingAs($this->userWithRole('admin'));
        $this->postJson('/api/admin/transactions', $this->payload($property))->assertCreated();
        $property->delete();

        $id = $this->getJson('/api/admin/transactions')->assertOk()->assertJsonPath('data.0.property.is_deleted', true)->json('data.0.id');
        $this->get("/api/admin/transactions/{$id}/invoice")->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->deleteJson("/api/manager/properties/{$property->id}/force")->assertStatus(422);
    }
}
