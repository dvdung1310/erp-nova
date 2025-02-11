<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AaiOrderModel extends Model
{
    protected $table='aai_order';
    protected $primaryKey = 'order_id';
    protected $fillable=[
        'customer_id','customer_name','customer_phone','customer_address','order_total','order_date' , 'payos_status' , 'sale_id'
    ];
}
