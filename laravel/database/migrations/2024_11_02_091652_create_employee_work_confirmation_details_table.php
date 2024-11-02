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
        Schema::create('employee_work_confirmation_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_confirmation_id')->constrained('employee_work_confirmation')->onDelete('cascade');
            $table->date('work_date')->nullable();
            $table->string('time', 20)->nullable();
            $table->integer('work_number')->nullable();
            $table->text('work_content')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_work_confirmation_details');
    }
};
