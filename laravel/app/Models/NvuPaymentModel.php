<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvuPaymentModel extends Model
{
    use HasFactory;
    protected $table='nvu_payment';
    protected $primaryKey = 'payment_id';
    protected $fillable=[
        'payment_customer','payment_date','payment_amount','payment_image','payment_option_money','payment_description','payment_status'
    ];
}
