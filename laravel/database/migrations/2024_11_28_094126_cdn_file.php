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
        Schema::create('cdn_file', function (Blueprint $table) {
            $table->id();
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->nullable(); // Kích thước file (bytes)
            $table->string('file_type')->nullable(); // Loại file (MIME type)
            $table->string('file_path'); // Đường dẫn file
            $table->string('file_storage_path')->nullable(); // Đường dẫn lưu trữ
            $table->boolean('is_folder')->default(false); // True nếu là thư mục
            $table->unsignedBigInteger('parent_id')->nullable(); // ID thư mục cha
            $table->boolean('is_public')->default(false); // File công khai hay không
            $table->unsignedBigInteger('created_by'); // Người tạo file
            $table->unsignedBigInteger('updated_by')->nullable(); // Người chỉnh sửa file
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cdn_file');
    }
};
