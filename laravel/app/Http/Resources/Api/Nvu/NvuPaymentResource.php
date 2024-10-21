<?php

namespace App\Http\Resources\Api\Nvu;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvuPaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'payment_id' => $this->payment_id,
            'payment_customer' => $this->payment_customer,
            'payment_date' => $this->payment_date,
            'payment_amount' => $this->payment_amount,
            'payment_image' => $this->payment_image,
            'payment_option_money' => $this->payment_option_money,
            'payment_description' => $this->payment_description,
            'payment_status' => $this->payment_status,
            'customer_name' => $this->customer_name, 
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
