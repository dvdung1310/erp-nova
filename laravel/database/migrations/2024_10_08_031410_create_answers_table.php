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
        Schema::create('answers', function (Blueprint $table) {
            $table->id(); // Khóa chính
            $table->string('name'); // Nội dung đáp án
            $table->boolean('result'); // Kết quả: đúng (1) hoặc sai (0)
            $table->foreignId('question_id') // Khóa ngoại tham chiếu bảng questions
                  ->constrained('questions') // Ràng buộc với bảng questions
                  ->onDelete('cascade'); // Nếu xóa question, xóa luôn đáp án
            $table->timestamps(); // Tự động tạo created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
