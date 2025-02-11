<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskHistoryUpdate extends Model
{
    //
    protected $table = 'work_task_history_update';
    protected $fillable = [
        'task_id',
        'user_id',
        'type',
        'update_time',
        'old_value',
        'new_value',
        'created_at',
        'updated_at'
    ];
}
