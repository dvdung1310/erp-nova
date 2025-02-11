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
        Schema::create('exams', function (Blueprint $table) {
            $table->id(); // Khóa chính
            $table->string('name'); // Tên đề thi
            $table->text('description')->nullable(); // Mô tả
            $table->string('image')->nullable(); // Ảnh
            $table->integer('time'); // Thời gian (phút)
            $table->boolean('status')->default(1); // Trạng thái 1 là active, 0 là inactive
            $table->timestamps(); // Tự động tạo created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
