<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Answer;
use App\Models\EmployeeExamUser;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

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

    public function getNameExam($id)
    {
        try {
            $exam = Exam::find($id);
            if (!$exam) {
                return response()->json(['error' => 'Bài kiểm tra không tồn tại.'], 404);
            }
            return response()->json(['name' => $exam->name]);
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function update(Request $request, $id)
    {

        try {
            $exam = Exam::findOrFail($id);
            $rules = [
                'description' => 'nullable|string',
                'time' => 'integer',
                'status' => 'boolean',
            ];

            $messages = [
                'description.string' => 'Mô tả phải là một chuỗi ký tự.',
                'image.image' => 'Tệp phải là hình ảnh.',
                'image.mimes' => 'Hình ảnh phải có định dạng jpeg, png, jpg, gif, hoặc svg.',
                'image.max' => 'Kích thước hình ảnh không được vượt quá 2MB.',
                'time.required' => 'Thời gian là trường bắt buộc.',
                'time.integer' => 'Thời gian phải là số nguyên.',
                'status.required' => 'Trạng thái là trường bắt buộc.',
                'status.boolean' => 'Trạng thái phải là true hoặc false.',
            ];
            $validator = Validator::make($request->all(), $rules, $messages);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $imagePath = $exam->image;
            if ($request->hasFile('image')) {
                if ($exam->image) {
                    Storage::disk('public')->delete($exam->image);
                }
                $imagePath = $request->file('image')->store('exams', 'public');
            }
            $exam->update([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'image' => $imagePath,
                'time' => $request->input('time'),
                'status' => $request->input('status'),
            ]);

            return response()->json([
                'message' => 'Đề thi đã được cập nhật thành công.',
                'error' => false,
                'exam' => $exam,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'exam' => null,
            ], 400);
        }
    }

    public function upload(Request $request)
    {
        if ($request->hasFile('upload')) {
            // Lưu ảnh vào thư mục public
            $path = $request->file('upload')->store('uploads', 'public');

            // Tạo đường dẫn đầy đủ cho ảnh
            $url = Storage::url($path);

            return response()->json([
                'uploaded' => true,
                'url' => $url,
            ]);
        }

        return response()->json(['uploaded' => false, 'error' => ['message' => 'Upload failed.']], 400);
    }

    public function StoreResult(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exam_id' => 'required|exists:employee_exam,id',
            'list_question' => 'required',
            'selected_answers' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors(),
            ], 422);
        }

        try {

            $answers = Answer::whereIn('id', $request->input('selected_answers'))->get();
            $point = 0;
            foreach ($answers as $answer) {
                if ($answer->result === 1) {
                    $point++;
                }
            }
            $result = new EmployeeExamUser();
            $result->user_id = Auth::id();
            $result->exam_id = $request->input('exam_id');
            $result->list_question = json_encode($request->input('list_question'));
            $result->selected_answers = json_encode($request->input('selected_answers'));
            $result->point = $point;
            $result->save();
            return response()->json([
                'status' => 'success',
                'message' => 'Kết quả đã được lưu thành công',
                'data' => $result,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getExamUserResult($id)
    {
        $examResult = EmployeeExamUser::with(['exam', 'list_questions.answers'])
            ->findOrFail($id);
        $exam = $examResult->exam;
        $listQuestionIds = json_decode($examResult->list_question);
        $selectedAnswers = json_decode($examResult->selected_answers);
        $questions = Question::with('answers')
            ->whereIn('id', $listQuestionIds)
            ->get();
        $questionData = $questions->map(function ($question) use ($selectedAnswers) {
            return [
                'question_id' => $question->id,
                'question_name' => $question->name,
                'answers' => $question->answers,
            ];
        });

        $data = [
            'exam_name' => $exam->name,
            'questions' => $questionData,
            'selected_answers' => $selectedAnswers,
            'total_points' => $examResult->point,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ], 200);
    }


    // lấy ra danh sách bài thi đã làm của bài thi đó
    public function getListUserExam($examId)
    {
        $exam = Exam::findOrFail($examId);
        $examResults = EmployeeExamUser::with('user')
            ->where('exam_id', $examId)
            ->get();
        $data = [
            'exam_name' => $exam->name,
            'exam_results' => $examResults->map(function ($result) {
                return [
                    'id' => $result->id,
                    'user_name' => $result->user->name,
                    'total_points' => $result->point,
                ];
            }),
        ];
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ], 200);
    }
}
