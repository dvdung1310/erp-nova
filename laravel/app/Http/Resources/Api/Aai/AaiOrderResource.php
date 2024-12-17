<?php

namespace App\Http\Resources\Api\Aai;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AaiOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'order_id' => $this->order_id,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_address' => $this->customer_address,
            'order_total' => $this->order_total,
            'order_date' => $this->order_date,
            'agency_name' => $this->agency_name,
            'agency_phone' => $this->agency_phone,
            'agency_address' => $this->agency_address,
            'agency_level' => $this->agency_level,
            'agency_discount' => $this->agency_discount,
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
        ];
    }
}
