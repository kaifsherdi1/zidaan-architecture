<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Booking;

class BookingNotification extends Notification
{
    use Queueable;

    public $booking;
    public $type; // 'created', 'approved', 'rejected'

    public function __construct(Booking $booking, $type)
    {
        $this->booking = $booking;
        $this->type = $type;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        $message = '';
        $link = '/bookings';

        switch ($this->type) {
            case 'created':
                $message = "New booking request for {$this->booking->property->title}";
                break;
            case 'approved':
                $message = "Your booking for {$this->booking->property->title} has been approved!";
                break;
            case 'rejected':
                $message = "Your booking for {$this->booking->property->title} was rejected.";
                break;
        }

        return [
            'title' => 'Booking Update',
            'message' => $message,
            'link' => $link,
            'booking_id' => $this->booking->id,
            'type' => $this->type
        ];
    }
}
