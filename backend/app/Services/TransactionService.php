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

  public function createTransaction($data)
  {
    return DB::transaction(function () use ($data) {
      // Check if property is already sold? (Optional check)

      $transaction = $this->transactionRepository->create($data);

      // If created as completed immediately (admin only maybe), update property
      if ($transaction->status === 'completed') {
        $this->updatePropertyStatus($transaction->property_id, 'sold');
      // Notify Agent (if admin created it) or Admin (if agent created it - though admin notification logic might need custom user selection)
      }
      else {
      // Pending transaction: Notify Admin? (We can skip admin notification for now or implement if we have admin user access)
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

        // Notify Agent
        if ($transaction->agent) {
          $transaction->agent->notify(new \App\Notifications\TransactionNotification($transaction, 'completed'));
        }

        // Email Invoice to Client (assuming client_email exists or using user relation if applicable)
        // For now, let's send to a placeholder or the agent as a test if client email isn't directly linked to a User model
        // Assuming we might have a user linked to the transaction for the buyer/renter
        // $transaction->user -> but we don't have 'user_id' in transaction table explicitly yet except agent_id
        // Dispatch Job for invoice
        if ($transaction->agent) {
          \App\Jobs\GenerateTransactionInvoice::dispatch($transaction);
        }
      }

      return $transaction;
    });
  }

  public function deleteTransaction($id)
  {
    return $this->transactionRepository->delete($id);
  }

  protected function updatePropertyStatus($propertyId, $status)
  {
    $property = Property::find($propertyId);
    if ($property) {
      $property->status = $status; // Assuming 'status' column exists on properties or we need to add it
      $property->save();
    }
  }
}
