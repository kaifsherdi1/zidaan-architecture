<?php

namespace App\Repositories;

use App\Models\Transaction;

class TransactionRepository
{
  public function getAll(array $filters = [], int $perPage = 15)
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

    if (!empty($filters['search'])) {
      $s = $filters['search'];
      $query->where(fn ($q) => $q->where('client_name', 'like', "%{$s}%")
        ->orWhereHas('property', fn ($p) => $p->withTrashed()->where('title', 'like', "%{$s}%")));
    }

    return $query->latest('transaction_date')->latest('id')->paginate($perPage);
  }

  public function getById($id)
  {
    return Transaction::with(['property', 'agent', 'user'])->findOrFail($id);
  }

  public function create(array $data)
  {
    return Transaction::create($data);
  }

  public function getByAgent(int $agentId, int $perPage = 15)
  {
    return Transaction::with(['property', 'agent', 'user'])
      ->where('agent_id', $agentId)
      ->latest('transaction_date')->latest('id')
      ->paginate($perPage);
  }
}
