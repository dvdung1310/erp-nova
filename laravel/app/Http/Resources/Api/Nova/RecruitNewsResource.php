<?php

namespace App\Http\Resources\Api\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecruitNewsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'news_id' => $this->news_id,
            'news_title' => $this->news_title,
            'news_content' => $this->news_content,
            'news_salary' => $this->news_salary,
            'target_id' => $this->target_id,
            'news_start_date' => $this->news_start_date,
            'news_end_date' => $this->news_end_date, 
            'news_status' => $this->news_status, 
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
        ];
    }
}
