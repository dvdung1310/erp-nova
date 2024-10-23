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
        Schema::create('work_tasks', function (Blueprint $table) {
            $table->increments('task_id');
            $table->unsignedInteger('project_id'); // Ensure this matches the type in work_projects
            $table->string('task_name')->default('');
            $table->text('task_description')->default('');
            $table->tinyInteger('task_priority')->default(0);
            $table->tinyInteger('task_status')->default(0);
            $table->date('task_start_date')->nullable();
            $table->date('task_end_date')->nullable();
            $table->foreignId('create_by_user_id')->constrained('users');
            $table->date('task_date_update_status_completed')->nullable();
            $table->index('project_id');
            $table->index('create_by_user_id');
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('project_id')->references('project_id')->on('work_projects'); // Ensure this matches the type in work_projects
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_tasks');
    }
};
