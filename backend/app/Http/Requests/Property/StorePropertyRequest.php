<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type' => ['required', 'in:sale,rent'],
            'status' => ['required', 'in:available,sold,rented,pending'],
            'price' => ['required', 'numeric', 'min:0'],

            // Location
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'zip_code' => ['required', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Property Details
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'area' => ['required', 'numeric', 'min:0'],
            'area_unit' => ['required', 'in:sqft,sqm'],
            'floors' => ['nullable', 'integer', 'min:1'],
            'year_built' => ['nullable', 'integer', 'min:1800', 'max:' . (date('Y') + 5)],
            'parking_spaces' => ['nullable', 'integer', 'min:0'],

            // Features
            'has_garage' => ['boolean'],
            'has_garden' => ['boolean'],
            'has_pool' => ['boolean'],
            'has_balcony' => ['boolean'],
            'has_elevator' => ['boolean'],
            'is_furnished' => ['boolean'],
            'has_ac' => ['boolean'],
            'has_heating' => ['boolean'],
            'has_security' => ['boolean'],
            'pet_friendly' => ['boolean'],

            // Agent
            'agent_id' => ['nullable', 'exists:agents,id'],

            // Media
            'featured_image' => ['nullable', 'string', 'max:500'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'virtual_tour_url' => ['nullable', 'url', 'max:500'],

            // SEO
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],

            // Additional
            'is_featured' => ['boolean'],

            // Images
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // 5MB max
        ];
    }
}
