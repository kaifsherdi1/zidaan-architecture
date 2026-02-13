<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'transaction_date' => ['sometimes', 'date'],
            'commission_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:pending,completed,cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
