<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository
{
  /**
   * Get all users with filters, sorting, and pagination
   */
  public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    $query = User::with(['role', 'agent']);

    // Apply filters
    if (!empty($filters['role'])) {
      $query->whereHas('role', function ($q) use ($filters) {
        $q->where('slug', $filters['role']);
      });
    }

    if (isset($filters['is_active'])) {
      $query->where('is_active', $filters['is_active']);
    }

    if (isset($filters['email_verified'])) {
      if ($filters['email_verified']) {
        $query->whereNotNull('email_verified_at');
      }
      else {
        $query->whereNull('email_verified_at');
      }
    }

    // Search
    if (!empty($filters['search'])) {
      $search = $filters['search'];
      $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%")
          ->orWhere('phone', 'like', "%{$search}%");
      });
    }

    // Apply sorting
    $sortBy = $filters['sort_by'] ?? 'created_at';
    $sortOrder = $filters['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    return $query->paginate($perPage);
  }

  /**
   * Get user by ID with relationships
   */
  public function getById(int $id): ?User
  {
    return User::with(['role', 'agent'])->find($id);
  }

  /**
   * Create new user
   */
  public function create(array $data): User
  {
    return User::create($data);
  }

  /**
   * Update user
   */
  public function update(int $id, array $data): bool
  {
    $user = User::find($id);
    if (!$user) {
      return false;
    }
    return $user->update($data);
  }

  /**
   * Soft delete user
   */
  public function delete(int $id): bool
  {
    $user = User::find($id);
    if (!$user) {
      return false;
    }
    return $user->delete();
  }

  /**
   * Restore soft-deleted user
   */
  public function restore(int $id): bool
  {
    $user = User::withTrashed()->find($id);
    if (!$user) {
      return false;
    }
    return $user->restore();
  }

  /**
   * Permanently delete user
   */
  public function forceDelete(int $id): bool
  {
    $user = User::withTrashed()->find($id);
    if (!$user) {
      return false;
    }
    return $user->forceDelete();
  }

  /**
   * Bulk soft delete users
   */
  public function bulkDelete(array $ids): int
  {
    return User::whereIn('id', $ids)->delete();
  }

  /**
   * Bulk restore users
   */
  public function bulkRestore(array $ids): int
  {
    return User::withTrashed()->whereIn('id', $ids)->restore();
  }

  /**
   * Assign role to user
   */
  public function assignRole(int $userId, int $roleId): bool
  {
    $user = User::find($userId);
    if (!$user) {
      return false;
    }
    return $user->update(['role_id' => $roleId]);
  }

  /**
   * Get users by role
   */
  public function getUsersByRole(string $roleSlug, int $perPage = 15): LengthAwarePaginator
  {
    return User::with(['role', 'agent'])
      ->whereHas('role', function ($q) use ($roleSlug) {
      $q->where('slug', $roleSlug);
    })
      ->orderBy('created_at', 'desc')
      ->paginate($perPage);
  }

  /**
   * Get trashed users
   */
  public function getTrashedUsers(int $perPage = 15): LengthAwarePaginator
  {
    return User::onlyTrashed()
      ->with(['role'])
      ->orderBy('deleted_at', 'desc')
      ->paginate($perPage);
  }

  /**
   * Search users
   */
  public function searchUsers(string $query, int $perPage = 15): LengthAwarePaginator
  {
    return User::with(['role', 'agent'])
      ->where(function ($q) use ($query) {
      $q->where('name', 'like', "%{$query}%")
        ->orWhere('email', 'like', "%{$query}%")
        ->orWhere('phone', 'like', "%{$query}%");
    })
      ->orderBy('name')
      ->paginate($perPage);
  }
}
