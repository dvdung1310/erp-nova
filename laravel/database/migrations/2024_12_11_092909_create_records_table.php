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
        Schema::create('work_records', function (Blueprint $table) {
            $table->id('record_id');
            $table->date('record_date');
            $table->foreignId('employee_id')->constrained('crm_employee');
            $table->integer('record_level');
            $table->text('record_content');
            $table->integer('record_status');
            $table->foreignId('record_sender_id')->constrained('crm_employee');
            $table->index('employee_id');
            $table->index('record_sender');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('records');
    }
};
