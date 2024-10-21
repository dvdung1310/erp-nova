<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmEmployeeDayOffModel extends Model
{
    use HasFactory;
    protected $table='crm_employee_day_off';
    protected $primaryKey = 'off_id';
    protected $fillable=[
        'off_title','off_content','day_off_start','day_off_end','manager_id','employee_id','off_status'
    ];
}
