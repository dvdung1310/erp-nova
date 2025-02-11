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
        Schema::create('nvu_room_rent', function (Blueprint $table) {
            $table->increments('rent_id');
            $table->integer('rent_room');
            $table->integer('rent_customer');
            $table->string('rent_start_time');
            $table->string('rent_end_time');
            $table->boolean('rent_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nvu_room_rent');
    }
};
