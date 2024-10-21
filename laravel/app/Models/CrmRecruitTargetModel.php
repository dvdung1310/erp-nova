<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmRecruitTargetModel extends Model
{
    use HasFactory;
    protected $table='crm_recruit_target';
    protected $primaryKey = 'target_id';
    protected $fillable=[
        'target_position','target_amout','target_start_date',
        'target_end_date','department_id','target_status'
    ];
}
