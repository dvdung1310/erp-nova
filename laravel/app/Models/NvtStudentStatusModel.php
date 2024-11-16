<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NvtStudentStatusModel extends Model
{
    protected $table='nvt_student_status';
    protected $primaryKey = 'status_id';
    protected $fillable=[
        'status_name','status_type','status'
    ];
}
