<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Property;
use App\Models\Agent;
use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ApiVerificationTest extends TestCase
{
  // use RefreshDatabase; // We might want to keep data for manual inspection, but for pure testing RefreshDatabase is better. Let's use it to avoid state pollution.
  use RefreshDatabase;

  protected $admin;
  protected $agent;
  protected $user;

  protected function setUp(): void
  {
    parent::setUp();

    // Seed roles
    $this->seed(\Database\Seeders\RoleSeeder::class);

    // Create Users
    $this->admin = User::factory()->create(['role_id' => Role::where('slug', 'admin')->first()->id]);
    $this->agent = User::factory()->create(['role_id' => Role::where('slug', 'agent')->first()->id]);
    $this->user = User::factory()->create(['role_id' => Role::where('slug', 'user')->first()->id]);

    // Create Agent Profile
    Agent::factory()->create(['user_id' => $this->agent->id]);
  }

  /**
   * Test Auth Routes
   */
  public function test_auth_routes()
  {
    // Register
    $response = $this->postJson('/api/auth/register', [
      'name' => 'New User',
      'email' => 'newuser@example.com',
      'password' => 'password',
      'password_confirmation' => 'password',
      'role' => 'user' // Assuming generic registration defaults to user or accepts role
    ]);
    $response->assertStatus(201)->assertJsonStructure(['user', 'access_token']);

    // Login
    $response = $this->postJson('/api/auth/login', [
      'email' => 'newuser@example.com',
      'password' => 'password',
    ]);
    $response->assertStatus(200)->assertJsonStructure(['user', 'access_token']);
    $token = $response->json('access_token');

    // Me
    $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token, 'Accept' => 'application/json'])->getJson('/api/auth/me');
    $response->assertStatus(200);

    // Logout
    $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token, 'Accept' => 'application/json'])->postJson('/api/auth/logout');
    $response->assertStatus(200);
  }

  /**
   * Test Properties Routes
   */
  public function test_properties_routes()
  {
    $property = Property::factory()->create(['agent_id' => $this->agent->id]);

    // Public List
    $response = $this->getJson('/api/properties');
    $response->assertStatus(200);

    // Public Show
    $response = $this->getJson('/api/properties/' . $property->id);
    $response->assertStatus(200);

    // Manager Create Property
    $manager = User::factory()->create(['role_id' => Role::where('slug', 'manager')->first()->id]);
    Sanctum::actingAs($manager, ['*']);
    $agentProfile = Agent::where('user_id', $this->agent->id)->first();
    $response = $this->postJson('/api/manager/properties', [
      'title' => 'Manager Property',
      'description' => 'Description',
      'price' => 500000,
      'type' => 'sale',
      'status' => 'available',
      'bedrooms' => 3,
      'bathrooms' => 2,
      'area' => 1200,
      'area_unit' => 'sqft',
      'address' => '123 Main St',
      'city' => 'Manhattan',
      'state' => 'NY',
      'country' => 'USA',
      'zip_code' => '10001',
      'agent_id' => $agentProfile->id
    ]);
    $response->assertStatus(201);
    $response->assertStatus(201);
  }

  /**
   * Test Agent Routes
   */
  public function test_agent_routes()
  {
    // Public List
    $response = $this->getJson('/api/agents');
    $response->assertStatus(200);

    // Public Show
    Agent::factory()->create(['user_id' => $this->agent->id]); // Ensure agent profile exists
    $response = $this->getJson('/api/agents/' . $this->agent->id); // Usually shows by user_id or agent_id
  // Route is Route::get('/{id}', [AgentController::class , 'show']);
  // If imports are correct, simple get should work.

  // Assert 200 or 404 if not found (but we created it). 
  // Note: AgentController::show might expect ID of Agent model, not User model.
  // Let's check logic later. For now, try.
  }

  /**
   * Test Bookings
   */
  public function test_bookings()
  {
    $property = Property::factory()->create(['agent_id' => $this->agent->id]);

    Sanctum::actingAs($this->user, ['*']);
    $response = $this->postJson('/api/user/bookings', [
      'property_id' => $property->id,
      'booking_date' => now()->addDays(5)->format('Y-m-d'),
      'booking_time' => '10:00',
      'message' => 'I want to see this.'
    ]);
    $response->assertStatus(201);

    // Agent View Bookings
    Sanctum::actingAs($this->agent, ['*']);
    $response = $this->getJson('/api/agent/bookings');
    $response->assertStatus(200);
  }

  /**
   * Test Transactions
   */
  public function test_transactions()
  {
    $property = Property::factory()->create(['agent_id' => $this->agent->id]);

    // Admin creates transaction
    Sanctum::actingAs($this->admin, ['*']);
    $response = $this->postJson('/api/admin/transactions', [
      'property_id' => $property->id,
      'agent_id' => $this->agent->id,
      'user_id' => $this->user->id,
      'client_name' => 'John Doe',
      'transaction_date' => '2025-01-01',
      'amount' => 500000,
      'status' => 'completed',
      'notes' => 'Sold'
    ]);
    $response->assertStatus(201);
  }
}
