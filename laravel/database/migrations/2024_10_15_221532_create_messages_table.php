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
        Schema::create('work_messages', function (Blueprint $table) {
            $table->increments('message_id');
            $table->text('text')->nullable();
            $table->string('image_url')->nullable();
            $table->string('file_url')->nullable();
            $table->tinyInteger('message_type')->default(0); // 0: text, 1: image, 2: file
            $table->foreignId('message_by_user_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_messages');
    }
};
