<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupTask extends Model
{
    //
    protected $primaryKey = 'group_task_id';
    protected $table = 'work_group_task';
    public $incrementing = true;
    protected $fillable = [
        'group_task_name',
        'project_id'
    ];
}
