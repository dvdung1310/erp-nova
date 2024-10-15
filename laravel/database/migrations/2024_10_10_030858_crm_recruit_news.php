<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('crm_recruit_news', function (Blueprint $table) {
            $table->increments('news_id');
            $table->string('news_title');
            $table->text('news_content');
            $table->string('news_salary',15);
            $table->integer('target_id');
            $table->string('news_start_date',20);
            $table->string('news_end_date',20);
            $table->boolean('news_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_recruit_news');
    }
};
