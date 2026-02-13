<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AgentFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'user_id' => User::factory(),
      'bio' => $this->faker->paragraph(),
      'specializations' => ['residential', 'commercial'],
      'years_of_experience' => $this->faker->numberBetween(1, 20),
      'commission_rate' => $this->faker->randomFloat(2, 1, 5),
      'license_number' => $this->faker->bothify('LIC-#####'),
      'license_expiry' => $this->faker->date(),
      'facebook_url' => $this->faker->url(),
      'twitter_url' => $this->faker->url(),
      'linkedin_url' => $this->faker->url(),
      'instagram_url' => $this->faker->url(),
      'properties_sold' => $this->faker->numberBetween(0, 100),
      'properties_rented' => $this->faker->numberBetween(0, 100),
      'total_sales_value' => $this->faker->randomFloat(2, 100000, 10000000),
      'average_rating' => $this->faker->randomFloat(2, 1, 5),
      'total_reviews' => $this->faker->numberBetween(0, 50),
      'is_verified' => $this->faker->boolean(),
      'is_available' => true,
    ];
  }
}
