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
        Schema::create('nvt_trial_class_schedule', function (Blueprint $table) {
            $table->increments('trial_id');
            $table->string('trial_subject')->nullable();
            $table->integer('student_id');
            $table->integer('teacher_id');
            $table->string('trial_date');
            $table->boolean('status_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nvt_trial_class_schedule');
    }
};
