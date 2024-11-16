<?php

namespace App\Http\Resources\Api\Nvt;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvtStudentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'student_id' => $this->student_id,
            'student_name' => $this->student_name,
            'customer_phone' => $this->customer_phone,
            'student_birthday' => $this->student_birthday,
            'parent_id' => $this->parent_id,
            'student_status' => $this->student_status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'name' => $this->name,
        ];
    }
}
