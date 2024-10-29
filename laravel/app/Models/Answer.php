<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;
    protected $table = 'employee_answers';
    protected $fillable = [
        'name',
        'result',
        'question_id',
    ];

    // Mối quan hệ N-1 với bảng questions
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
