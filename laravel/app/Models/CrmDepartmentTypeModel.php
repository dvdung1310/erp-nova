<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmDepartmentTypeModel extends Model
{
    use HasFactory;
    protected $table='crm_department_type';
    protected $primaryKey = 'type_id';
    protected $fillable=[
        'type_name','type_status'
    ];
}
