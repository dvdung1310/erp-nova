<?php

namespace App\Http\Resources\Api\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvEmployeeDayOffResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'off_id' => $this->off_id,
            'off_title' => $this->off_title,
            'off_content' => $this->off_content,
            'day_off_start' => $this->day_off_start,
            'day_off_end' => $this->day_off_end,
            'manager_id' => $this->manager_id, 
            'employee_id' => $this->employee_id, 
            'off_status' => $this->off_status, 
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
            'employee_name' => $this->employee_name, 
            'department_name' => $this->department_name, 
        ];
    }
}
