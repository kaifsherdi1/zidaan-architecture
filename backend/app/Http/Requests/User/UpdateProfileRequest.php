<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('users')->ignore($userId)],
            // Changing the password requires the current one, so a stolen
            // session token alone cannot take over the account.
            'current_password' => ['required_with:password', 'current_password:sanctum'],
            'password' => [
                'sometimes', 'nullable', 'string', 'min:8', 'max:15', 'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.current_password' => 'Your current password is incorrect.',
            'current_password.required_with' => 'Enter your current password to set a new one.',
            'password.regex' => 'Use one uppercase letter, one number and one special character.',
        ];
    }

    public function after(): array
    {
        return [function ($validator) {
            // Accounts sign in with email or phone — never let both be cleared.
            $user = $this->user();
            $email = $this->has('email') ? $this->input('email') : $user->email;
            $phone = $this->has('phone') ? $this->input('phone') : $user->phone;
            if (blank($email) && blank($phone)) {
                $validator->errors()->add('email', 'Keep at least an email address or a phone number on your account.');
            }
        }];
    }
}
