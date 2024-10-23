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
        Schema::create('work_project_members', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('project_id'); // Ensure this matches the type in work_projects
            $table->foreign('project_id')->references('project_id')->on('work_projects');
            $table->foreignId('user_id')->constrained('users');
            $table->unique(['project_id', 'user_id']);
            $table->index('project_id');
            $table->index('user_id');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_project_members');
    }
};
