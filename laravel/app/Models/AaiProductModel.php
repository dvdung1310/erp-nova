<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AaiProductModel extends Model
{
    protected $table='aai_product';
    protected $fillable=[
        'product_id','product_name','product_unit','product_input_price','product_output_price','product_input_quantity','product_quantity_remaining',
        'suppliers_id','product_date_manufacture','product_shelf_life','product_input_date'
    ];
}
