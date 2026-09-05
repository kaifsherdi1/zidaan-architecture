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
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'visit_date' => ['required', 'date', 'after:today', 'before:+90 days'],
            'visit_time' => ['required', 'date_format:H:i'],
            'message' => ['nullable', 'string', 'max:800'],
        ];
    }

    public function messages(): array
    {
        return [
            'visit_date.after' => 'Choose a date in the future.',
            'visit_date.before' => 'Please pick a date within the next 90 days.',
            'visit_time.date_format' => 'Enter a time like 14:30.',
        ];
    }
}
