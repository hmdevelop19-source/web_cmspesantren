<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $this->route('user')->id,
            'password' => 'nullable|min:8',
            'role' => 'required|in:admin,editor,author',
            'status' => 'required|in:active,inactive',
        ];
    }
}
