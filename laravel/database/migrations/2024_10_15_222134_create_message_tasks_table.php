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
        Schema::create('work_message_tasks', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('message_id'); // Ensure this matches the type in work_messages
            $table->unsignedInteger('task_id'); // Ensure this matches the type in work_tasks
            $table->timestamps();

            $table->foreign('message_id')->references('message_id')->on('work_messages');
            $table->foreign('task_id')->references('task_id')->on('work_tasks');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_message_tasks');
    }
};
