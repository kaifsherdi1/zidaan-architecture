<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'specialization' => $this->specialization,
            'experience_years' => $this->experience_years,
            'license_number' => $this->license_number,
            'bio' => $this->bio,
            'languages' => $this->languages,
            'commission_rate' => $this->commission_rate,

            // Performance metrics
            'performance' => [
                'total_sales' => $this->total_sales,
                'rating' => $this->rating,
                'properties_count' => $this->properties->count() ?? 0,
            ],

            // User information
            'user' => $this->when($this->user, function () {
            return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                    'avatar' => $this->user->avatar ? asset('storage/' . $this->user->avatar) : null,
                ];
        }),

            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
