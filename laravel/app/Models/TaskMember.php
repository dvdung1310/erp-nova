<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskMember extends Model
{
    use HasFactory;
    protected $table = 'work_task_members';
    public $incrementing = true;

    protected $fillable = [
        'task_id',
        'user_id',
    ];
}
