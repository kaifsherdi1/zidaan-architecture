<?php

namespace App\Repositories;

use App\Models\Agent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AgentRepository
{
  /**
   * Get all agents with filters, sorting, and pagination
   */
  public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    $query = Agent::with(['user']);

    // Apply filters
    if (!empty($filters['specialization'])) {
      $query->where('specialization', 'like', '%' . $filters['specialization'] . '%');
    }

    if (!empty($filters['min_experience'])) {
      $query->where('experience_years', '>=', $filters['min_experience']);
    }

    if (!empty($filters['min_rating'])) {
      $query->where('rating', '>=', $filters['min_rating']);
    }

    // Search
    if (!empty($filters['search'])) {
      $search = $filters['search'];
      $query->where(function ($q) use ($search) {
        $q->where('license_number', 'like', "%{$search}%")
          ->orWhere('specialization', 'like', "%{$search}%")
          ->orWhereHas('user', function ($userQuery) use ($search) {
          $userQuery->where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%");
        }
        );
      });
    }

    // Apply sorting
    $sortBy = $filters['sort_by'] ?? 'created_at';
    $sortOrder = $filters['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    return $query->paginate($perPage);
  }

  /**
   * Get agent by ID with relationships
   */
  public function getById(int $id): ?Agent
  {
    return Agent::with(['user', 'properties'])->find($id);
  }

  /**
   * Create new agent
   */
  public function create(array $data): Agent
  {
    return Agent::create($data);
  }

  /**
   * Update agent
   */
  public function update(int $id, array $data): bool
  {
    $agent = Agent::find($id);
    if (!$agent) {
      return false;
    }
    return $agent->update($data);
  }

  /**
   * Soft delete agent
   */
  public function delete(int $id): bool
  {
    $agent = Agent::find($id);
    if (!$agent) {
      return false;
    }
    return $agent->delete();
  }

  /**
   * Restore soft-deleted agent
   */
  public function restore(int $id): bool
  {
    $agent = Agent::withTrashed()->find($id);
    if (!$agent) {
      return false;
    }
    return $agent->restore();
  }

  /**
   * Permanently delete agent
   */
  public function forceDelete(int $id): bool
  {
    $agent = Agent::withTrashed()->find($id);
    if (!$agent) {
      return false;
    }
    return $agent->forceDelete();
  }

  /**
   * Get top performing agents
   */
  public function getTopPerformers(int $limit = 10): Collection
  {
    return Agent::with(['user'])
      ->orderBy('total_sales', 'desc')
      ->orderBy('rating', 'desc')
      ->limit($limit)
      ->get();
  }

  /**
   * Get agent statistics
   */
  public function getAgentStatistics(int $agentId): ?array
  {
    $agent = Agent::with(['properties'])->find($agentId);

    if (!$agent) {
      return null;
    }

    $activeProperties = $agent->properties()->where('status', 'available')->count();
    $soldProperties = $agent->properties()->where('status', 'sold')->count();
    $totalProperties = $agent->properties()->count();

    return [
      'total_properties' => $totalProperties,
      'active_properties' => $activeProperties,
      'sold_properties' => $soldProperties,
      'total_sales' => $agent->total_sales,
      'rating' => $agent->rating,
      'commission_earned' => $agent->total_sales * ($agent->commission_rate / 100),
    ];
  }

  /**
   * Update performance metrics
   */
  public function updatePerformanceMetrics(int $agentId): bool
  {
    $agent = Agent::find($agentId);

    if (!$agent) {
      return false;
    }

    // Calculate total sales from sold properties
    $totalSales = $agent->properties()
      ->where('status', 'sold')
      ->sum('price');

    // Update agent metrics
    return $agent->update([
      'total_sales' => $totalSales,
    ]);
  }

  /**
   * Get agents by specialization
   */
  public function getAgentsBySpecialization(string $specialization, int $perPage = 15): LengthAwarePaginator
  {
    return Agent::with(['user'])
      ->where('specialization', 'like', '%' . $specialization . '%')
      ->orderBy('rating', 'desc')
      ->paginate($perPage);
  }

  /**
   * Search agents
   */
  public function searchAgents(string $query, int $perPage = 15): LengthAwarePaginator
  {
    return Agent::with(['user'])
      ->where(function ($q) use ($query) {
      $q->where('license_number', 'like', "%{$query}%")
        ->orWhere('specialization', 'like', "%{$query}%")
        ->orWhereHas('user', function ($userQuery) use ($query) {
        $userQuery->where('name', 'like', "%{$query}%")
          ->orWhere('email', 'like', "%{$query}%");
      }
      );
    })
      ->orderBy('rating', 'desc')
      ->paginate($perPage);
  }

  /**
   * Get agent by user ID
   */
  public function getByUserId(int $userId): ?Agent
  {
    return Agent::with(['user', 'properties'])->where('user_id', $userId)->first();
  }
}
