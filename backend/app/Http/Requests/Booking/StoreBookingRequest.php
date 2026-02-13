<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => ['required', 'exists:properties,id'],
            'booking_date' => ['required', 'date', 'after:today'],
            'booking_time' => ['required', 'date_format:H:i'],
            'message' => ['nullable', 'string', 'max:500'],
        ];
    }
}
