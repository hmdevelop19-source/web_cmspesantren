<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function __construct($resource)
    {
        parent::__construct($resource);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'cover_image' => $this->cover_image,
            'cover_image_id' => $this->cover_image_id,
            'cover_image_obj' => $this->whenLoaded('coverImage'),
            'status' => $this->status,
            'excerpt' => $this->excerpt,
            'category' => $this->whenLoaded('category'),
            'user' => $this->whenLoaded('user'),
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
