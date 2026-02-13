<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $agentId = $this->route('id');

        return [
            'user_id' => ['sometimes', 'exists:users,id', Rule::unique('agents')->ignore($agentId)],
            'specialization' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'license_number' => ['nullable', 'string', 'max:100', Rule::unique('agents')->ignore($agentId)],
            'bio' => ['nullable', 'string', 'max:1000'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:50'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'total_sales' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
