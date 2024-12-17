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
        Schema::create('aai_suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('suppliers_id')->unique();
            $table->string('suppliers_name');
            $table->string('suppliers_mst');
            $table->string('suppliers_phone',11);
            $table->string('suppliers_address');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aai_supplier');
    }
};
