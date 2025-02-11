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
        Schema::create('nvu_room', function (Blueprint $table) {
            $table->increments('room_id');
            $table->string('room_name');
            $table->string('room_address');
            $table->string('room_description');
            $table->string('room_color');
            $table->boolean('room_status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nvu_room');
    }
};
