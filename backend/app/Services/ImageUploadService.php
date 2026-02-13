<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
  /**
   * Upload property images
   *
   * @param int $propertyId
   * @param array $images Array of UploadedFile objects
   * @return array Array of uploaded image paths
   */
  public function uploadPropertyImages(int $propertyId, array $images): array
  {
    $uploadedPaths = [];
    $directory = "properties/{$propertyId}";

    foreach ($images as $index => $image) {
      if ($image instanceof UploadedFile) {
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs($directory, $filename, 'public');

        $uploadedPaths[] = [
          'path' => $path,
          'order' => $index + 1,
        ];
      }
    }

    return $uploadedPaths;
  }

  /**
   * Delete property image
   *
   * @param string $path
   * @return bool
   */
  public function deleteImage(string $path): bool
  {
    return Storage::disk('public')->delete($path);
  }

  /**
   * Delete all property images
   *
   * @param int $propertyId
   * @return bool
   */
  public function deletePropertyImages(int $propertyId): bool
  {
    return Storage::disk('public')->deleteDirectory("properties/{$propertyId}");
  }
}
