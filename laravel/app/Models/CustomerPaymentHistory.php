<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CustomerPaymentHistory extends Model
{
    use HasFactory;
    protected $table = 'customer_payment_history';
    protected $fillable = ['name','customer_id', 'money', 'date', 'image', 'sale_id', 'status' , 'type'];


    public function bookingHistories()
    {
        return $this->hasMany(NvuBookingHistory::class, 'payment_history_id');
    }

    public function sales()
    {
        return $this->hasMany(CustomerSale::class);
    }
}
