<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmDepartmentTeamModel extends Model
{
    use HasFactory;
    protected $table='crm_department_team';
    protected $primaryKey = 'team_id';
    protected $fillable=[
        'team_name','department_id','team_status'
    ];
}
