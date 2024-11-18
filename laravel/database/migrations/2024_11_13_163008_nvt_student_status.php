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
        Schema::create('nvt_student_status', function (Blueprint $table) {
            $table->increments('status_id'); // Cột tự động tăng, khóa chính
            $table->string('status_name');
            $table->integer('status_type')->unsigned(); // Không cần auto_increment
            $table->boolean('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nvt_student_status');
    }
};
