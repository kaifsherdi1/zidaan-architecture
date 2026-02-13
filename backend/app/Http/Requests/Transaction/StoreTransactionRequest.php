<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'agent_id' => 'required|exists:users,id', // Agents are users with role 'agent'
            'client_name' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,completed,cancelled',
            'notes' => 'nullable|string'
        ];
    }
}
