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
        Schema::create('crm_recruit_candidates', function (Blueprint $table) {
            $table->increments('candidates_id');
            $table->string('candidates_name');
            $table->string('candidates_phone',11);
            $table->string('candidates_email',100);
            $table->string('candidates_cv');
            $table->text('candidates_feedback');
            $table->integer('news_id');
            $table->boolean('candidates_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_recruit_candidates');
    }
};
