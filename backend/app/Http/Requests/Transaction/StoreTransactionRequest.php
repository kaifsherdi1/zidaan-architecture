<?php

namespace App\Http\Requests\Transaction;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // agents are limited to their own listings in TransactionService
    }

    public function rules(): array
    {
        return [
            'property_id' => ['required', 'integer', Rule::exists('properties', 'id')->whereNull('deleted_at')],
            // Optional: defaults to the listing's agent. Must actually hold the agent role.
            'agent_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where(
                fn ($q) => $q->where('role_id', Role::where('slug', 'agent')->value('id'))
            )],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'client_name' => ['required', 'string', 'max:255'],
            'transaction_date' => ['required', 'date', 'before_or_equal:+1 year'],
            'amount' => ['required', 'numeric', 'min:1', 'max:9999999999999'],
            'status' => ['sometimes', 'in:pending,completed'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.exists' => 'That listing no longer exists.',
            'agent_id.exists' => 'Choose a user who holds the agent role.',
        ];
    }
}
