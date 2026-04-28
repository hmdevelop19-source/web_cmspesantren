<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgendaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required',
            'location' => 'nullable|string|max:255',
            'event_date' => 'required|date',
            'status' => 'required|in:published,draft',
        ];
    }
}
