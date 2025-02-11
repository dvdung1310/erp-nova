<?php

namespace App\Http\Resources\Api\Nvu;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvuCustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_date_receipt' => $this->customer_date_receipt,
            'customer_source' => $this->customer_source,
            'customer_description' => $this->customer_description,
            'customer_sale' => $this->customer_sale,
            'customer_status' => $this->customer_status,
            'source_name' => $this->source_name, // Tên nguồn từ bảng nvu_data_source
            'status_name' => $this->status_name, // Trạng thái từ bảng nvu_status_customer
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
