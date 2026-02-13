<?php

namespace App\Repositories;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionRepository implements RepositoryInterface
{
  public function getAll($filters = [], $perPage = 15)
  {
    $query = Transaction::with(['property', 'agent', 'user']);

    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['agent_id'])) {
      $query->where('agent_id', $filters['agent_id']);
    }

    if (!empty($filters['date_from'])) {
      $query->whereDate('transaction_date', '>=', $filters['date_from']);
    }

    if (!empty($filters['date_to'])) {
      $query->whereDate('transaction_date', '<=', $filters['date_to']);
    }

    return $query->latest()->paginate($perPage);
  }

  public function getById($id)
  {
    return Transaction::with(['property', 'agent', 'user'])->findOrFail($id);
  }

  public function create(array $data)
  {
    return Transaction::create($data);
  }

  public function update($id, array $data)
  {
    $transaction = $this->getById($id);
    $transaction->update($data);
    return $transaction;
  }

  public function delete($id)
  {
    $transaction = $this->getById($id);
    return $transaction->delete();
  }

  public function getByAgent($agentId, $perPage = 15)
  {
    return Transaction::with(['property', 'user'])
      ->where('agent_id', $agentId)
      ->latest()
      ->paginate($perPage);
  }

  public function getTotalRevenue($startDate = null, $endDate = null)
  {
    $query = Transaction::where('status', 'completed');
    if ($startDate && $endDate) {
      $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }
    return $query->sum('amount');
  }
}
