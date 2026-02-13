<?php

namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionInvoice extends Mailable
{
    use Queueable, SerializesModels;

    public $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function build()
    {
        $pdf = Pdf::loadView('pdf.invoice', ['transaction' => $this->transaction]);

        return $this->subject('Transaction Invoice')
            ->view('emails.transaction.invoice')
            ->attachData($pdf->output(), 'invoice.pdf', [
            'mime' => 'application/pdf',
        ]);
    }
}
