<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(Request $request)
{
    try {
        // Thực hiện validate
        $validatedData = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'name' => 'required|string|max:255',
            'answers' => 'required|array',
            'answers.*' => 'required|string|max:255',
            'result' => 'required|array|size:4',
            'result.*' => 'required|boolean',
        ], [
            'exam_id.required' => 'Mã đề thi không được để trống.',
            'exam_id.exists' => 'Đề thi không hợp lệ.',
            'name.required' => 'Câu hỏi không được để trống.',
            'answers.required' => 'Phải có câu trả lời.',
            'answers.*.required' => 'Câu trả lời không được để trống.',
            'result.required' => 'Phải có kết quả cho mỗi câu trả lời.',
            'result.*.boolean' => 'Kết quả phải là true hoặc false.',
        ]);

        // Tạo câu hỏi
        $question = Question::create([
            'name' => $request->name,
            'exam_id' => $request->exam_id,
        ]);

        // Tạo các đáp án
        foreach ($request->answers as $index => $answer) {
            Answer::create([
                'name' => $answer,
                'result' => $request->result[$index],
                'question_id' => $question->id,
            ]);
        }

        // Trả về phản hồi thành công
        return response()->json([
            'message' => 'Đề thi đã được tạo thành công.',
            'error' => false,
        ], 201); // Trả về mã 201 Created
    } catch (\Illuminate\Validation\ValidationException $e) {
        // Bắt lỗi validate và trả về phản hồi JSON
        return response()->json([
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $e->errors(), // Trả về các lỗi validate
            'error' => true,
        ], 422); // Mã 422 Unprocessable Entity
    } catch (\Throwable $th) {
        return response()->json([
            'message' => 'Đã xảy ra lỗi trong quá trình tạo đề thi.',
            'error' => true,
        ], 500); // Mã 500 Internal Server Error
    }
}

}
