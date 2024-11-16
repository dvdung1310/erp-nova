<?php

namespace App\Http\Controllers\Api\Nvt;

use App\Http\Controllers\Controller;
use App\Models\NvtStudentModel;
use App\Models\NvtStudentStatusModel;
use App\Models\NvtTrialClassScheduleModel;
use App\Models\User;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    public function student_trial_class($id)
    {
        try {
            $student_trial = NvtTrialClassScheduleModel::join('nvt_student', 'nvt_trial_class_schedule.student_id', '=', 'nvt_student.student_id')
                ->join('users', 'nvt_trial_class_schedule.teacher_id', '=', 'users.id')
                ->join('nvt_student_status', 'nvt_trial_class_schedule.status_id', '=', 'nvt_student_status.status_id')
                ->select('nvt_trial_class_schedule.*', 'nvt_student.student_name', 'users.name', 'nvt_student_status.status_name')
                ->where('nvt_trial_class_schedule.student_id', $id)->orderBy('trial_date', 'desc')->get();

            $teacher = User::get();  // Danh sách giáo viên
            $student_status = NvtStudentStatusModel::where('status_type', 0)->get(); // Nếu cần, có thể sử dụng

            return [
                'success' => true,
                'message' => 'Danh sách khách học thử',
                'data' => $student_trial,
                'teacher' => $teacher,
                'student_status' => $student_status
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy danh sách học thử',
                'error' => $e->getMessage(),
            ];
        }
    }

    public function store_trial_class(Request $request)
    {
        try {
            // Tạo mới một lịch học thử
            $data = new NvtTrialClassScheduleModel();
            $data['trial_subject'] = $request->trial_subject;
            $data['student_id'] = $request->student_id;
            $data['teacher_id'] = $request->teacher_id;
            $data['trial_subject'] = $request->trial_subject;
            $data['trial_date'] = $request->trial_date;
            $data['status_id'] = 1; // Trạng thái mặc định
            $data->save();

            // Gọi hàm student_trial_class để lấy lại danh sách học thử của học sinh sau khi thêm mới
            $student_trial = $this->student_trial_class($request->student_id);  // Truyền ID học sinh
            return response()->json([
                'success' => true,
                'message' => 'Thêm mới học thử thành công',
                'data' => $student_trial['data'],
                'teacher' => $student_trial['teacher'],
                'student_status' => $student_trial['student_status'],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thêm mới học thử thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_trial_class(Request $request, $id)
    {
        try {
            $trial_id  = $id;
            $data = NvtTrialClassScheduleModel::findOrFail($trial_id);
            $data->trial_subject = $request->trial_subject;
            $data->teacher_id = $request->teacher_id;
            $data->trial_date = $request->trial_date;
            $data->status_id = $request->status_id;
            $data->save();
            $student_trial = $this->student_trial_class($request->student_id);  // Truyền ID học sinh

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thành công',
                'data' => $student_trial['data'],
                'teacher' => $student_trial['teacher'],
                'student_status' => $student_trial['student_status'],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function get_comment_parent($id){
        try {
            $studentNote = NvtStudentModel::where('student_id', $id)->pluck('student_note')->first();
            return response()->json([
                'success' => true,
                'message' => 'Thêm nội dung trao đổi thành công',
                'data' => $studentNote
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thêm nội dung trao đổi thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function update_comment_parient(Request $request, $id)
    {
        try {
            // Lấy dữ liệu từ request (bình luận gửi lên)
            $newComment = $request->student_note;
            // Tìm sinh viên trong cơ sở dữ liệu
            $student = NvtStudentModel::where('student_id', $id)->first();
            // Kiểm tra nếu trường student_note đã có dữ liệu
            if ($student->student_note) {
                // Nếu đã có bình luận trước đó, nối thêm bình luận mới
                $studentNote = $student->student_note . '<br>' . $newComment;
            } else {
                // Nếu chưa có bình luận, tạo mới
                $studentNote = $newComment;
            }
            // Cập nhật lại trường student_note
            $student->student_note = $studentNote;
            $student->save();
            $studentNote = NvtStudentModel::where('student_id', $id)->pluck('student_note')->first();
            return response()->json([
                'success' => true,
                'message' => 'Thêm nội dung trao đổi thành công',
                'data' => $studentNote
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thêm nội dung trao đổi thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
   
    
    
}
