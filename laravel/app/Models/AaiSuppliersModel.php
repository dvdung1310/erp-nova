<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AaiSuppliersModel extends Model
{
    protected $table='aai_suppliers';
    protected $fillable=[
        'suppliers_id','suppliers_name','suppliers_mst','suppliers_phone','suppliers_address'
    ];
}
