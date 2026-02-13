<?php

namespace App\Exports;

use App\Models\Booking;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BookingsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Booking::with(['property', 'user', 'agent']);

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
            'User',
            'Booking Date',
            'Booking Time',
            'Status',
            'Message',
            'Notes',
            'Created At',
        ];
    }

    public function map($booking): array
    {
        return [
            $booking->id,
            $booking->property ? $booking->property->title : 'N/A',
            $booking->user ? $booking->user->name : 'N/A',
            $booking->booking_date,
            $booking->booking_time,
            ucfirst($booking->status),
            $booking->message,
            $booking->notes,
            $booking->created_at->format('Y-m-d'),
        ];
    }
}

function isAuthenticatedAgent()
{
    return auth()->user() && auth()->user()->role === 'agent';
}
