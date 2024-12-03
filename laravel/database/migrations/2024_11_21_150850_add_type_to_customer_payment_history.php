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
        Schema::table('customer_payment_history', function (Blueprint $table) {
            $table->integer('type')->default(1);
            $table->unsignedBigInteger('customer_id');
            $table->foreign('customer_id')
            ->references('id')
            ->on('customers')
            ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_payment_history', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('type');
            $table->dropColumn('customer_id');
        });
    }
};
