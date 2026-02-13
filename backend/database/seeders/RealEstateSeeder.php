<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Support\Str;

class RealEstateSeeder extends Seeder
{
  public function run(): void
  {
    $agent = User::first(); // Use the existing test user as agent
    if (!$agent) {
      $agent = User::create([
        'name' => 'Principal Architect',
        'email' => 'architect@zidaan.com',
        'password' => bcrypt('password'),
      ]);
    }

    $properties = [
      [
        'title' => 'The Modernist Retreat',
        'description' => 'A 30x40 compact masterpiece focusing on the dialogue between concrete and vertical greenery. This residence features a double-height living volume and a private rooftop garden, embodying the essence of contemporary urban living.',
        'type' => 'sale',
        'price' => 850000,
        'bedrooms' => 3,
        'bathrooms' => 3,
        'area' => 1200,
        'address' => '42 Architectural Blvd',
        'city' => 'Mumbai',
        'state' => 'Maharashtra',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Realx-30x40-img1.png', 'properties/Realx-30x40-image2.png']
      ],
      [
        'title' => 'Minimalist Pavilion',
        'description' => 'This 30x40 dwelling is an exploration of pure geometry and natural light. Large floor-to-ceiling glass panels dissolve the boundaries between the interior stillness and the curated exterior courtyard.',
        'type' => 'sale',
        'price' => 720000,
        'bedrooms' => 2,
        'bathrooms' => 2,
        'area' => 1150,
        'address' => '15 Zen Lane',
        'city' => 'Bangalore',
        'state' => 'Karnataka',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Realx-30x40-image3.png', 'properties/Realx-30x40-image4.png']
      ],
      [
        'title' => 'The Sculpted Residence',
        'description' => 'A dramatic 30x40 intervention defined by its cantilevered volumes and shadow play. The interior features raw material finishes—exposed concrete and warm teak wood—creating a sophisticated, tactile atmosphere.',
        'type' => 'sale',
        'price' => 920000,
        'bedrooms' => 3,
        'bathrooms' => 4,
        'area' => 1350,
        'address' => '88 Brutalist Road',
        'city' => 'Delhi',
        'state' => 'NCR',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Realx-30x40-image5.png', 'properties/Realx-30x40-image6.png']
      ],
      [
        'title' => 'Axioma Grande Villa',
        'description' => 'Our flagship 40x60 estate. This expansive villa redefines luxury through the lens of architectural minimalism. Featuring wide open floor plans, a reflection pool, and a monolithic marble staircase, it is a statement of design excellence.',
        'type' => 'sale',
        'price' => 1850000,
        'bedrooms' => 5,
        'bathrooms' => 6,
        'area' => 2400,
        'address' => '1 Prestige Circle',
        'city' => 'Hyderabad',
        'state' => 'Telangana',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Realx-40x60-image1.png']
      ],
      [
        'title' => 'The Monolith',
        'description' => 'A singular volume of dark-toned concrete and steel, The Monolith stands as a testament to brutalist-inspired minimalism. Its interior is a vast, light-filled cavern that defies its heavy exterior appearance.',
        'type' => 'sale',
        'price' => 1100000,
        'bedrooms' => 4,
        'bathrooms' => 4,
        'area' => 1800,
        'address' => '7 Concrete Way',
        'city' => 'Chennai',
        'state' => 'Tamil Nadu',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Zidaan-image1.jpg']
      ],
      [
        'title' => 'Ethereal Glass Villa',
        'description' => 'Boundaries dissolve in this light-weight structure of glass and white aluminum. The villa seems to float above its landscape, offering 360-degree views and an unparalleled connection to the surrounding nature.',
        'type' => 'sale',
        'price' => 1450000,
        'bedrooms' => 3,
        'bathrooms' => 3,
        'area' => 2100,
        'address' => '12 Panorama Ridge',
        'city' => 'Pune',
        'state' => 'Maharashtra',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Zidaan-image2.jpg']
      ],
      [
        'title' => 'Brutalist Sanctum',
        'description' => 'An fortress of solitude featuring raw timber-shuttered concrete and deep recessed windows. The Sanctum offers a sense of absolute security and quietude in the heart of the busy city.',
        'type' => 'sale',
        'price' => 980000,
        'bedrooms' => 3,
        'bathrooms' => 3,
        'area' => 1550,
        'address' => '45 Fortress Gate',
        'city' => 'Ahmedabad',
        'state' => 'Gujarat',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Zidaan-image3.jpg']
      ],
      [
        'title' => 'Zen Infinity House',
        'description' => 'Inspired by traditional courtyard houses, this residence centers around a silent stone garden. Water features flow through the living spaces, creating a rhythmic and calming environment.',
        'type' => 'sale',
        'price' => 1250000,
        'bedrooms' => 4,
        'bathrooms' => 5,
        'area' => 2000,
        'address' => '33 Stillness Ave',
        'city' => 'Jaipur',
        'state' => 'Rajasthan',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Zidaan-image4.jpg']
      ],
      [
        'title' => 'The Cantilever House',
        'description' => 'Defying gravity with its daring 8-meter cantilevered master wing, this project is a feat of modern engineering and design daring. It offers dramatic views and a unique living experience.',
        'type' => 'sale',
        'price' => 1600000,
        'bedrooms' => 4,
        'bathrooms' => 4,
        'area' => 2250,
        'address' => '9 Gravity Road',
        'city' => 'Kolkata',
        'state' => 'West Bengal',
        'country' => 'India',
        'is_featured' => true,
        'images' => ['properties/Zidaan-image5.jpg']
      ],
    ];

    foreach ($properties as $p) {
      $images = $p['images'];
      unset($p['images']);
      $p['agent_id'] = $agent->id;

      // Re-use existing property if it exists to avoid duplicates if seeder is run multiple times
      $prop = Property::where('title', $p['title'])->first();
      if (!$prop) {
        $p['slug'] = Str::slug($p['title']) . '-' . rand(100, 999);
        $prop = Property::create($p);
      }

      foreach ($images as $index => $img) {
        PropertyImage::firstOrCreate([
          'property_id' => $prop->id,
          'image_path' => $img,
        ], [
          'is_main' => $index === 0,
          'order' => $index
        ]);
      }
    }
  }
}
