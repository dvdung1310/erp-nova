<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'work_notifications';
    protected $primaryKey = 'notification_id';
    public $incrementing = true;
    protected $fillable = [
        'user_id',
        'task_id',
        'project_id',
        'notification_status', // 0 = unread, 1 = read
        'notification_title',
        'notification_link',
    ];
    protected $attributes = [
        'notification_status' => 0,
    ];

}
