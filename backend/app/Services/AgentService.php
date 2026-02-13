<?php

namespace App\Services;

use App\Repositories\AgentRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class AgentService
{
  protected AgentRepository $agentRepository;

  public function __construct(AgentRepository $agentRepository)
  {
    $this->agentRepository = $agentRepository;
  }

  /**
   * Get all agents with filters
   */
  public function getAllAgents(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    return $this->agentRepository->getAll($filters, $perPage);
  }

  /**
   * Get agent by ID
   */
  public function getAgentById(int $id)
  {
    return $this->agentRepository->getById($id);
  }

  /**
   * Create new agent
   */
  public function createAgent(array $data)
  {
    // Create agent
    $agent = $this->agentRepository->create($data);

    // Reload with relationships
    return $this->agentRepository->getById($agent->id);
  }

  /**
   * Update agent
   */
  public function updateAgent(int $id, array $data)
  {
    // Update agent
    $this->agentRepository->update($id, $data);

    // Reload with relationships
    return $this->agentRepository->getById($id);
  }

  /**
   * Soft delete agent
   */
  public function deleteAgent(int $id): bool
  {
    return $this->agentRepository->delete($id);
  }

  /**
   * Restore soft-deleted agent
   */
  public function restoreAgent(int $id): bool
  {
    return $this->agentRepository->restore($id);
  }

  /**
   * Permanently delete agent
   */
  public function forceDeleteAgent(int $id): bool
  {
    return $this->agentRepository->forceDelete($id);
  }

  /**
   * Get top performing agents
   */
  public function getTopPerformers(int $limit = 10)
  {
    return $this->agentRepository->getTopPerformers($limit);
  }

  /**
   * Get agent statistics
   */
  public function getAgentStatistics(int $agentId): ?array
  {
    return $this->agentRepository->getAgentStatistics($agentId);
  }

  /**
   * Update performance metrics
   */
  public function updatePerformanceMetrics(int $agentId): bool
  {
    return $this->agentRepository->updatePerformanceMetrics($agentId);
  }

  /**
   * Calculate commission for an agent
   */
  public function calculateCommission(int $agentId, float $saleAmount): ?float
  {
    $agent = $this->agentRepository->getById($agentId);

    if (!$agent) {
      return null;
    }

    return $saleAmount * ($agent->commission_rate / 100);
  }

  /**
   * Get agent by user ID
   */
  public function getAgentByUserId(int $userId)
  {
    return $this->agentRepository->getByUserId($userId);
  }

  /**
   * Update agent profile (for agent themselves)
   */
  public function updateProfile(int $agentId, array $data)
  {
    // Remove sensitive fields that agents shouldn't update themselves
    unset($data['user_id'], $data['total_sales'], $data['commission_rate']);

    // Update agent
    $this->agentRepository->update($agentId, $data);

    // Reload with relationships
    return $this->agentRepository->getById($agentId);
  }
}
