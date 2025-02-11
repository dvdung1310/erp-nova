<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AaiOrderModel extends Model
{
    protected $table='aai_order';
    protected $primaryKey = 'order_id';
    protected $fillable=[
        'customer_id','customer_name','customer_phone','customer_address','customer_description','order_total','order_date' , 'payos_status' ,'delivery_status', 'sale_id','payment_img','type_payment'
    ];
}
