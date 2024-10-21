<?php

use App\Http\Controllers\Api\Nova\NvCategoryFileController;
use App\Http\Controllers\Api\Nova\NvDepartmentTeamController;
use App\Http\Controllers\Api\Nova\NvEmployeeController;
use App\Http\Controllers\Api\Nova\NvEmployeeDayOffController;
use App\Http\Controllers\Api\Nova\NvEmployeeFileController;
use App\Http\Controllers\Api\Nova\NvRecruitCandidatesController;
use App\Http\Controllers\Api\Nova\NvRecruitNewsController;
use App\Http\Controllers\Api\Nova\NvRecruitTargetController;
use App\Http\Controllers\Api\Nvu\NvuCustomerController;
use App\Http\Controllers\Api\Nvu\NvuDataSourceController;
use App\Http\Controllers\Api\Nvu\NvuPaymentController;
use App\Http\Controllers\Api\Nvu\NvuRentRoomController;
use App\Http\Controllers\Api\Nvu\NvuRoomController;
use App\Http\Controllers\Api\Nvu\NvuStatusCustomerController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\QuestionController;
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api')->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api')->name('refresh');
    Route::post('/me', [AuthController::class, 'me'])->middleware('auth:api')->name('me');
});
<<<<<<< HEAD


Route::post('/exams', [ExamController::class, 'store']);
Route::get('/exams-index', [ExamController::class, 'index']);
Route::delete('/exams/{id}', [ExamController::class, 'destroy']);
Route::get('/getNameExam/{id}', [ExamController::class, 'getNameExam']);

Route::post('/questions-store', [QuestionController::class, 'store']);
=======
Route::group(['middleware' => 'api'], function () {
    Route::resource('nvucustomer', NvuCustomerController::class);
    Route::resource('nvudatasource', NvuDataSourceController::class);
    Route::resource('nvustatus', NvuStatusCustomerController::class);
    Route::resource('nvuroom', NvuRoomController::class);
    Route::resource('nvuroomrent', NvuRentRoomController::class);
    Route::resource('nvupayment', NvuPaymentController::class);
});
Route::group(['middleware' => 'api'], function () {
    Route::resource('nvdepartmentteam',NvDepartmentTeamController::class);
    Route::resource('nvemployee',NvEmployeeController::class);
    Route::resource('nvdayoff',NvEmployeeDayOffController::class);
    Route::resource('nvcategoryfile',NvCategoryFileController::class);
    Route::resource('nvrecruittarget',NvRecruitTargetController::class);
    Route::resource('nvrecruitcandidates',NvRecruitCandidatesController::class);
});
>>>>>>> 930bf2f0102637e47604bd32fd48e5e2cec9a3ed
