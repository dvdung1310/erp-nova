<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $primaryKey = 'task_id';
    protected $table = 'work_tasks';
    public $incrementing = true;
    protected $fillable = [
        'project_id',
        'task_name',
        'task_description',
        'task_progress',
        'task_priority', // 0: low, 1: medium, 2: high
        'task_status', // 0: not started, 1: in progress, 2: completed 3: leader confrimed 4:paused
        'task_start_date',
        'task_end_date',
        'task_score_kpi',
        'create_by_user_id',
        'task_date_update_status_completed',
    ];

    // Task.php
    public function users()
    {
        return $this->belongsToMany(User::class, 'work_task_members', 'task_id', 'user_id')
            ->select('users.id', 'users.name', 'users.email', 'users.avatar')
            ->withPivot([]);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'work_task_members', 'task_id', 'user_id');
    }

    public function taskMembers()
    {
        return $this->hasMany(TaskMember::class, 'task_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
