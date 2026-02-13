<?php

namespace App\Jobs;

use App\Mail\BookingConfirmation;
use App\Mail\NewBookingRequest;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class ProcessBookingEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $booking;
    protected $type;

    public function __construct(Booking $booking, string $type)
    {
        $this->booking = $booking;
        $this->type = $type;
    }

    public function handle()
    {
        if ($this->type === 'new_request' && $this->booking->property->agent) {
            Mail::to($this->booking->property->agent)->send(new NewBookingRequest($this->booking));
        }
        elseif ($this->type === 'confirmation' && $this->booking->user) {
            Mail::to($this->booking->user)->send(new BookingConfirmation($this->booking));
        }
    }
}
