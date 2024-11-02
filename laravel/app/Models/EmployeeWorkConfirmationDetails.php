<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeWorkConfirmationDetails extends Model
{
    use HasFactory;
    use HasFactory;

    protected $table = 'employee_work_confirmation_details';

    protected $fillable = [
        'work_confirmation_id',
        'work_date',
        'time',
        'work_number',
        'work_content',
        'reason'
    ];

    public function workConfirmation()
    {
        return $this->belongsTo(EmployeeWorkConfirmation::class, 'work_confirmation_id');
    }
}
