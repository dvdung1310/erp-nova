<?php

namespace App\Http\Resources\Api\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvRecruitTargetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'target_id' => $this->target_id,
            'target_position' => $this->target_position,
            'target_quantity' => $this->target_quantity,
            'target_amout' => $this->target_amout,
            'target_start_date' => $this->target_start_date,
            'target_end_date' => $this->target_end_date,
            'department_id' => $this->department_id,
            'target_status' => $this->target_status,
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
            'department_name' => $this->department_name, 
        ];
    }
}
