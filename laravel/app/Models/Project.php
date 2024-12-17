<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $primaryKey = 'project_id';
    protected $table = 'work_projects';
    public $incrementing = true;
    protected $fillable = [
        'project_name',
        'project_description',
        'group_id',
        'project_type', // 0:chuyên môn, 1:nhiệm vụ
        'project_status', // 0: chưa bắt đầu, 1: đang thực hiện, 2: đã hoàn thành
        'project_start_date',
        'project_end_date',
        'create_by_user_id',
        'notify_before_end_time',
        'leader_id',
    ];

    public function projectMembers()
    {
        return $this->hasMany(ProjectMember::class, 'project_id');
    }

    public function members()
    {
        return $this->hasMany(ProjectMember::class, 'project_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'work_project_members', 'project_id', 'user_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'project_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'create_by_user_id');
    }

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }
}
