<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AaiCostModel extends Model
{
    protected $table='aai_cost';
    protected $primaryKey = 'cost_id';
    protected $fillable=[
        'cost_name','cost_total','cost_date','cost_description'
    ];
}
