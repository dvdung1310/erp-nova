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
        Schema::create('nvu_booking_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_booking_id')->constrained('nvu_room_booking')->onDelete('cascade');
            $table->foreignId('payment_history_id')->constrained('customer_payment_history')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nvu_booking_history');
    }
};
