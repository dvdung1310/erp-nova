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
        Schema::create('social_reactions', function (Blueprint $table) {
            $table->id('reaction_id');
            $table->foreignId('post_id')->nullable()->constrained('social_posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('reaction_type', ['like', 'dislike', 'love', 'haha', 'wow', 'sad', 'angry']);
            $table->foreignId('comment_id')->nullable()->constrained('social_comments')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_reactions');
    }
};
