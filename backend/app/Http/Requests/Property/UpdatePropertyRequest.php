<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'type' => ['sometimes', 'in:sale,rent'],
            'category' => ['sometimes', Rule::in(['apartment', 'shop', 'single_floor', 'duplex', 'double_floor', 'third_floor'])],
            'status' => ['sometimes', 'in:available,sold,rented,pending'],
            'price' => ['sometimes', 'numeric', 'min:0'],

            'address' => ['sometimes', 'string', 'max:500'],
            'city' => ['sometimes', 'string', 'max:100'],
            'state' => ['sometimes', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['sometimes', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            'bedrooms' => ['sometimes', 'integer', 'min:0'],
            'bathrooms' => ['sometimes', 'integer', 'min:0'],
            'garages' => ['nullable', 'integer', 'min:0'],
            'area' => ['sometimes', 'numeric', 'min:0'],

            'agent_id' => ['sometimes', 'integer', Rule::exists('users', 'id')->where(
                fn ($q) => $q->where('role_id', \App\Models\Role::where('slug', 'agent')->value('id'))
            )],

            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:100'],
            'is_featured' => ['nullable', 'boolean'],

            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }
}
