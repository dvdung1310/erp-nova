<?php

use App\Http\Controllers\Api\AaiFood\DepotManagerController;
use App\Http\Controllers\Api\Cdn\DocumentController;
use App\Http\Controllers\Api\Nova\ExamController;
use App\Http\Controllers\Api\Nova\NvCategoryFileController;
use App\Http\Controllers\Api\Nova\NvDepartmentTeamController;
use App\Http\Controllers\Api\Nova\NvEmployeeController;
use App\Http\Controllers\Api\Nova\NvEmployeeFileController;
use App\Http\Controllers\Api\Nova\NvEmployeeDayOffController;
use App\Http\Controllers\Api\Nova\NvRecruitCandidatesController;
use App\Http\Controllers\Api\Nova\NvRecruitTargetController;
use App\Http\Controllers\Api\Social\PostController;
use App\Http\Controllers\Api\Work\DeviceController;
use App\Http\Controllers\Api\Work\GroupController;
use App\Http\Controllers\Api\Work\MessageController;
use App\Http\Controllers\Api\Work\NotificationController;
use App\Http\Controllers\Api\Work\ProjectController;
use App\Http\Controllers\Api\Work\RecordsController;
use App\Http\Controllers\Api\Work\TaskController;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\middlewareLogin;
use App\Http\Middleware\MiddlewareLoginCeo;
use App\Http\Middleware\MiddlewareLoginLeader;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Nova\NvDepartmentController;
use App\Http\Controllers\Api\Nova\NvRecruitNewsController;
use App\Http\Controllers\Api\Nova\QuestionController;
use App\Http\Controllers\Api\Nova\WorkScheduleController;
use App\Http\Controllers\Api\Nova\WorkConfirmationController;
use App\Http\Controllers\Api\Nova\ProposalController;
use App\Http\Controllers\Api\Nvt\NvtCustomerController;
use App\Http\Controllers\Api\Nvt\NvtPaymentController;
use App\Http\Controllers\Api\Nvt\StudentController;

// novaup
use App\Http\Controllers\Api\Nvu\StatusController;
use App\Http\Controllers\Api\Nvu\SourceController;
use App\Http\Controllers\Api\Nvu\RoomController;
use App\Http\Controllers\Api\Nvu\CustomerController;
use App\Http\Controllers\Api\Customer\CustomerController as CustomerMainController;
use App\Http\Controllers\Api\Nvu\BookingController;
use App\Http\Controllers\Api\Nvu\PaymentController;

// endNovaup

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware(middlewareLogin::class)->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
    Route::get('/me', [AuthController::class, 'me'])->middleware(middlewareLogin::class)->name('me');
    Route::post('/update-profile', [AuthController::class, 'updateProfile'])->middleware(middlewareLogin::class);
    Route::put('/change-password', [AuthController::class, 'changePassword'])->middleware(middlewareLogin::class);
    Route::get('get-all', [AuthController::class, 'getAllUser'])->middleware(middlewareLogin::class);

});
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

Route::group(['middleware' => 'api'], function () {
    Route::post('/store-exams', [ExamController::class, 'store']);
    Route::get('/exams-index/{type}', [ExamController::class, 'index']);
    Route::delete('/destroy-exams/{id}', [ExamController::class, 'destroy']);
    Route::post('/update-exams/{id}', [ExamController::class, 'update']);
    Route::get('/getNameExam/{id}', [ExamController::class, 'getNameExam']);


    Route::post('/questions-store', [QuestionController::class, 'store']);
    Route::post('/document-store', [QuestionController::class, 'storeQuestionDocument']);
    Route::get('/get-all-question/{examId}', [QuestionController::class, 'getAllQuestion']);
    Route::post('/store-question-exam-document', [QuestionController::class, 'storeOrUpdateQuestionExamDocument']);
    Route::post('workschedule', [WorkScheduleController::class, 'store']);
    Route::get('getWorkSchedulesByMonth/{month}', [WorkScheduleController::class, 'getWorkSchedulesByMonth']);
    Route::get('getWorkScheduleForWeekByUserId', [WorkScheduleController::class, 'getWorkScheduleForWeekByUserId']);
    Route::post('/upload-image', [ExamController::class, 'upload'])->name('upload.image');
    Route::post('/store-question', [QuestionController::class, 'store']);
    Route::get('/list-question-answer/{id}', [QuestionController::class, 'getQuestionsWithAnswers']);
    Route::get('/question-or-document/{id}', [QuestionController::class, 'getQuestionsOrDocument']);
    Route::delete('/delete-question-answer/{id}', [QuestionController::class, 'DeleteQuestion']);
    Route::post('/update-question-answer', [QuestionController::class, 'UpdateQuestion']);
    Route::post('/update-question-document', [QuestionController::class, 'UpdateQuestionDocument']);


    Route::post('/questionName', [QuestionController::class, 'questionName']);
    Route::post('/store-result-user', [ExamController::class, 'StoreResult']);
    Route::get('/get-exam-user/{id}', [ExamController::class, 'getExamUserResult']);
    Route::get('/list-exam-user/{id}', [ExamController::class, 'getListUserExam']);
    // users
    Route::post('users/calculator-kpi/{user_id}', [AuthController::class, 'calculatorKpi'])->middleware(middlewareLogin::class);
});

// xác nhận công
Route::group(['middleware' => 'api', 'prefix' => 'work-confirmations'], function () {
    Route::post('/store', [WorkConfirmationController::class, 'store']);
    Route::post('/manager-store', [WorkConfirmationController::class, 'storeWorkConfirmationManager'])->middleware(middlewareLogin::class);
    Route::get('/', [WorkConfirmationController::class, 'index']);
    Route::get('detail/{id}', [WorkConfirmationController::class, 'detailworkconfirmation']);
    Route::get('delete_detail/{id}', [WorkConfirmationController::class, 'deleteDetailworkconfirmation']);
    Route::get('delete_workconfirmation/{id}', [WorkConfirmationController::class, 'deleteworkconfirmation']);
    Route::get('list_employee', [WorkConfirmationController::class, 'getEmployeeConfirmations']);
    Route::post('update_detail', [WorkConfirmationController::class, 'updateDetailWorkConfimation']);
    Route::post('update_status/{id}/{status}', [WorkConfirmationController::class, 'updateStatus'])->middleware(middlewareLogin::class);
    Route::post('update_status_detail/{id}/{status}', [WorkConfirmationController::class, 'updateStatusEmployee_work_confirmation_details'])->middleware(middlewareLogin::class);
    Route::get('listbyuser', [WorkConfirmationController::class, 'listWorkConfimationUser']);
    Route::get('danh-sach-cong-da-duyet', [WorkConfirmationController::class, 'listWorkConfimationStatus1']);
});

// Đề xuất
Route::group(['middleware' => 'api', 'prefix' => 'proposal'], function () {
    Route::post('/store', [ProposalController::class, 'store'])->middleware(middlewareLogin::class);
    Route::post('/update', [ProposalController::class, 'update']);
    Route::get('/detail/{id}', [ProposalController::class, 'detail']);
    Route::get('/index', [ProposalController::class, 'index']);
    Route::get('/delete/{id}', [ProposalController::class, 'delete']);
    Route::get('/list_employee', [ProposalController::class, 'getEmployeeConfirmations']);
    Route::post('update_status/{id}/{status}', [ProposalController::class, 'updateStatus']);
});

// Novaup
Route::group(['middleware' => 'api', 'prefix' => 'novaup'], function () {
    Route::post('/storeStatus', [StatusController::class, 'store']);
    Route::get('/indexStatus', [StatusController::class, 'index']);
    Route::post('/updateStatus', [StatusController::class, 'update']);
    Route::get('/deleteStatus/{id}', [StatusController::class, 'delete']);

    Route::post('/storeSource', [SourceController::class, 'store']);
    Route::get('/indexSource', [SourceController::class, 'index']);
    Route::post('/updateSource', [SourceController::class, 'update']);
    Route::get('/deleteSource/{id}', [SourceController::class, 'delete']);

    Route::post('/storeRoom', [RoomController::class, 'store']);
    Route::get('/indexRoom', [RoomController::class, 'index']);
    Route::post('/updateRoom', [RoomController::class, 'update']);
    Route::get('/deleteRoom/{id}', [RoomController::class, 'delete']);

    Route::post('/storeCustomer', [CustomerController::class, 'store']);
    Route::get('/indexCustomer', [CustomerController::class, 'index']);
    Route::post('/updateCustomer', [CustomerController::class, 'update']);
    Route::get('/deleteCustomer/{id}', [CustomerController::class, 'delete']);


    Route::post('/storeBooking', [BookingController::class, 'store']);
    Route::get('/indexBooking', [BookingController::class, 'index']);
    Route::post('/updateBooking', [BookingController::class, 'update']);
    Route::get('/deleteBooking/{id}', [BookingController::class, 'delete']);


    Route::post('/storePayment', [PaymentController::class, 'store']);
    Route::get('/indexPayment', [PaymentController::class, 'index']);
    Route::post('/updatePayment', [PaymentController::class, 'update']);
    Route::get('/deletePayment/{id}', [PaymentController::class, 'delete']);
    Route::get('/getBookingConnectCumstomer', [PaymentController::class, 'getBookingConnectCumstomer']);

});

// NovaTeen
Route::group(['middleware' => 'api'], function () {
    Route::resource('nvtstudent', StudentController::class);
    Route::resource('nvtcustomer', NvtCustomerController::class);
    Route::post('storestudent', [NvtCustomerController::class, 'storestudent'])->middleware(middlewareLogin::class);
    Route::post('update_parent/{id}', [NvtCustomerController::class, 'update_parent']);
    //Học sinh
    Route::get('student_trial_class/{id}', [StudentController::class, 'student_trial_class']);
    Route::post('store_trial_class', [StudentController::class, 'store_trial_class']);
    Route::post('update_trial_class/{id}', [StudentController::class, 'update_trial_class']);
    Route::post('update_comment_parient/{id}', [StudentController::class, 'update_comment_parient']);
    Route::get('get_comment_parent/{id}', [StudentController::class, 'get_comment_parent']);
    Route::resource('nvtstudent', StudentController::class);
    Route::resource('nvtcustomer', NvtCustomerController::class);
    Route::post('storestudent', [NvtCustomerController::class, 'storestudent'])->middleware(middlewareLogin::class);
    Route::post('update_parent/{id}', [NvtCustomerController::class, 'update_parent']);
    Route::get('data_source_novateen', [NvtCustomerController::class, 'data_source_novateen']);
    Route::post('store_source_novateen', [NvtCustomerController::class, 'store_source_novateen']);
    Route::post('update_source_novateen', [NvtCustomerController::class, 'update_source_novateen']);
    //Học sinh
    Route::get('student_trial_class/{id}', [StudentController::class, 'student_trial_class']);
    Route::post('store_trial_class', [StudentController::class, 'store_trial_class']);
    Route::post('update_trial_class/{id}', [StudentController::class, 'update_trial_class']);
    Route::post('update_comment_parient/{id}', [StudentController::class, 'update_comment_parient']);
    Route::get('get_comment_parent/{id}', [StudentController::class, 'get_comment_parent']);
    //Doanh thu
    Route::get('nvt_payment', [NvtPaymentController::class, 'index']);
    Route::get('nvt_customer', [NvtPaymentController::class, 'nvt_customer']);
    Route::post('nvt_store_payment', [NvtPaymentController::class, 'store'])->middleware(middlewareLogin::class);
    Route::post('nvt_update_payment/{id}', [NvtPaymentController::class, 'update']);
    Route::get('delete_payment/{id}', [NvtPaymentController::class, 'delete_payment']);
    Route::put('update_status_payment/{id}', [NvtPaymentController::class, 'update_status_payment']);
    //import data
    Route::post('nvt_import_data', [NvtCustomerController::class, 'nvt_import_data'])->middleware(middlewareLogin::class);
    Route::get('nvt_list_data_import', [NvtCustomerController::class, 'nvt_list_data_import']);
    Route::post('nvt_divide_data', [NvtCustomerController::class, 'nvt_divide_data']);

});
//Thực phẩm
Route::group(['middleware' => 'api'], function () {
    //nhà cung cấp
    Route::get('all_suppliers', [DepotManagerController::class, 'all_suppliers']);
    Route::post('store_suppliers', [DepotManagerController::class, 'store_suppliers']);
    Route::post('update_suppliers/{id}', [DepotManagerController::class, 'update_suppliers']);
    //sản phẩm
    Route::get('all_product', [DepotManagerController::class, 'all_product']);
    Route::post('store_product', [DepotManagerController::class, 'store_product']);
    Route::post('update_product/{id}', [DepotManagerController::class, 'update_product']);
    //Đại lý
    Route::get('all_agency', [DepotManagerController::class, 'all_agency']);
    Route::post('store_agency', [DepotManagerController::class, 'store_agency']);
    Route::post('update_agency/{id}', [DepotManagerController::class, 'update_agency']);
    //hóa đơn xuất kho
    Route::get('all_order', [DepotManagerController::class, 'all_order']);
    //Phiếu xuất kho
    Route::get('create_bill', [DepotManagerController::class, 'create_bill']);
    Route::get('order_detail/{order_id}', [DepotManagerController::class, 'order_detail']);
    Route::get('delete_order/{order_id}', [DepotManagerController::class, 'delete_order']);
    Route::post('store_order_retail', [DepotManagerController::class, 'store_order_retail']);
    Route::post('store_order_agency', [DepotManagerController::class, 'store_order_agency']);
    //Phiếu chi
    Route::get('all_payment_slip', [DepotManagerController::class, 'all_payment_slip']);
    Route::post('store_payment_slip', [DepotManagerController::class, 'store_payment_slip']);
    Route::post('update_payment_slip/{cost_id}', [DepotManagerController::class, 'update_payment_slip']);
    Route::get('delete_payment_slip/{cost_id}', [DepotManagerController::class, 'delete_payment_slip']);
    //Doanh thu
    Route::get('revenue', [DepotManagerController::class, 'revenue']);
    //Kiểm tra quyền
    Route::get('check_role_food', [DepotManagerController::class, 'check_role_food'])->middleware(middlewareLogin::class);
    Route::get('revenue', [DepotManagerController::class, 'revenue']);

});
// Novaup
Route::group(['middleware' => 'api', 'prefix' => 'customer'], function () {
    Route::post('/storeCustomer', [CustomerMainController::class, 'store']);
    Route::get('/indexCustomer', [CustomerMainController::class, 'index']);
    Route::post('/updateCustomer', [CustomerMainController::class, 'update']);
    Route::get('/deleteCustomer/{id}', [CustomerMainController::class, 'delete']);
});
Route::group(['middleware' => 'api'], function () {
    Route::resource('nvdepartment', NvDepartmentController::class);
    Route::resource('nvdepartmentteam', NvDepartmentTeamController::class);
    Route::resource('nvemployee', NvEmployeeController::class);
    Route::resource('nvdayoff', NvEmployeeDayOffController::class);
    Route::resource('nvcategoryfile', NvCategoryFileController::class);
    Route::resource('nvemployeefile', NvEmployeeFileController::class);
    Route::resource('nvrecruittarget', NvRecruitTargetController::class);
    Route::resource('nvrecruitnews ', NvRecruitNewsController::class);
    Route::resource('nvrecruitcandidates', NvRecruitCandidatesController::class);
    Route::get('showEmployeeFile/{employee_id}', [NvEmployeeController::class, 'showEmployeeFile']);
    Route::delete('/nvrecruitnews/{id}', [NvRecruitNewsController::class, 'destroy']);
    Route::put('/nvrecruitnews/{id}', [NvRecruitNewsController::class, 'update']);
    // Route::delete('/nvrecruitcandidates/{nvrecruitcandidates}', [NvRecruitCandidatesController::class,'destroy']);
    //danh sách đơn xin nghỉ của nhân viên
    Route::get('/getemployeedayoff', [NvEmployeeDayOffController::class, 'getemployeedayoff'])->middleware(middlewareLogin::class);
    Route::post('/storeemployeedayoff', [NvEmployeeDayOffController::class, 'storeemployeedayoff']);
    Route::get('getdayoffdetail/{off_id}', [NvEmployeeDayOffController::class, 'getdayoffdetail']);
    Route::put('updatestatusdayoff/{off_id}/{off_status}', [NvEmployeeDayOffController::class, 'updatestatusdayoff'])->middleware(MiddlewareLoginLeader::class);
    Route::get('listdayoff/{employee_id}', [NvEmployeeDayOffController::class, 'listdayoff']);

    Route::get('listdayoff/{employee_id}', [NvEmployeeDayOffController::class, 'listdayoff']);
    Route::post('update_role_user', [NvEmployeeController::class, 'update_role_user']);
    //Department Team
    Route::get('getdepartmentteam/{department_id}', [NvDepartmentTeamController::class, 'getdepartmentteam']);
    Route::get('nvemployee', [NvEmployeeController::class, 'index'])->middleware(middlewareLogin::class);
    //User đang đăng nhập
    Route::get('/employeeLogin', [NvEmployeeController::class, 'employeeLogin'])->middleware(middlewareLogin::class);
    Route::put('/update-employee-login', [NvEmployeeController::class, 'updatEployeeLogin'])->middleware(middlewareLogin::class);
    Route::post('/updateEmployeeAvatar', [NvEmployeeController::class, 'updateEmployeeAvatar'])->middleware(middlewareLogin::class);
    Route::put('/update-employee-login', [NvEmployeeController::class, 'updatEployeeLogin'])->middleware(middlewareLogin::class);
    Route::put('/updateEmployeeAvatar', [NvEmployeeController::class, 'updateEmployeeAvatar'])->middleware(middlewareLogin::class);
    //danh sách nhân viên theo phòng ban
    Route::get('/employee_department', [NvEmployeeController::class, 'employee_department']);
    Route::get('/list_employee_department/{department_id}', [NvEmployeeController::class, 'list_employee_department'])->middleware(middlewareLogin::class);
    Route::get('delete_employee/{id}', [NvEmployeeController::class, 'delete_employee']);

});
// tài liệu
Route::group(['middleware' => 'api'], function () {
    Route::get('/all-document', [DocumentController::class, 'index'])->middleware(middlewareLogin::class);
    Route::post('/store-folder', [DocumentController::class, 'store_folder'])->middleware(middlewareLogin::class);
    Route::post('/store-file', [DocumentController::class, 'store_file'])->middleware(middlewareLogin::class);
    Route::post('/rename-folder/{id}', [DocumentController::class, 'rename_folder'])->middleware(middlewareLogin::class);
    Route::get('/delete-file/{id}', [DocumentController::class, 'delete_file'])->middleware(middlewareLogin::class);
    Route::get('/show-folder/{id}', [DocumentController::class, 'show_folder'])->middleware(middlewareLogin::class);
    Route::post('/store-folder-child/{id}', [DocumentController::class, 'store_folder_child'])->middleware(middlewareLogin::class);
    Route::post('/store-folder-file/{id}', [DocumentController::class, 'store_folder_file'])->middleware(middlewareLogin::class);
    Route::get('/check-download-file/{id}', [DocumentController::class, 'check_download_file'])->middleware(middlewareLogin::class);
    Route::get('/show-file-share/{id}', [DocumentController::class, 'show_file_share']);
    Route::get('/show-folder-share/{id}', [DocumentController::class, 'show_folder_share']);
    Route::post('/share-file/{id}', [DocumentController::class, 'share_file']);
    Route::post('/share-folder/{id}', [DocumentController::class, 'share_folder']);
    //Tài liệu của tôi
    Route::get('/my-document', [DocumentController::class, 'my_document'])->middleware(middlewareLogin::class);
    Route::get('/document-share-me', [DocumentController::class, 'document_share_me'])->middleware(middlewareLogin::class);
    Route::get('/document-trash', [DocumentController::class, 'document_trash'])->middleware(middlewareLogin::class);
    Route::get('/re-store/{id}', [DocumentController::class, 're_store'])->middleware(middlewareLogin::class);
    Route::get('/remove-file/{id}', [DocumentController::class, 'remove_file'])->middleware(middlewareLogin::class);
});
//groups
Route::prefix('groups')->group(function () {
    Route::get('get-all-group-parent', [GroupController::class, 'getAllGroupParent'])->middleware(middlewareLogin::class);
    Route::get('get-by-ceo', [GroupController::class, 'getAllProjectsAndTasksInGroups'])->middleware(MiddlewareLoginCeo::class);
    Route::get('get-by-user-id', [GroupController::class, 'getGroupByUserId'])->middleware(middlewareLogin::class);
    Route::post('create', [GroupController::class, 'create'])->middleware(middlewareLogin::class);
    Route::put('update/{group_id}', [GroupController::class, 'update'])->middleware(middlewareLogin::class);
    Route::delete('delete/{group_id}', [GroupController::class, 'delete'])->middleware(middlewareLogin::class);
    Route::get('get-group-by-parent-group-id/{parent_group_id}', [GroupController::class, 'getGroupByParentGroupId'])->middleware(middlewareLogin::class);
    Route::get('get-report-group-all', [GroupController::class, 'getReportGroupAll'])->middleware(MiddlewareLoginCeo::class);
    Route::post('get-reports-by-group-id/{group_id}', [GroupController::class, 'getReportsByGroupId'])->middleware(MiddlewareLoginCeo::class);
});
// projects
Route::prefix('projects')->group(function () {
    Route::post('create', [ProjectController::class, 'create'])->middleware(MiddlewareLoginLeader::class);
    Route::post('copy', [ProjectController::class, 'copyProject'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update/{project_id}', [ProjectController::class, 'update'])->middleware(MiddlewareLoginLeader::class);
    Route::get('get-by-ceo', [ProjectController::class, 'getProjectByCeo'])->middleware(MiddlewareLoginCeo::class);
    Route::post('member-join-project/{project_id}', [ProjectController::class, 'memberJoinProject'])->middleware(MiddlewareLoginLeader::class);
    Route::put('update-leader/{project_id}', [ProjectController::class, 'updateLeader'])->middleware(middlewareLogin::class);
    Route::put('update-name/{project_id}', [ProjectController::class, 'updateNameAndDescription'])->middleware(middlewareLogin::class);
    Route::put('update-type/{project_id}', [ProjectController::class, 'updateProjectType'])->middleware(middlewareLogin::class);
    Route::put('update-status/{project_id}', [ProjectController::class, 'updateStatus'])->middleware(middlewareLogin::class);
    Route::put('update-members/{project_id}', [ProjectController::class, 'updateMembers'])->middleware(middlewareLogin::class);
    Route::put('update-start-date/{project_id}', [ProjectController::class, 'updateStartDate'])->middleware(middlewareLogin::class);
    Route::put('update-end-date/{project_id}', [ProjectController::class, 'updateEndDate'])->middleware(middlewareLogin::class);
    Route::put('update-notify-before-end-time/{project_id}', [ProjectController::class, 'updateNotifyBeforeEndTime'])->middleware(middlewareLogin::class);
    Route::delete('delete/{project_id}', [ProjectController::class, 'delete'])->middleware(middlewareLogin::class);
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
    Route::post('create', [TaskController::class, 'create'])->middleware(middlewareLogin::class);
    Route::get('get-task-unfinished-by-user-id', [TaskController::class, 'getTaskUnfinishedByUserId'])->middleware(middlewareLogin::class);
    Route::delete('delete/{task_id}', [TaskController::class, 'delete'])->middleware(middlewareLogin::class);
    Route::get('get-task-by-project-id/{project_id}', [TaskController::class, 'getTaskByProjectId'])->middleware(middlewareLogin::class);
    Route::put('update-description/{task_id}', [TaskController::class, 'updateDescription'])->middleware(middlewareLogin::class);
    Route::put('update-name/{task_id}', [TaskController::class, 'updateName'])->middleware(middlewareLogin::class);
    Route::put(('update-progress/{task_id}'), [TaskController::class, 'updateProgress'])->middleware(middlewareLogin::class);
    Route::put('update-score-kpi/{task_id}', [TaskController::class, 'updateScoreKpi'])->middleware(middlewareLogin::class);
    Route::put('update-status/{task_id}', [TaskController::class, 'updateStatus'])->middleware(middlewareLogin::class);
    Route::put('update-priority/{task_id}', [TaskController::class, 'updatePriority'])->middleware(middlewareLogin::class);
    Route::put('update-start-date/{task_id}', [TaskController::class, 'updateStartDate'])->middleware(middlewareLogin::class);
    Route::put('update-end-date/{task_id}', [TaskController::class, 'updateEndDate'])->middleware(middlewareLogin::class);
    Route::put('update-members/{task_id}', [TaskController::class, 'updateMember'])->middleware(middlewareLogin::class);
});
// devices
Route::prefix('devices')->group(function () {
    Route::post('create', [DeviceController::class, 'createOrNotExit'])->middleware(middlewareLogin::class);
});
// notification
Route::prefix('notifications')->group(function () {
    Route::post('create', [NotificationController::class, 'create'])->middleware(MiddlewareLoginCeo::class);
    Route::get('get-notification-by-id/{notification_id}', [NotificationController::class, 'getNotificationById'])->middleware(middlewareLogin::class);
    Route::get('get-notification-by-user-id', [NotificationController::class, 'getNotificationByUserId'])->middleware(middlewareLogin::class);
    Route::get('get-notification-warning-by-user-id', [NotificationController::class, 'getNotificationWarningByUserId'])->middleware(middlewareLogin::class);
    Route::get('get-notification-by-user-id-paginate', [NotificationController::class, 'getNotificationByUserIdPaginate'])->middleware(middlewareLogin::class);
    Route::put('update-status/{notification_id}', [NotificationController::class, 'updateStatus'])->middleware(middlewareLogin::class);
});
//record
Route::prefix('records')->group(function () {
    Route::post('create', [RecordsController::class, 'create'])->middleware(middlewareLogin::class);
    Route::get('get-record-by-user-id', [RecordsController::class, 'getRecordByUserId'])->middleware(middlewareLogin::class);
    Route::delete('delete/{record_id}', [RecordsController::class, 'delete'])->middleware(middlewareLogin::class);
    Route::get('get-record-by-id/{record_id}', [RecordsController::class, 'getRecordById'])->middleware(middlewareLogin::class);
    Route::put('update-record-user-confirm/{record_id}', [RecordsController::class, 'updateRecordUserConfirm'])->middleware(middlewareLogin::class);
    Route::put('update-record-sender-confirm/{record_id}', [RecordsController::class, 'updateRecordSenderConfirm'])->middleware(middlewareLogin::class);
});
//social
Route::prefix('socials')->group(function () {
    //posts
    Route::post('posts/create', [PostController::class, 'create'])->middleware(middlewareLogin::class);
    Route::get('posts/get-by-id/{post_id}', [PostController::class, 'getById'])->middleware(middlewareLogin::class);
    Route::get('posts/get-all', [PostController::class, 'getAll'])->middleware(middlewareLogin::class);

});

