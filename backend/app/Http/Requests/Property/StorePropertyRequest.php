<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'category' => ['required', Rule::in(['apartment', 'shop', 'single_floor', 'duplex', 'double_floor', 'third_floor'])],
            'status' => ['required', 'in:available,sold,rented,pending'],
            'price' => ['required', 'numeric', 'min:0'],

            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['required', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'garages' => ['nullable', 'integer', 'min:0'],
            'area' => ['required', 'numeric', 'min:0'],

            // The agent this listing belongs to — required, must actually hold the agent role.
            'agent_id' => ['required', 'integer', Rule::exists('users', 'id')->where(
                fn ($q) => $q->where('role_id', \App\Models\Role::where('slug', 'agent')->value('id'))
            )],

            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:100'],
            'is_featured' => ['nullable', 'boolean'],

            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'agent_id.required' => 'Choose which agent this listing belongs to.',
            'agent_id.exists' => 'That agent could not be found.',
            'category.required' => 'Choose a property type.',
        ];
    }
}
