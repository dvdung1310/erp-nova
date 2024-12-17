<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AaiAgencyModel extends Model
{
    protected $table='aai_agency';
    protected $fillable=[
        'agency_id','agency_name','agency_phone','agency_address','agency_level',
        'agency_discount'
    ];
}
