<?php

namespace App\Http\Resources\Api\Aai;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AaiOrderDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'detail_id' => $this->detail_id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_quantity' => $this->product_quantity,
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
        ];
    }
}
