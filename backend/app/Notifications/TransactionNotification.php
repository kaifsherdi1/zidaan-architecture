<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Transaction;

class TransactionNotification extends Notification
{
  use Queueable;

  public $transaction;
  public $type; // 'created', 'completed', 'cancelled'

  public function __construct(Transaction $transaction, $type)
  {
    $this->transaction = $transaction;
    $this->type = $type;
  }

  public function via($notifiable)
  {
    return ['database'];
  }

  public function toDatabase($notifiable)
  {
    $message = '';
    $link = '/transactions';

    switch ($this->type) {
      case 'created':
        $message = "New transaction reported by {$this->transaction->agent->name}";
        break;
      case 'completed':
        $message = "Transaction #{$this->transaction->id} for {$this->transaction->property->title} approved!";
        break;
      case 'cancelled':
        $message = "Transaction #{$this->transaction->id} wa cancelled.";
        break;
    }

    return [
      'message' => $message,
      'link' => $link,
      'transaction_id' => $this->transaction->id,
      'type' => $this->type
    ];
  }
}
