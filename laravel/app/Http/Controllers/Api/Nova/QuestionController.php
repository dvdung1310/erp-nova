<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    public function store(Request $request)
    {

        try {
            $validatedData = $request->validate([
                'exam_id' => 'required|exists:employee_exam,id',
                'name' => 'required|string|max:255',
                'answers' => 'required|array',
                'answers.*' => 'required|string|max:255',
                'result' => 'required|array|size:4',
                'result.*' => 'required|integer|in:0,1',
            ], [
                'exam_id.required' => 'Mã đề thi không được để trống.',
                'exam_id.exists' => 'Đề thi không hợp lệ.',
                'name.required' => 'Câu hỏi không được để trống.',
                'answers.required' => 'Phải có câu trả lời.',
                'answers.*.required' => 'Câu trả lời không được để trống.',
                'result.required' => 'Phải có kết quả cho mỗi câu trả lời.',
                'result.*.integer' => 'Kết quả phải là số nguyên.',
                'result.*.in' => 'Kết quả phải là 0 hoặc 1.',
            ]);

            $question = Question::create([
                'name' => $validatedData['name'],
                'exam_id' => $validatedData['exam_id'],
            ]);

            foreach ($validatedData['answers'] as $index => $answer) {
                try {
                    Answer::create([
                        'name' => $answer,
                        'result' => $validatedData['result'][$index], // Sử dụng validated data
                        'question_id' => $question->id,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Error saving answer: ' . $e->getMessage());
                    return response()->json([
                        'message' => 'Lỗi khi lưu câu trả lời.',
                        'error' => true,
                    ], 500);
                }
            }

            return response()->json([
                'message' => 'Đề thi đã được tạo thành công.',
                'error' => false,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(), // Trả về chi tiết lỗi
                'error' => true,
            ], 422);
        } catch (\Throwable $th) {
            Log::error('Unexpected error: ' . $th->getMessage());
            return response()->json([
                'message' => 'Đã xảy ra lỗi trong quá trình tạo đề thi.',
                'error' => true,
            ], 500);
        }
    }

    public function getQuestionsWithAnswers($exam_id)
    {
        try {
            $exam = Exam::with(['questions.answers'])->findOrFail($exam_id);

            $data = [
                'exam_id' => $exam->id,
                'exam_name' => $exam->name,
                'exam_time' => $exam->time,
                'questions' => $exam->questions->map(function ($question) {
                    return [
                        'question_id' => $question->id,
                        'question_name' => $question->name,
                        'answers' => $question->answers->map(function ($answer) {
                            return [
                                'answer_id' => $answer->id,
                                'answer_name' => $answer->name,
                                'result' => $answer->result,
                            ];
                        }),
                    ];
                }),
            ];

            return response()->json([
                'message' => 'Danh sách câu hỏi và câu trả lời.',
                'data' => $data,
                'error' => false,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không tìm thấy đề thi hoặc xảy ra lỗi.',
                'error' => true,
            ], 404);
        }
    }

    public function DeleteQuestion($id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json(['error' => 'Không tìm thấy câu hỏi.'], 404);
        }
        Answer::where('question_id', $question->id)->delete();
        $question->delete();
        return response()->json(['success' => 'Xóa câu hỏi thành công!'], 200);
    }

    public function UpdateQuestion(Request $request)
    {
        $request->validate([
            'question_id' => 'required|integer',
            'question_name' => 'required|string|max:255',
            'answers_0_id' => 'required|integer',
            'answers_1_id' => 'required|integer',
            'answers_2_id' => 'required|integer',
            'answers_3_id' => 'required|integer',
            'answers_0_answer_name' => 'required|string|max:255',
            'answers_1_answer_name' => 'required|string|max:255',
            'answers_2_answer_name' => 'required|string|max:255',
            'answers_3_answer_name' => 'required|string|max:255',
            'answers_0_result' => 'required|integer|min:0|max:1',
            'answers_1_result' => 'required|integer|min:0|max:1',
            'answers_2_result' => 'required|integer|min:0|max:1',
            'answers_3_result' => 'required|integer|min:0|max:1',
        ]);

        // Tìm câu hỏi dựa trên ID
        $question = Question::find($request->question_id);

        if (!$question) {
            return response()->json(['error' => 'Câu hỏi không tồn tại!'], 404);
        }

        // Cập nhật tên câu hỏi
        $question->name = $request->question_name;
        $question->save();

        $answers = [
            [
                'id' => $request->answers_0_id,
                'answer_name' => $request->answers_0_answer_name,
                'result' => $request->answers_0_result
            ],
            [
                'id' => $request->answers_1_id,
                'answer_name' => $request->answers_1_answer_name,
                'result' => $request->answers_1_result
            ],
            [
                'id' => $request->answers_2_id,
                'answer_name' => $request->answers_2_answer_name,
                'result' => $request->answers_2_result
            ],
            [
                'id' => $request->answers_3_id,
                'answer_name' => $request->answers_3_answer_name,
                'result' => $request->answers_3_result
            ],
        ];

        foreach ($answers as $answerData) {
            $answer = Answer::where('question_id', $question->id)
                ->where('id', $answerData['id'])
                ->first();

            if ($answer) {
                // Cập nhật tên đáp án
                $answer->name = $answerData['answer_name'];
                // Cập nhật kết quả
                $answer->result = $answerData['result'] == 1 ? 1 : 0; // Giả sử 1 là đúng, 0 là sai
                $answer->save();
            } else {
                return response()->json(['error' => 'Đáp án không tồn tại!'], 404);
            }
        }

        return response()->json(['success' => 'Cập nhật câu hỏi thành công!'], 200);
    }
}
