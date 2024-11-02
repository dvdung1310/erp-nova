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
        Schema::create('employee_work_confirmation', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('employee_id');
            $table->foreign('employee_id')->references('employee_id')->on('crm_employee')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_work_confirmation');
    }
};
