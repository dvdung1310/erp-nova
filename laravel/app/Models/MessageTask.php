<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageTask extends Model
{
    use HasFactory;

    protected $table = 'work_message_tasks';
    public $incrementing = true;
    protected $fillable = [
        'message_id',
        'task_id',
        'created_at',
        'updated_at'
    ];

    public function message()
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
