<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email or username is required.',
            'password.required' => 'Password is required.',
        ];
    }
}
