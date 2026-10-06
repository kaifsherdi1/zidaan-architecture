<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\ActivityLog;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use App\Repositories\TransactionRepository;
use Illuminate\Support\Facades\DB;

/**
 * Sales / lettings ledger. A transaction records an offline deal against a
 * listing; completing it closes the listing (sold / rented).
 */
class TransactionService
{
  /** pending → completed | cancelled; completed → cancelled (a deal fell through). */
  public const TRANSITIONS = [
    'pending' => ['completed', 'cancelled'],
    'completed' => ['cancelled'],
    'cancelled' => [],
  ];

  public function __construct(
    protected TransactionRepository $transactionRepository,
    protected Notifier $notifier,
  ) {
  }

  public function getAllTransactions(array $filters, int $perPage)
  {
    return $this->transactionRepository->getAll($filters, $perPage);
  }

  public function getAgentTransactions(int $agentId, int $perPage = 15)
  {
    return $this->transactionRepository->getByAgent($agentId, $perPage);
  }

  public function getById($id)
  {
    return $this->transactionRepository->getById($id);
  }

  public function createTransaction(array $data, User $actor): Transaction
  {
    $transaction = DB::transaction(function () use ($data, $actor) {
      $property = Property::lockForUpdate()->find($data['property_id']);
      if (! $property) {
        throw new BusinessRuleException('That listing no longer exists.');
      }

      if ($actor->hasRole('agent')) {
        if ($property->agent_id !== $actor->id) {
          abort(403, 'You can only record transactions for your own listings.');
        }
        $data['agent_id'] = $actor->id;
        $data['status'] = 'pending'; // agents propose; admins/managers confirm
      } else {
        $data['agent_id'] = $data['agent_id'] ?? $property->agent_id;
      }

      if (in_array($property->status, ['sold', 'rented'], true) || $this->hasCompletedDeal($property->id)) {
        throw new BusinessRuleException("This property is already {$property->status}. Cancel the existing completed transaction first if the deal fell through.");
      }

      $transaction = $this->transactionRepository->create($data);

      if ($transaction->status === 'completed') {
        $this->closeListing($property);
      }

      return $transaction;
    });

    $transaction->load(['property', 'agent', 'user']);
    ActivityLog::record('transaction.created', $transaction, sprintf(
      'Recorded %s transaction of ₹%s for "%s"',
      $transaction->status,
      number_format((float) $transaction->amount, 2),
      $transaction->property->title,
    ));

    if ($transaction->agent_id !== $actor->id) {
      $this->notifier->send(
        $transaction->agent_id,
        'transaction.created',
        'Transaction recorded',
        sprintf('A %s transaction of ₹%s was recorded for "%s".', $transaction->status, number_format((float) $transaction->amount), $transaction->property->title),
        ['transaction_id' => $transaction->id],
      );
    } else {
      // An agent logged a deal — staff need to confirm it.
      $this->notifier->staff(
        'transaction.created',
        'Transaction awaiting confirmation',
        sprintf('%s recorded a pending transaction of ₹%s for "%s".', $actor->name, number_format((float) $transaction->amount), $transaction->property->title),
        ['transaction_id' => $transaction->id],
      );
    }

    return $transaction;
  }

  public function updateTransaction(int $id, array $data): Transaction
  {
    $transaction = DB::transaction(function () use ($id, $data) {
      $transaction = Transaction::lockForUpdate()->findOrFail($id);
      $from = $transaction->status;
      $to = $data['status'] ?? $from;

      if ($to !== $from && ! in_array($to, self::TRANSITIONS[$from] ?? [], true)) {
        throw new BusinessRuleException("A {$from} transaction cannot be changed to {$to}.");
      }
      // Once a deal is completed or cancelled its figures are frozen; only notes may change.
      if ($from !== 'pending' && array_intersect_key($data, array_flip(['amount', 'transaction_date']))) {
        throw new BusinessRuleException('The amount and date of a ' . $from . ' transaction cannot be edited.');
      }

      $property = Property::withTrashed()->lockForUpdate()->find($transaction->property_id);

      if ($to === 'completed' && $from !== 'completed') {
        if ($this->hasCompletedDeal($transaction->property_id, $transaction->id)) {
          throw new BusinessRuleException('This property already has a completed transaction.');
        }
        $this->closeListing($property);
      }
      if ($from === 'completed' && $to === 'cancelled' && ! $this->hasCompletedDeal($transaction->property_id, $transaction->id)) {
        // The deal fell through — put the listing back on the market.
        $property?->forceFill(['status' => 'available'])->save();
      }

      $transaction->update($data);

      return $transaction;
    });

    $transaction->load(['property', 'agent', 'user']);

    if (isset($data['status'])) {
      ActivityLog::record("transaction.{$data['status']}", $transaction, sprintf(
        'Marked transaction #%d (₹%s, "%s") as %s',
        $transaction->id,
        number_format((float) $transaction->amount, 2),
        $transaction->property->title,
        $data['status'],
      ));

      $this->notifier->send(
        $transaction->agent_id,
        'transaction.' . $data['status'],
        'Transaction ' . $data['status'],
        sprintf('The transaction for "%s" was marked %s.', $transaction->property->title, $data['status']),
        ['transaction_id' => $transaction->id],
      );
    } else {
      ActivityLog::record('transaction.updated', $transaction, "Edited transaction #{$transaction->id}", ['fields' => array_keys($data)]);
    }

    return $transaction;
  }

  public function deleteTransaction(int $id): void
  {
    $transaction = $this->transactionRepository->getById($id);

    if ($transaction->status === 'completed') {
      throw new BusinessRuleException('Completed transactions are part of the financial record and cannot be deleted. Cancel it instead.');
    }

    $transaction->delete();
    ActivityLog::record('transaction.deleted', null, sprintf(
      'Deleted %s transaction #%d (₹%s, "%s")',
      $transaction->status,
      $transaction->id,
      number_format((float) $transaction->amount, 2),
      optional($transaction->property)->title,
    ));
  }

  private function hasCompletedDeal(int $propertyId, ?int $exceptId = null): bool
  {
    return Transaction::where('property_id', $propertyId)
      ->where('status', 'completed')
      ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
      ->exists();
  }

  private function closeListing(?Property $property): void
  {
    $property?->forceFill(['status' => $property->type === 'rent' ? 'rented' : 'sold'])->save();
  }
}
