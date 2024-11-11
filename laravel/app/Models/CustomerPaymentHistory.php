<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class CustomerPaymentHistory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'money', 'date', 'image', 'status'];

    public function bookingHistories()
    {
        return $this->hasMany(NvuBookingHistory::class, 'payment_history_id');
    }
}
