<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('work_task_members', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('task_id'); // Ensure this matches the type in work_tasks
            $table->foreign('task_id')->references('task_id')->on('work_tasks');
            $table->foreignId('user_id')->constrained('users');
            $table->softDeletes();
            $table->unique(['task_id', 'user_id']);
            $table->index('task_id');
            $table->index('user_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_task_members');
    }
};
