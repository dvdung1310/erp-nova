<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $primaryKey = 'group_id';
    protected $table = 'work_groups';
    public $incrementing = true;
    protected $fillable = [
        'parent_group_id',
        'department_id',
        'group_name',
        'color',
        'group_description',
        'leader_id',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class, 'group_id');
    }

    public function children()
    {
        return $this->hasMany(Group::class, 'parent_group_id');
    }

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }
}
