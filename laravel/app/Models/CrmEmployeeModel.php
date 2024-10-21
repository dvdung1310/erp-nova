<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmEmployeeModel extends Model
{
    use HasFactory;
    protected $table='crm_employee';
    protected $primaryKey = 'employee_id';
    protected $fillable=[
        'employee_name','employee_email','employee_email_nova','employee_phone','employee_address','employee_identity',
        'employee_bank_number','department_id','team_id','level_id','employee_status','account_id'
    ];
}
