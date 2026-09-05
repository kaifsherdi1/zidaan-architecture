<?php

namespace App\Services;

use App\Repositories\TransactionRepository;
use App\Models\Property;
use Illuminate\Support\Facades\DB;
use Exception;

class TransactionService
{
  protected $transactionRepository;

  public function __construct(TransactionRepository $transactionRepository)
  {
    $this->transactionRepository = $transactionRepository;
  }

  public function getAllTransactions($filters, $perPage)
  {
    return $this->transactionRepository->getAll($filters, $perPage);
  }

  public function getAgentTransactions($agentId, $perPage = 15)
  {
    return $this->transactionRepository->getByAgent($agentId, $perPage);
  }

  public function getById($id)
  {
    return $this->transactionRepository->getById($id);
  }

  public function createTransaction($data)
  {
    return DB::transaction(function () use ($data) {
      // Check if property is already sold? (Optional check)

      $transaction = $this->transactionRepository->create($data);

      // If created as completed immediately (admin only maybe), update property
      if ($transaction->status === 'completed') {
        $this->updatePropertyStatus($transaction->property_id);
      }

      if ($transaction->agent_id) {
        $this->notify(
          $transaction->agent_id,
          'transaction.created',
          'New transaction recorded',
          "A {$transaction->status} transaction of ₹" . number_format((float) $transaction->amount) . ' was recorded for your listing.',
          ['transaction_id' => $transaction->id]
        );
      }

      return $transaction;
    });
  }

  public function updateTransaction($id, $data)
  {
    return DB::transaction(function () use ($id, $data) {
      $transaction = $this->transactionRepository->update($id, $data);

      // If status changed to completed, mark property as sold
      if (isset($data['status']) && $data['status'] === 'completed') {
        $this->updatePropertyStatus($transaction->property_id, 'sold');

        if ($transaction->agent_id) {
          $this->notify(
            $transaction->agent_id,
            'transaction.completed',
            'Transaction completed',
            'A transaction for "' . optional($transaction->property)->title . '" was marked completed.',
            ['transaction_id' => $transaction->id]
          );
        }
      }

      return $transaction;
    });
  }

  public function deleteTransaction($id)
  {
    return $this->transactionRepository->delete($id);
  }

  protected function updatePropertyStatus($propertyId)
  {
    $property = Property::find($propertyId);
    if ($property) {
      $property->status = $property->type === 'rent' ? 'rented' : 'sold';
      $property->save();
    }
  }

  /** Write an in-app notification row (custom schema, not the framework's DB channel). */
  protected function notify(int $userId, string $type, string $title, string $message, array $data = []): void
  {
    try {
      \App\Models\Notification::create([
        'user_id' => $userId,
        'type' => $type,
        'title' => $title,
        'message' => $message,
        'data' => $data,
        'is_read' => false,
      ]);
    } catch (\Throwable $e) {
      \Illuminate\Support\Facades\Log::warning('notify failed: ' . $e->getMessage());
    }
  }
}
