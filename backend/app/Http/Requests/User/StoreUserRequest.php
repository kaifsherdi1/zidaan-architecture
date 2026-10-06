<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role hierarchy is enforced in UserController
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email', 'max:255'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'role_id' => ['required_without:role', 'exists:roles,id'],
            'role' => ['required_without:role_id', 'string', 'exists:roles,slug'],
            'is_active' => ['boolean'],
        ];
    }
}
