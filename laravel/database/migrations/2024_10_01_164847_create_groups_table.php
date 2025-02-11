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
        Schema::create('work_groups', function (Blueprint $table) {
            $table->increments('group_id');
            $table->unsignedInteger('parent_group_id')->nullable();
            $table->string('group_name');
            $table->string('group_description');
            $table->string('color');
            $table->unsignedBigInteger('leader_id');
            $table->foreign('leader_id')->references('id')->on('users');
            $table->foreign('parent_group_id')->references('group_id')->on('work_groups');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_groups');
    }
};
