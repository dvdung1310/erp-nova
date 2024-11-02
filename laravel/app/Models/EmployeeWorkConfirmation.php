<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeWorkConfirmation extends Model
{
    use HasFactory;

    protected $table = 'employee_work_confirmation';

    protected $fillable = ['employee_id'];

    public function details()
    {
        return $this->hasMany(EmployeeWorkConfirmationDetails::class, 'work_confirmation_id');
    }

    public function employee()
    {
        return $this->belongsTo(CrmEmployeeModel::class, 'employee_id');
    }
}
