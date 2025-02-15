<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmDepartmentModel extends Model
{
    use HasFactory;
    protected $table='crm_department';
    protected $primaryKey = 'department_id';
    protected $fillable=[
        'department_name','department_status'
    ];
}
