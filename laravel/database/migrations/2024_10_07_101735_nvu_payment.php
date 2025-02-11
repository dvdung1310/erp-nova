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
        Schema::create('nvu_payment', function (Blueprint $table) {
            $table->increments('payment_id');
            $table->integer('payment_customer');
            $table->string('payment_date',50);
            $table->integer('payment_amount');
            $table->string('payment_image');
            $table->boolean('payment_option_money');
            $table->string('payment_description');
            $table->boolean('payment_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nvu_payment');
    }
};
