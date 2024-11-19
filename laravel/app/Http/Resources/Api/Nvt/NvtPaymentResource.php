<?php

namespace App\Http\Resources\Api\Nvt;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvtPaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id ,
            'customer_id' => $this->customer_id,
            'money' => $this->money,
            'date' => $this->date,
            'image' => $this->image,
            'sale_id' => $this->sale_id,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'name' => $this->name,
        ];
    }
}
