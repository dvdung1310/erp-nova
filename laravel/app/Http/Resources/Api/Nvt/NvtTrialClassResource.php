<?php

namespace App\Http\Resources\Api\Nvt;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvtTrialClassResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'trial_id' => $this->trial_id,
            'trial_subject' => $this->trial_subject,
            'student_id' => $this->trial_subject,
            'teacher_id' => $this->teacher_id,
            'trial_date' => $this->trial_date,
            'status_id' => $this->status_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'student_name' => $this->student_name,
            'teacher_id' => $this->name,
            'status_name' => $this->status_name,
        ];
    }
}
