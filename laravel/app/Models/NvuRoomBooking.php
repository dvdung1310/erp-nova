<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class NvuRoomBooking extends Model
{
    use HasFactory;

    protected $table = 'nvu_room_booking';

    protected $fillable = ['start_time', 'end_time', 'room_id', 'customer_id', 'sale_id'];

    public function room()
    {
        return $this->belongsTo(NvuRoom::class, 'room_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function sale()
    {
        return $this->belongsTo(User::class, 'sale_id');
    }

    public function bookingHistory()
    {
        return $this->hasMany(NvuBookingHistory::class, 'room_booking_id');
    }
}
