<?php

namespace App\Repositories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PropertyRepository
{
  /**
   * Get all properties with filters, sorting, and pagination
   */
  public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    $query = Property::with(['agent.user', 'images' => function ($query) {
      $query->orderBy('order');
    }]);

    // Apply filters
    if (!empty($filters['type'])) {
      $query->where('type', $filters['type']);
    }

    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['min_price'])) {
      $query->where('price', '>=', $filters['min_price']);
    }

    if (!empty($filters['max_price'])) {
      $query->where('price', '<=', $filters['max_price']);
    }

    if (!empty($filters['bedrooms'])) {
      $query->where('bedrooms', $filters['bedrooms']);
    }

    if (!empty($filters['bathrooms'])) {
      $query->where('bathrooms', $filters['bathrooms']);
    }

    if (!empty($filters['min_area'])) {
      $query->where('area', '>=', $filters['min_area']);
    }

    if (!empty($filters['max_area'])) {
      $query->where('area', '<=', $filters['max_area']);
    }

    if (!empty($filters['city'])) {
      $query->where('city', 'like', '%' . $filters['city'] . '%');
    }

    if (!empty($filters['state'])) {
      $query->where('state', 'like', '%' . $filters['state'] . '%');
    }

    if (!empty($filters['country'])) {
      $query->where('country', 'like', '%' . $filters['country'] . '%');
    }

    if (isset($filters['is_featured'])) {
      $query->where('is_featured', $filters['is_featured']);
    }

    if (!empty($filters['agent_id'])) {
      $query->where('agent_id', $filters['agent_id']);
    }

    // Apply sorting
    $sortBy = $filters['sort_by'] ?? 'created_at';
    $sortOrder = $filters['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    return $query->paginate($perPage);
  }

  /**
   * Get property by ID with relationships
   */
  public function getById(int $id): ?Property
  {
    return Property::with(['agent.user', 'images' => function ($query) {
      $query->orderBy('order');
    }])->find($id);
  }

  /**
   * Create new property
   */
  public function create(array $data): Property
  {
    return Property::create($data);
  }

  /**
   * Update property
   */
  public function update(int $id, array $data): bool
  {
    $property = Property::find($id);
    if (!$property) {
      return false;
    }
    return $property->update($data);
  }

  /**
   * Soft delete property
   */
  public function delete(int $id): bool
  {
    $property = Property::find($id);
    if (!$property) {
      return false;
    }
    return $property->delete();
  }

  /**
   * Restore soft-deleted property
   */
  public function restore(int $id): bool
  {
    $property = Property::withTrashed()->find($id);
    if (!$property) {
      return false;
    }
    return $property->restore();
  }

  /**
   * Permanently delete property
   */
  public function forceDelete(int $id): bool
  {
    $property = Property::withTrashed()->find($id);
    if (!$property) {
      return false;
    }
    return $property->forceDelete();
  }

  /**
   * Bulk soft delete properties
   */
  public function bulkDelete(array $ids): int
  {
    return Property::whereIn('id', $ids)->delete();
  }

  /**
   * Bulk restore properties
   */
  public function bulkRestore(array $ids): int
  {
    return Property::withTrashed()->whereIn('id', $ids)->restore();
  }

  /**
   * Get featured properties
   */
  public function getFeaturedProperties(int $limit = 10): Collection
  {
    return Property::with(['agent.user', 'images' => function ($query) {
      $query->orderBy('order');
    }])
      ->where('is_featured', true)
      ->where('status', 'available')
      ->limit($limit)
      ->get();
  }

  /**
   * Get properties by agent
   */
  public function getPropertiesByAgent(int $agentId, int $perPage = 15): LengthAwarePaginator
  {
    return Property::with(['images' => function ($query) {
      $query->orderBy('order');
    }])
      ->where('agent_id', $agentId)
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  /**
   * Get trashed properties
   */
  public function getTrashedProperties(int $perPage = 15): LengthAwarePaginator
  {
    return Property::onlyTrashed()
      ->with(['agent.user'])
      ->orderBy('deleted_at', 'desc')
      ->paginate($perPage);
  }

  /**
   * Increment views count
   */
  public function incrementViews(int $id): void
  {
    Property::where('id', $id)->increment('views_count');
  }
}
