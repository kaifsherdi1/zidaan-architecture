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
            
            // Agent information (if user is an agent)
            'agent' => $this->when($this->agent, function () {
                return [
                    'id' => $this->agent->id,
                    'specialization' => $this->agent->specialization,
                    'experience_years' => $this->agent->experience_years,
                    'total_sales' => $this->agent->total_sales,
                    'rating' => $this->agent->rating,
                ];
            }),
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
