<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', 'unique:agents,user_id'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'license_number' => ['nullable', 'string', 'max:100', 'unique:agents,license_number'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:50'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
