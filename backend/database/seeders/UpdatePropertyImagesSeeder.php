<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Database\Seeder;

class UpdatePropertyImagesSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $properties = Property::take(4)->get();

    $images = [
      'single_floor_modern_1.jpg',
      'single_floor_traditional_1.jpg',
      'double_floor_modern_1.jpg',
      'double_floor_luxury_1.jpg',
    ];

    // Base URL for assets in public folder
    // The frontend serves public assets at root URL
    $baseUrl = 'http://localhost:5173/assets/houses/';

    foreach ($properties as $index => $property) {
      if (isset($images[$index])) {
        // Clear existing images
        $property->images()->delete();

        // Add new main image
        PropertyImage::create([
          'property_id' => $property->id,
          'image_path' => $baseUrl . $images[$index],
          'is_main' => true,
          'order' => 1
        ]);

        $this->command->info("Updated property {$property->id} with image: {$images[$index]}");
      }
    }
  }
}
