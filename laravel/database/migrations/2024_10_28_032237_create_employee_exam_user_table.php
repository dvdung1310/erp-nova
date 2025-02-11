<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('employee_exam_user', function (Blueprint $table) {
            $table->id();
            $table->json('list_question'); 
            $table->json('selected_answers'); 
            $table->integer('point');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('exam_id');
            $table->timestamps();

            // Khóa ngoại
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('exam_id')->references('id')->on('employee_exam')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('employee_exam_user');
    }
};
