<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * One plain transactional email: a heading, a few lines and an optional button.
 * Queued, so a slow or failing mail provider never blocks an API request.
 */
class StudioNotice extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [60, 300];

    /**
     * @param  string[]  $lines
     */
    public function __construct(
        public string $heading,
        public array $lines,
        public ?string $actionUrl = null,
        public ?string $actionText = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->heading);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.notice');
    }
}
