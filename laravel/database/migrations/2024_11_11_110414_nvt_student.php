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
        Schema::create('nvt_student', function (Blueprint $table) {
            $table->increments('student_id');
            $table->string('student_name')->nullable();
            $table->string('student_birthday')->nullable();
            $table->foreignId('parent_id')->constrained('customers')->onDelete('cascade');
            $table->text('student_note')->nullable();
            $table->text('student_subject')->nullable();
            $table->integer('student_status')->length(3);
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nvt_student');
    }
};
