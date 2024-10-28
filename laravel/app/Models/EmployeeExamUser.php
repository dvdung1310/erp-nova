<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeExamUser extends Model
{
    use HasFactory;
    protected $table = 'employee_exam_user';
    protected $fillable = [
        'list_question',
        'selected_answers',
        'point',
        'user_id',
        'exam_id',
    ];

    protected $casts = [
        'list_question' => 'array', // Chuyển `list_question` từ JSON thành mảng khi lấy dữ liệu
        'selected_answers' => 'array', // Chuyển `selected_answers` từ JSON thành mảng khi lấy dữ liệu
    ];

    // Định nghĩa quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Định nghĩa quan hệ với Exam
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function list_questions()
    {
        return $this->hasMany(Question::class, 'id', 'list_question');
    }

    // public function exam2()
    // {
    //     return $this->belongsTo(EmployeeExamUser::class, 'exam_id');
    // }
}
