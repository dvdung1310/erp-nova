<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmRecruitCandidatesModel extends Model
{
    use HasFactory;
    protected $table='crm_recruit_candidates';
    protected $primaryKey = 'candidates_id';
    protected $fillable=[
        'candidates_name','candidates_phone','candidates_email','candidates_cv','candidates_feedback','news_id','candidates_status'
    ];
}
