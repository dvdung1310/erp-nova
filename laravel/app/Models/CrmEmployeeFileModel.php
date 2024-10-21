<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmEmployeeFileModel extends Model
{
    use HasFactory;
    protected $table='crm_employee_file';
    protected $primaryKey = 'file_id';
    protected $fillable=[
        'file_name','file_discription','file_date','file','category_id','employee_id','file_status'
    ];
}
