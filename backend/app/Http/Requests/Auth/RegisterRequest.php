<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalise the phone number before validation so uniqueness is reliable.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge([
                'phone' => preg_replace('/[^\d+]/', '', (string) $this->input('phone')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            // One of email / phone is required; both are validated when present.
            'email' => ['required_without:phone', 'nullable', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'phone' => ['required_without:email', 'nullable', 'string', 'regex:/^\+?\d{10,15}$/', 'unique:users,phone'],

            // 8-15 chars, at least one uppercase letter, one digit and one special character.
            'password' => [
                'required',
                'string',
                'min:8',
                'max:15',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'email.required_without' => 'Enter an email address or a phone number',
            'email.email' => 'Enter a valid email address (e.g. name@example.com)',
            'email.unique' => 'This email is already registered',
            'phone.required_without' => 'Enter a phone number or an email address',
            'phone.regex' => 'Enter a valid phone number, e.g. +919876543210',
            'phone.unique' => 'This phone number is already registered',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'password.max' => 'Password must be no more than 15 characters',
            'password.confirmed' => 'Passwords do not match',
            'password.regex' => 'Use one uppercase letter, one number and one special character (e.g. @, #, !)',
        ];
    }
}
