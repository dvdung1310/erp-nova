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
        Schema::create('crm_employee_day_off', function (Blueprint $table) {
            $table->increments('off_id');
            $table->string('off_title');
            $table->text('off_content');
            $table->string('day_off_start');
            $table->string('day_off_end');
            $table->integer('manager_id');
            $table->integer('employee_id');
            $table->boolean('off_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_employee_day_off');
    }
};
