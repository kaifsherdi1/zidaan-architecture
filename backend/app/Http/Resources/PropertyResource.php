<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'formatted_price' => number_format($this->price),
            'type' => $this->type,
            'status' => $this->status,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'garages' => $this->garages,
            'area' => $this->area,
            'location' => [
                'address' => $this->address,
                'city' => $this->city,
                'state' => $this->state,
                'country' => $this->country,
                'zip_code' => $this->zip_code,
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
            'features' => $this->features,
            'is_featured' => $this->is_featured,
            'agent' => new UserResource($this->whenLoaded('agent')),
            'main_image' => $this->mainImage ?Storage::url($this->mainImage->image_path) : null,
            'images' => $this->images->map(function ($image) {
            return [
                    'id' => $image->id,
                    'url' => Storage::url($image->image_path),
                    'is_main' => $image->is_main
                ];
        }),
            'created_at' => $this->created_at?->diffForHumans(),
        ];
    }
}
