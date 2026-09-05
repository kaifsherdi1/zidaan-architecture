<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visit_date' => optional($this->visit_date)->toDateString(),
            'visit_time' => $this->visit_time ? Carbon::parse($this->visit_time)->format('H:i') : null,
            'formatted_date' => $this->visit_date ? Carbon::parse($this->visit_date)->format('D, d M Y') : null,
            'formatted_time' => $this->visit_time ? Carbon::parse($this->visit_time)->format('h:i A') : null,
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            'message' => $this->user_message,
            'agent_notes' => $this->when(
                in_array(optional($request->user())->id, [$this->agent_id]) || optional($request->user()?->role)->slug === 'admin',
                $this->agent_notes
            ),
            'rejection_reason' => $this->rejection_reason,

            'property' => $this->whenLoaded('property', fn () => [
                'id' => $this->property->id,
                'title' => $this->property->title,
                'slug' => $this->property->slug,
                'city' => $this->property->city,
                'state' => $this->property->state,
                'price' => $this->property->price,
                'image' => optional($this->property->images->first())->image_path
                    ? '/storage/' . $this->property->images->first()->image_path
                    : null,
            ]),

            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ]),

            'agent' => $this->whenLoaded('agent', fn () => $this->agent ? [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
                'phone' => $this->agent->phone,
                'email' => $this->agent->email,
            ] : null),

            'created_at' => $this->created_at,
        ];
    }
}
