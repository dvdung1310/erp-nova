<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SuccessController;
Route::get('/', function () {
    return view('welcome');
});

Route::get('/success', [SuccessController::class, 'successPayment']);
Route::get('/cancel', [SuccessController::class, 'cancelPayment']);
Route::prefix('/order')->group(function () {
    Route::post('/create', [OrderController::class, 'createOrder']);
    Route::get('/{id}', [OrderController::class, 'getPaymentLinkInfoOfOrder']);
    Route::put('/{id}', [OrderController::class, 'cancelPaymentLinkOfOrder']);
});

Route::prefix('/payment')->group(function () { 
    Route::post('/payos', [PaymentController::class, 'handlePayOSWebhook']);
});
