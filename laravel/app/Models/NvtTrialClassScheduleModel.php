<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NvtTrialClassScheduleModel extends Model
{
    protected $table='nvt_trial_class_schedule';
    protected $primaryKey = 'trial_id';
    protected $fillable=[
        'trial_subject','student_id','teacher_id','trial_date','status_id'
    ];
}
