<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'agent_id' => User::factory(),
      'title' => $this->faker->sentence(),
      'slug' => $this->faker->unique()->slug(),
      'description' => $this->faker->paragraph(),
      'type' => $this->faker->randomElement(['sale', 'rent']),
      'status' => $this->faker->randomElement(['available', 'sold', 'rented']),
      'price' => $this->faker->numberBetween(100000, 1000000),
      'bedrooms' => $this->faker->numberBetween(1, 5),
      'bathrooms' => $this->faker->numberBetween(1, 3),
      'garages' => $this->faker->numberBetween(0, 2),
      'area' => $this->faker->numberBetween(500, 5000),
      'address' => $this->faker->address(),
      'city' => $this->faker->city(),
      'state' => $this->faker->state(),
      'country' => $this->faker->country(),
      'zip_code' => $this->faker->postcode(),
      'latitude' => $this->faker->latitude(),
      'longitude' => $this->faker->longitude(),
      'features' => ['pool', 'garden', 'garage'],
      'is_featured' => $this->faker->boolean(20),
      'views_count' => $this->faker->numberBetween(0, 1000),
    ];
  }
}
