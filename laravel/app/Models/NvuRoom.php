<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class NvuRoom extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'address', 'color', 'infor', 'status'];

    public function bookings()
    {
        return $this->hasMany(NvuRoomBooking::class, 'room_id');
    }
}
