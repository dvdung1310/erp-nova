<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AaiOrderDetailModel extends Model
{
    protected $table='aai_order_detail';
    protected $primaryKey = 'detail_id';
    protected $fillable=[
        'order_id','product_id','product_quantity'
    ];
}
