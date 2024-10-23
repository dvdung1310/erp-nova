<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $primaryKey = 'message_id';
    protected $table = 'work_messages';
    public $incrementing = true;
    protected $fillable = [
        'message_id',
        'text',
        'image_url',
        'message_type', // 0: text, 1: image, 2: file
        'file_url',
        'message_by_user_id',
        'created_at',
        'updated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'message_by_user_id');
    }
}
