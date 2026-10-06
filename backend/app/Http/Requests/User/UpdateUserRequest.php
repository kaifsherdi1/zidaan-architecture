<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role hierarchy is enforced in UserController
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($userId)],
            'role' => ['sometimes', 'string', 'exists:roles,slug'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
