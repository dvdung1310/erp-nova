<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvuBookingHistory extends Model
{
    use HasFactory;
    protected $table = 'nvu_booking_history';

    protected $fillable = ['room_booking_id', 'payment_history_id'];

    public function roomBooking()
    {
        return $this->belongsTo(NvuRoomBooking::class, 'room_booking_id');
    }

    public function paymentHistory()
    {
        return $this->belongsTo(CustomerPaymentHistory::class, 'payment_history_id');
    }
}
