<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_date' => $this->booking_date,
            'booking_time' => $this->booking_time, // Keep original H:i:s format or format here
            'formatted_date' => \Carbon\Carbon::parse($this->booking_date)->format('M d, Y'),
            'formatted_time' => \Carbon\Carbon::parse($this->booking_time)->format('h:i A'),
            'status' => $this->status,
            'message' => $this->message,
            'notes' => $this->notes,

            // Property snippet
            'property' => $this->when($this->property, function () {
            return [
                    'id' => $this->property->id,
                    'title' => $this->property->title,
                    'location' => [
                        'address' => $this->property->address,
                        'city' => $this->property->city,
                    ],
                    'image' => $this->property->images->first() ? asset('storage/' . $this->property->images->first()->image_path) : null,
                    'price' => $this->property->price,
                ];
        }),

            // User snippet
            'user' => $this->when($this->user, function () {
            return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                    'avatar' => $this->user->avatar ? asset('storage/' . $this->user->avatar) : null,
                ];
        }),

            // Agent snippet
            'agent' => $this->when($this->agent, function () {
            return [
                    'id' => $this->agent->id,
                    'name' => $this->agent->user->name ?? 'Unknown Agent',
                    'phone' => $this->agent->user->phone ?? null,
                ];
        }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
