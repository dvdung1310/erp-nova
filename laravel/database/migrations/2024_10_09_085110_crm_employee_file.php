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
        Schema::create('crm_employee_file', function (Blueprint $table) {
            $table->increments('file_id');
            $table->string('file_name');
            $table->string('file_discription');
            $table->string('file_date');
            $table->string('file');
            $table->integer('category_id');
            $table->integer('employee_id');
            $table->boolean('file_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_employee_file');
    }
};
