<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmEmployeeLevelModel extends Model
{
    use HasFactory;
    protected $table='crm_employee_level';
    protected $primaryKey = 'level_id';
    protected $fillable=[
        'level_name','level_status'
    ];
}
