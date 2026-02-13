<?php

namespace App\Jobs;

use App\Mail\TransactionInvoice;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class GenerateTransactionInvoice implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  protected $transaction;

  public function __construct(Transaction $transaction)
  {
    $this->transaction = $transaction;
  }

  public function handle()
  {
    if ($this->transaction->agent) {
      Mail::to($this->transaction->agent)->send(new TransactionInvoice($this->transaction));
    }
  }
}
