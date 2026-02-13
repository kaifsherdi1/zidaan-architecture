<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserService
{
  protected UserRepository $userRepository;

  public function __construct(UserRepository $userRepository)
  {
    $this->userRepository = $userRepository;
  }

  /**
   * Get all users with filters
   */
  public function getAllUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    return $this->userRepository->getAll($filters, $perPage);
  }

  /**
   * Get user by ID
   */
  public function getUserById(int $id)
  {
    return $this->userRepository->getById($id);
  }

  /**
   * Create new user
   */
  public function createUser(array $data)
  {
    // Hash password
    if (isset($data['password'])) {
      $data['password'] = Hash::make($data['password']);
    }

    // Create user
    $user = $this->userRepository->create($data);

    // Reload with relationships
    return $this->userRepository->getById($user->id);
  }

  /**
   * Update user
   */
  public function updateUser(int $id, array $data)
  {
    // Hash password if provided
    if (isset($data['password']) && !empty($data['password'])) {
      $data['password'] = Hash::make($data['password']);
    }
    else {
      // Remove password from update if not provided
      unset($data['password']);
    }

    // Update user
    $this->userRepository->update($id, $data);

    // Reload with relationships
    return $this->userRepository->getById($id);
  }

  /**
   * Soft delete user
   */
  public function deleteUser(int $id): bool
  {
    return $this->userRepository->delete($id);
  }

  /**
   * Restore soft-deleted user
   */
  public function restoreUser(int $id): bool
  {
    return $this->userRepository->restore($id);
  }

  /**
   * Permanently delete user
   */
  public function forceDeleteUser(int $id): bool
  {
    // Get user to delete avatar
    $user = $this->userRepository->getById($id);

    if ($user && $user->avatar) {
      Storage::disk('public')->delete($user->avatar);
    }

    return $this->userRepository->forceDelete($id);
  }

  /**
   * Bulk soft delete users
   */
  public function bulkDeleteUsers(array $ids): int
  {
    return $this->userRepository->bulkDelete($ids);
  }

  /**
   * Bulk restore users
   */
  public function bulkRestoreUsers(array $ids): int
  {
    return $this->userRepository->bulkRestore($ids);
  }

  /**
   * Assign role to user
   */
  public function assignRole(int $userId, int $roleId): bool
  {
    return $this->userRepository->assignRole($userId, $roleId);
  }

  /**
   * Update user profile
   */
  public function updateProfile(int $userId, array $data)
  {
    // Hash password if provided
    if (isset($data['password']) && !empty($data['password'])) {
      $data['password'] = Hash::make($data['password']);
    }
    else {
      unset($data['password']);
    }

    // Update user
    $this->userRepository->update($userId, $data);

    // Reload with relationships
    return $this->userRepository->getById($userId);
  }

  /**
   * Upload user avatar
   */
  public function uploadAvatar(int $userId, UploadedFile $file): ?string
  {
    $user = $this->userRepository->getById($userId);

    if (!$user) {
      return null;
    }

    // Delete old avatar if exists
    if ($user->avatar) {
      Storage::disk('public')->delete($user->avatar);
    }

    // Upload new avatar
    $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
    $path = $file->storeAs('avatars', $filename, 'public');

    // Update user avatar
    $this->userRepository->update($userId, ['avatar' => $path]);

    return $path;
  }

  /**
   * Get users by role
   */
  public function getUsersByRole(string $roleSlug, int $perPage = 15): LengthAwarePaginator
  {
    return $this->userRepository->getUsersByRole($roleSlug, $perPage);
  }
}
