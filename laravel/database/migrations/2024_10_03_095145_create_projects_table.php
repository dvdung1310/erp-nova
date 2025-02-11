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
        Schema::create('work_projects', function (Blueprint $table) {
            $table->increments('project_id');
            $table->string('project_name');
            $table->text('project_description')->nullable();
            $table->text('leader_id')->nullable();
            $table->tinyInteger('project_type')->default(0);
            $table->unsignedInteger('group_id'); // Ensure this matches the type in work_groups
            $table->tinyInteger('project_status')->default(0);
            $table->date('project_start_date');
            $table->date('project_end_date');
            $table->tinyInteger('notify_before_end_time')->default(0);
            $table->foreignId('create_by_user_id')->constrained('users');
            $table->index('group_id');
            $table->index('create_by_user_id');
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('group_id')->references('group_id')->on('work_groups'); // Ensure this matches the type in work_groups
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_projects');
    }
};
