<?php

namespace App\Http\Resources\Api\Aai;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AaiProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_unit' => $this->product_unit,
            'product_input_price' => $this->product_input_price,
            'product_output_price' => $this->product_output_price,
            'product_input_quantity' => $this->product_input_quantity,
            'product_quantity_remaining' => $this->product_quantity_remaining,
            'suppliers_id' => $this->suppliers_id,
            'product_date_manufacture' => $this->product_date_manufacture,
            'product_shelf_life' => $this->product_shelf_life,
            'product_input_date' => $this->product_input_date,
            'suppliers_name' => $this->suppliers_name,
            'created_at' => $this->created_at, 
            'updated_at' => $this->updated_at, 
        ];
    }
}
