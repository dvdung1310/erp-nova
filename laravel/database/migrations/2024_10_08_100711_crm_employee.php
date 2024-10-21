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
        Schema::create('crm_employee', function (Blueprint $table) {
            $table->increments('employee_id');
            $table->string('employee_name');
            $table->string('employee_email');
            $table->string('employee_email_nova');
            $table->string('employee_phone',11);
            $table->string('employee_address');
            $table->string('employee_identity');
            $table->string('employee_bank_number');
            $table->integer('department_id');
            $table->integer('team_id');
            $table->integer('level_id');
            $table->integer('employee_status');
            $table->integer('account_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_employee');
    }
};
