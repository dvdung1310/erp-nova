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
        Schema::create('social_comments', function (Blueprint $table) {
            $table->id('comment_id');
            $table->foreignId('post_id')->constrained('social_posts');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('comment_parent_id')->nullable()->constrained('social_comments');
            $table->text('comment_content');
            $table->foreignId('comment_id')->nullable()->constrained('social_comments');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_comments');
    }
};
