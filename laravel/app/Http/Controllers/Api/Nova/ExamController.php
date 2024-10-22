<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use Illuminate\Support\Facades\Storage;

use function Laravel\Prompts\error;

class ExamController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'time' => 'required|integer',
                'status' => 'required|boolean',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('exams', 'public');
            }

            if (!$request->name) {
                return response()->json([
                    'message' => 'Thiếu tiêu đề.',
                    'error' => true,
                    'exam' => null,
                ], 400);
            }

            // Tạo đề thi mới
            $exam = Exam::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'image' => $imagePath,
                'time' => $request->input('time'),
                'status' => $request->input('status'),
            ]);

            // Trả về phản hồi thành công
            return response()->json([
                'message' => 'Đề thi đã được tạo thành công.',
                'error' => false,
                'exam' => $exam,
            ], 201); // Trả về mã 201 Created
        } catch (\Exception $e) {
            return response()->json([
                'message' =>  $e->getMessage(),
                'error' => true,
                'exam' => null,
            ], 400); // Trả về mã 201 Created
        }
    }

    public function index()
    {
        try {
            // Lấy tất cả exams
            $exams = Exam::all();

            // Trả về danh sách exams dưới dạng JSON
            return response()->json([
                'message' => 'Danh sách đề thi',
                'exams' => $exams,
                'error' => false,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'exams' => null,
            ], 500);
        }
    }


    public function destroy($id)
    {
        try {
        $exam = Exam::find($id);

        if (!$exam) {
            return response()->json([
                'error' => true,
                'message' => 'Bài kiểm tra không tồn tại.',
            ], 404);
        }
        if ($exam->image) {
            Storage::disk('public')->delete($exam->image);
        }

        $exam->delete();

        // Trả về phản hồi JSON
        return response()->json([
            'error' => false,
            'message' => 'Xóa bài kiểm tra thành công!',
        ], 200);
        } catch (\Throwable $th) {
           return $th->getMessage();
        }
    }

    public function getNameExam($id){
        try {
             // Tìm kiếm bài kiểm tra theo ID
             $exam = Exam::find($id);
        
             // Kiểm tra nếu bài kiểm tra không tồn tại
             if (!$exam) {
                 return response()->json(['error' => 'Bài kiểm tra không tồn tại.'], 404);
             }
     
             // Trả về tên bài kiểm tra
             return response()->json(['name' => $exam->name]);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }
}
