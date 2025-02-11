<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('answers', 'employee_answers');
        Schema::rename('exams', 'employee_exam');
        Schema::rename('questions', 'employee_questions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('employee_answers', 'answers');
        Schema::rename('employee_exam', 'exams');
        Schema::rename('employee_questions', 'questions');
    }
};
