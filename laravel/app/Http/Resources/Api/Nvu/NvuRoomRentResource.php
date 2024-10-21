<?php

namespace App\Http\Resources\Api\Nvu;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NvuRoomRentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'rent_id' => $this->rent_id,
            'rent_room' => $this->rent_room,
            'rent_customer' => $this->rent_customer,
            'rent_start_time' => $this->rent_start_time,
            'rent_end_time' => $this->rent_end_time,
            'rent_status' => $this->rent_status,
            'room_name' => $this->room_name,
            'customer_name' => $this->customer_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
