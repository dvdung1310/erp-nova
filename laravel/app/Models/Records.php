<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Records extends Model
{
    protected $table = 'work_records';
    protected $primaryKey = 'record_id';
    public $incrementing = true;
    protected $fillable = [
        'record_date',
        'user_id', // id cua nhan vien
        'record_file',
        'record_level',
        'record_status',
        'record_sender_id',
        'record_user_confirm',
        'record_sender_confirm',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function recordSender()
    {
        return $this->belongsTo(User::class, 'record_sender_id');
    }

}
