<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;
    protected $table = 'employee_questions';
    protected $fillable = [
        'name',
        'status',
        'exam_id',
    ];

    // Mối quan hệ N-1 với bảng exams
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    // Mối quan hệ 1-N với bảng answers
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}
