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
        Schema::create('social_galleries', function (Blueprint $table) {
            $table->id('gallery_id');
            $table->foreignId('post_id')->constrained('social_posts')->onDelete('cascade');
            $table->foreignId('comment_id')->nullable()->constrained('social_comments')->onDelete('cascade');
            $table->string('media_url');
            $table->integer('media_type');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_galleries');
    }
};
