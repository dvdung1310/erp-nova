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
        Schema::create('questions', function (Blueprint $table) {
            $table->id(); // Khóa chính
            $table->string('name'); // Nội dung câu hỏi
            $table->boolean('status')->default(1); // Trạng thái 1 là active, 0 là inactive
            $table->foreignId('exam_id') // Khóa ngoại tham chiếu bảng exams
                  ->constrained('exams') // Ràng buộc với bảng exams
                  ->onDelete('cascade'); // Nếu xóa exam, xóa luôn câu hỏi
            $table->timestamps(); // Tự động tạo created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
