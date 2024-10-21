<?php

namespace App\Http\Resources\Api\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvEmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'employee_id' => $this->employee_id,
            'employee_name' => $this->employee_name,
            'employee_email' => $this->employee_email,
            'employee_email_nova' => $this->employee_email_nova,
            'employee_phone' => $this->employee_phone,
            'employee_address' => $this->employee_address, 
            'employee_identity' => $this->employee_identity, 
            'employee_bank_number' => $this->employee_bank_number, 
            'department_id' => $this->department_id, 
            'team_id' => $this->team_id, 
            'level_id' => $this->level_id, 
            'employee_status' => $this->employee_status, 
            'account_id' => $this->account_id, 
            'department_name' => $this->department_name, 
            'team_name' => $this->team_name, 
            'level_name' => $this->level_name, 
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
            
        ];
    }
}
