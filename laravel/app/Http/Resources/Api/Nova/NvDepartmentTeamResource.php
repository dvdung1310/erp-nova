<?php

namespace App\Http\Resources\Api\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvDepartmentTeamResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'team_id' => $this->team_id,
            'team_name' => $this->team_name,
            'department_id' => $this->department_id,
            'team_status' => $this->team_status,
            'department_name' => $this->department_name,
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
        ];
    }
}
