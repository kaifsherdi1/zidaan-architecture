<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'property_id' => Property::factory(),
      'agent_id' => User::factory(),
      'user_id' => User::factory(),
      'client_name' => $this->faker->name(),
      'transaction_date' => $this->faker->date(),
      'amount' => $this->faker->randomFloat(2, 10000, 1000000),
      'status' => $this->faker->randomElement(['pending', 'completed', 'cancelled']),
      'notes' => $this->faker->sentence(),
    ];
  }
}
