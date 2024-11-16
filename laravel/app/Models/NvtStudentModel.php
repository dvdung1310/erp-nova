<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvtStudentModel extends Model
{
    use HasFactory;
    protected $table='nvt_student';
    protected $primaryKey = 'student_id';
    protected $fillable=[
        'student_name','student_birthday','parent_id','student_status','student_note','student_subject'
    ];
}
