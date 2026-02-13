<?php

namespace App\Http\Requests;

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
      'title' => 'required|string|max:255',
      'description' => 'required|string',
      'type' => 'required|in:sale,rent',
      'status' => 'required|in:available,sold,rented,pending',
      'price' => 'required|numeric|min:0',
      'bedrooms' => 'required|integer|min:0',
      'bathrooms' => 'required|integer|min:0',
      'garages' => 'nullable|integer|min:0',
      'area' => 'required|numeric|min:0',
      'address' => 'required|string|max:255',
      'city' => 'required|string|max:100',
      'state' => 'required|string|max:100',
      'country' => 'required|string|max:100',
      'zip_code' => 'nullable|string|max:20',
      'latitude' => 'nullable|numeric|between:-90,90',
      'longitude' => 'nullable|numeric|between:-180,180',
      'features' => 'nullable|array',
      'images' => 'nullable|array',
      'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048'
    ];
  }
}
