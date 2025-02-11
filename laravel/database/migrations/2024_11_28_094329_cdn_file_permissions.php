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
        Schema::create('cdn_file_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('file_id'); 
            $table->unsignedBigInteger('user_id');
            $table->string('permission'); 
            $table->timestamps();
            $table->foreign('file_id')->references('id')->on('cdn_file')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cdn_file_permissions');
    }
};
