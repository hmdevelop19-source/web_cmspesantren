<?php
/*
 * This file is part of the Pesantren CMS.
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'content' => 'required',
            'cover_image' => 'nullable|string',
            'cover_image_id' => 'nullable|exists:media,id',
            'status' => 'required|in:published,draft,pending',
            'excerpt' => 'nullable|string|max:500',
        ];
    }
}
