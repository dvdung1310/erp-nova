<?php

namespace App\Http\Resources\Api\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvRecruitCandidatesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'candidates_id' => $this->candidates_id ,
            'candidates_name' => $this->candidates_name,
            'candidates_phone' => $this->candidates_phone,
            'candidates_email' => $this->candidates_email,
            'candidates_cv' => $this->candidates_cv,
            'candidates_feedback' => $this->candidates_feedback,
            'news_id' => $this->news_id, 
            'candidates_status' => $this->candidates_status, 
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
            'news_title' => $this->news_title, 
        ];
    }
}
