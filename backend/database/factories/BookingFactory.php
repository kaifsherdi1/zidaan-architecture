<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
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
      'user_id' => User::factory(),
      'agent_id' => User::factory(),
      'visit_date' => $this->faker->dateTimeBetween('now', '+1 month'),
      'visit_time' => $this->faker->dateTimeBetween('now', '+1 month'),
      'status' => $this->faker->randomElement(['pending', 'approved', 'rejected', 'completed']),
      'user_message' => $this->faker->sentence(),
      'agent_notes' => $this->faker->sentence(),
    ];
  }
}
