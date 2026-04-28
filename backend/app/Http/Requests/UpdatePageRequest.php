<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageRequest extends FormRequest
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
            'status' => 'required|in:published,draft',
            'slug' => 'nullable|string|unique:pages,slug,' . $this->route('page')->id,
            'image' => 'nullable|image|max:2048',
            'image_id' => 'nullable|exists:media,id',
            'image_url' => 'nullable|string',
        ];
    }
}
