<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'is_active' => $this->is_active,
            'email_verified_at' => $this->email_verified_at,
            
            // Role information
            'role' => $this->when($this->role, function () {
                return [
                    'id' => $this->role->id,
                    'name' => $this->role->name,
                    'slug' => $this->role->slug,
                ];
            }),
            
            // Agent profile (if user is an agent and one exists)
            'agent' => $this->when($this->relationLoaded('agent') && $this->agent, fn () => [
                'id' => $this->agent->id,
                'bio' => $this->agent->bio,
                'years_of_experience' => $this->agent->years_of_experience,
                'license_number' => $this->agent->license_number,
            ]),
            'listings_count' => $this->whenCounted('properties'),
            'properties' => PropertyResource::collection($this->whenLoaded('properties')),
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
