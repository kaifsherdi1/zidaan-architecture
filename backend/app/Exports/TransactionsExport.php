<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping
{
  protected $filters;

  public function __construct(array $filters = [])
  {
    $this->filters = $filters;
  }

  public function collection()
  {
    $query = Transaction::with(['property', 'agent']);

    if (isAuthenticatedAgent()) {
      $query->where('agent_id', auth()->id());
    }

    if (isset($this->filters['status'])) {
      $query->where('status', $this->filters['status']);
    }

    return $query->get();
  }

  public function headings(): array
  {
    return [
      'ID',
      'Property',
      'Agent',
      'Client Name',
      'Actual Price',
      'Commission',
      'Transaction Date',
      'Status',
      'Payment Method',
    ];
  }

  public function map($transaction): array
  {
    return [
      $transaction->id,
      $transaction->property ? $transaction->property->title : 'N/A',
      $transaction->agent ? $transaction->agent->name : 'N/A',
      $transaction->client_name,
      number_format($transaction->actual_price, 2),
      number_format($transaction->commission_amount, 2),
      $transaction->transaction_date,
      ucfirst($transaction->status),
      ucfirst($transaction->payment_method),
    ];
  }
}

function isAuthenticatedAgent()
{
  return auth()->user() && auth()->user()->role === 'agent';
}
