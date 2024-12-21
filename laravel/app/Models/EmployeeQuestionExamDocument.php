<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeQuestionExamDocument extends Model
{
    protected $table = 'employee_question_exam_document';

    // Các cột có thể được gán giá trị hàng loạt
    protected $fillable = [
        'exam_id',
        'question_id',
    ];

    // Tắt timestamps nếu bảng không có các cột created_at và updated_at
    public $timestamps = false;

    /**
     * Quan hệ với bảng `employee_exam`
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    /**
     * Quan hệ với bảng `employee_questions`
     */
    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
