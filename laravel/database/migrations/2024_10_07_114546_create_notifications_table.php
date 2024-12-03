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
        Schema::create('work_notifications', function (Blueprint $table) {
            $table->increments('notification_id');
            $table->unsignedInteger('project_id')->nullable();
            $table->unsignedInteger('task_id')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('create_by_user_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('notification_status')->default(0); // 0 = unread, 1 = read
            $table->text('notification_title');
            $table->text('notification_link');
            $table->text('notification_content');
            $table->string('notification_type');
            $table->string('notification_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_notifications');
    }
};
