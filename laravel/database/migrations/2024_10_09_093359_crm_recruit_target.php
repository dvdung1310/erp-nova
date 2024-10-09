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
        Schema::create('crm_recruit_target', function (Blueprint $table) {
            $table->increments('target_id');
            $table->string('target_position');
            $table->string('target_amout');
            $table->string('target_start_date');
            $table->string('target_end_date');
            $table->integer('department_id');
            $table->boolean('target_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_recruit_target');
    }
};
