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
        'create_by_user_id',
        'task_id',
        'project_id',
        'notification_status', // 0 = unread, 1 = read
        'notification_type', // 0 = user, 1 = common, 2 = warning
        'notification_file',
        'notification_content',
        'notification_title',
        'notification_link',
    ];
    protected $attributes = [
        'notification_status' => 0,

    ];

    public function createByUser()
    {
        return $this->belongsTo(User::class, 'create_by_user_id');
    }

}
