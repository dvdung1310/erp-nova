<?php

namespace App\Http\Resources\Api\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvEmployeeFileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'file_id' => $this->file_id,
            'file_name' => $this->file_name,
            'file_discription' => $this->file_discription,
            'file_date' => $this->file_date,
            'file' => $this->file,
            'category_id' => $this->category_id,
            'employee_id' => $this->employee_id,
            'file_status' => $this->file_status,
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
            'employee_name' => $this->employee_name, 
            'category_name' => $this->category_name, 
            
        ];
    }
}
