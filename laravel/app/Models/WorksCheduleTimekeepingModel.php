<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class WorksCheduleTimekeepingModel extends Model
{
    use HasFactory;

    protected $table = 'works_schedule_timekeeping';
    protected $fillable = ['manv','user_id', 'date', 'check_in_time', 'check_out_time'];
}
