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
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Middleware\middlewareLogin;
use App\Http\Middleware\MiddlewareLoginCeo;
use App\Http\Middleware\MiddlewareLoginLeader;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\Nova\ExamController;
use App\Http\Controllers\Api\Nova\QuestionController;
use App\Http\Controllers\Api\Nova\WorkScheduleController;


Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware(middlewareLogin::class)->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api')->name('refresh');
    Route::post('/me', [AuthController::class, 'me'])->middleware(middlewareLogin::class)->name('me');
});

Route::post('/exams', [ExamController::class, 'store']);
Route::get('/exams-index', [ExamController::class, 'index']);
Route::delete('/exams/{id}', [ExamController::class, 'destroy']);
Route::get('/getNameExam/{id}', [ExamController::class, 'getNameExam']);
Route::post('/questions-store', [QuestionController::class, 'store']);
Route::post('workschedule', [WorkScheduleController::class, 'store']);
Route::get('getWorkSchedulesByMonth/{month}', [WorkScheduleController::class, 'getWorkSchedulesByMonth']);

Route::group(['middleware' => 'api'], function () {
    Route::resource('nvucustomer', NvuCustomerController::class);
    Route::resource('nvudatasource', NvuDataSourceController::class);
    Route::resource('nvustatus', NvuStatusCustomerController::class);
    Route::resource('nvuroom', NvuRoomController::class);
    Route::resource('nvuroomrent', NvuRentRoomController::class);
    Route::resource('nvupayment', NvuPaymentController::class);
});

Route::group(['middleware' => 'api'], function () {
    Route::resource('nvdepartmentteam', NvDepartmentTeamController::class);
    Route::resource('nvemployee', NvEmployeeController::class);
    Route::resource('nvdayoff', NvEmployeeDayOffController::class);
    Route::resource('nvcategoryfile', NvCategoryFileController::class);
    Route::resource('nvrecruittarget', NvRecruitTargetController::class);
    Route::resource('nvrecruitcandidates', NvRecruitCandidatesController::class);
});
// work
//groups
Route::group([
    'middleware' => 'api',
    'prefix' => 'groups'
], function () {
    Route::get('get-all-group-parent', [GroupController::class, 'getAllGroupParent'])->middleware(middlewareLogin::class);
    Route::get('get-by-ceo', [GroupController::class, 'getAllProjectsAndTasksInGroups'])->middleware(MiddlewareLoginCeo::class);
    Route::get('get-by-user-id', [GroupController::class, 'getGroupByUserId'])->middleware(middlewareLogin::class);
    Route::post('create', [GroupController::class, 'create'])->middleware(middlewareLogin::class);
    Route::put('update/{group_id}', [GroupController::class, 'update'])->middleware(middlewareLogin::class);
    Route::delete('delete/{group_id}', [GroupController::class, 'delete'])->middleware(middlewareLogin::class);
    Route::get('get-group-by-parent-group-id/{parent_group_id}', [GroupController::class, 'getGroupByParentGroupId'])->middleware(middlewareLogin::class);
});
// projects
Route::prefix('projects')->group(function () {
    Route::post('create', [ProjectController::class, 'create'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update/{project_id}', [ProjectController::class, 'update'])->middleware(MiddlewareLoginLeader::class);
    Route::get('get-by-ceo', [ProjectController::class, 'getProjectByCeo'])->middleware(MiddlewareLoginCeo::class);
    Route::post('member-join-project/{project_id}', [ProjectController::class, 'memberJoinProject'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-name/{project_id}', [ProjectController::class, 'updateNameAndDescription'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-status/{project_id}', [ProjectController::class, 'updateStatus'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-members/{project_id}', [ProjectController::class, 'updateMembers'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-start-date/{project_id}', [ProjectController::class, 'updateStartDate'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-end-date/{project_id}', [ProjectController::class, 'updateEndDate'])->middleware(MiddlewareLoginLeader::class);
    Route::delete('delete/{project_id}', [ProjectController::class, 'delete'])->middleware(MiddlewareLoginLeader::class);
    Route::get('get-all', [ProjectController::class, 'getAllProjects'])->middleware(middlewareLogin::class);
    Route::get('get-project-by-user-id', [ProjectController::class, 'getProjectByUserId'])->middleware(middlewareLogin::class);
    Route::get('get-project-by-group-id/{group_id}', [ProjectController::class, 'getProjectsByGroupId'])->middleware(middlewareLogin::class);
});
// task
Route::prefix('tasks')->group(function () {
    // message
    Route::post('create-message', [MessageController::class, 'create'])->middleware(middlewareLogin::class);
    Route::get('get-message-by-task/{task_id}', [MessageController::class, 'getMessageByTask'])->middleware(middlewareLogin::class);

    //
    Route::post('create', [TaskController::class, 'create'])->middleware(MiddlewareLoginLeader::class);
    Route::get('get-task-unfinished-by-user-id', [TaskController::class, 'getTaskUnfinishedByUserId'])->middleware(middlewareLogin::class);
    Route::delete('delete/{task_id}', [TaskController::class, 'delete'])->middleware(MiddlewareLoginLeader::class);
    Route::get('get-task-by-project-id/{project_id}', [TaskController::class, 'getTaskByProjectId'])->middleware(middlewareLogin::class);
    Route::put('update-name/{task_id}', [TaskController::class, 'updateName'])->middleware(middlewareLogin::class);
    Route::put('update-status/{task_id}', [TaskController::class, 'updateStatus'])->middleware(middlewareLogin::class);
    Route::put('update-priority/{task_id}', [TaskController::class, 'updatePriority'])->middleware(middlewareLogin::class);
    Route::put('update-start-date/{task_id}', [TaskController::class, 'updateStartDate'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-end-date/{task_id}', [TaskController::class, 'updateEndDate'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-members/{task_id}', [TaskController::class, 'updateMember'])->middleware(MiddlewareLoginLeader::class);
});
// devices
Route::prefix('devices')->group(function () {
    Route::post('create', [DeviceController::class, 'createOrNotExit'])->middleware(middlewareLogin::class);
});
// notification
Route::prefix('notifications')->group(function () {
    Route::get('get-notification-by-user-id', [NotificationController::class, 'getNotificationByUserId'])->middleware(middlewareLogin::class);
    Route::put('update-status/{notification_id}', [NotificationController::class, 'updateStatus'])->middleware(middlewareLogin::class);
});

