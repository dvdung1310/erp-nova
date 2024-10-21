<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'image',
        'time',
        'status',
    ];

    // Mối quan hệ 1-N với bảng questions
    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
