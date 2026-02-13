<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyService
{
  public function getAllProperties($filters, $perPage = 15)
  {
    $query = Property::query()->with(['agent', 'images']);

    if (isset($filters['type'])) {
      $query->where('type', $filters['type']);
    }

    if (isset($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (isset($filters['min_price'])) {
      $query->where('price', '>=', $filters['min_price']);
    }

    if (isset($filters['max_price'])) {
      $query->where('price', '<=', $filters['max_price']);
    }

    if (isset($filters['garages'])) {
      $query->where('garages', '>=', $filters['garages']);
    }

    if (isset($filters['bedrooms'])) {
      $query->where('bedrooms', '>=', $filters['bedrooms']);
    }

    if (isset($filters['bathrooms'])) {
      $query->where('bathrooms', '>=', $filters['bathrooms']);
    }

    if (isset($filters['city'])) {
      $query->where('city', 'like', '%' . $filters['city'] . '%');
    }

    $sortField = $filters['sort_by'] ?? 'created_at';
    $sortDirection = $filters['sort_dir'] ?? 'desc';
    $allowedSorts = ['price', 'created_at', 'area', 'views_count'];

    if (in_array($sortField, $allowedSorts)) {
      $query->orderBy($sortField, $sortDirection);
    }

    return $query->paginate($perPage);
  }

  public function createProperty($data, $images = [])
  {
    $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);

    $property = Property::create($data);

    if (!empty($images)) {
      $this->uploadImages($property, $images);
    }

    return $property;
  }

  public function updateProperty(Property $property, $data, $images = [])
  {
    if (isset($data['title']) && $data['title'] !== $property->title) {
      $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
    }

    $property->update($data);

    if (!empty($images)) {
      // Optional: logic to replace or append images
      $this->uploadImages($property, $images);
    }

    return $property;
  }

  public function deleteProperty(Property $property)
  {
    // We are using SoftDeletes, so just delete
    return $property->delete();
  }

  protected function uploadImages(Property $property, $images)
  {
    foreach ($images as $index => $image) {
      $path = $image->store('properties/' . $property->id, 'public');

      PropertyImage::create([
        'property_id' => $property->id,
        'image_path' => $path,
        'is_main' => $index === 0, // First image is main by default if not specified
        'order' => $index
      ]);
    }
  }
}
