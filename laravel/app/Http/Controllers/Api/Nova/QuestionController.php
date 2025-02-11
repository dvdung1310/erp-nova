<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Exam;
use App\Models\EmployeeQuestionExamDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
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

    public function storeQuestionDocument(Request $request)
    {
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('questions', 'public');
        }
        $question = Question::create([
            'name' => $request->name,
            'type' => 2,
            'file' => $imagePath,
            'status' => 1,
            'exam_id' => $request->exam_id,
        ]);


        if ($question) {
            return response()->json([
                'message' => 'Đề thi đã được tạo thành công.',
            ], 201);
        }
    }

    public function getQuestionsWithAnswers($exam_id)
    {
        try {
            $documents = EmployeeQuestionExamDocument::where('exam_id', $exam_id)
                ->with(['question.answers'])
                ->get();
            if ($documents->isEmpty()) {
                return response()->json([
                    'message' => 'Không tìm thấy câu hỏi nào cho đề thi này.',
                    'error' => true,
                ], 404);
            }

            $questions = $documents->map(function ($document) {
                $question = $document->question; // Lấy thông tin câu hỏi
                return [
                    'question_id' => $question->id,
                    'question_name' => $question->name,
                    'file' => $question->file,
                    'type' => $question->type,
                    'answers' => $question->type == 2
                        ? [] // Không có câu trả lời nếu type == 2
                        : $question->answers->map(function ($answer) {
                            return [
                                'answer_id' => $answer->id,
                                'answer_name' => $answer->name,
                                'result' => $answer->result,
                            ];
                        }),
                ];
            });

            $exam = Exam::findOrFail($exam_id);

            $data = [
                'exam_id' => $exam->id,
                'exam_name' => $exam->name,
                'exam_time' => $exam->time,
                'questions' => $questions,
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

    public function getQuestionsOrDocument($exam_id)
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
                        'file' => $question->file,
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
        // return $request->all();
        $request->validate([
            'question_id' => 'required|integer',
            'question_name' => 'required|string|max:255',
            'answers' => 'required|array|min:4|max:4',
            'answers.*.id' => 'required|integer',
            'answers.*.answer_name' => 'required|string|max:255',
            'answers.*.result' => 'required|integer|min:0|max:1',
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

        foreach ($request->answers as $answerData) {
            $answer = Answer::where('question_id', $question->id)
                ->where('id', $answerData['id'])
                ->first();

            if ($answer) {
                $answer->name = $answerData['answer_name'];
                $answer->result = $answerData['result'] == 1 ? 1 : 0;
                $answer->save();
            } else {
                return response()->json(['error' => 'Đáp án không tồn tại!'], 404);
            }
        }

        return response()->json(['success' => 'Cập nhật câu hỏi thành công!'], 200);
    }

    public function UpdateQuestionDocument(Request $request)
    {

        $validatedData = $request->validate([
            'question_id' => 'required|exists:employee_questions,id',
            'name' => 'required|string|max:255',
        ]);
       
        try {
            $question = Question::where('id',$validatedData['question_id'])->first();
            $question->name = $validatedData['name'];
            $imagePath = $question->file;
            if ($request->hasFile('image')) {
                if ($question->file) {
                    Storage::disk('public')->delete($question->file);
                }
                $imagePath = $request->file('image')->store('exams', 'public');
            }
            $question->file = $imagePath;
            $question->save();
            return response()->json([
                'status' => 200,
                'message' => 'Cập nhật câu hỏi thành công!',
                'data' => $question
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Đã xảy ra lỗi trong quá trình cập nhật!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function questionName(Request $request)
    {
        $htmlContent = $request->input('text');
        $dom = new \DOMDocument();
        @$dom->loadHTML($htmlContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $images = $dom->getElementsByTagName('img');
        foreach ($images as $image) {
            $src = $image->getAttribute('src');
            if (strpos($src, 'data:image') === 0) {
                $imageData = explode(',', $src)[1];
                $imageData = base64_decode($imageData);
                $path = 'questions/' . uniqid() . '.png';
                \Storage::disk('public')->put($path, $imageData);
                $image->setAttribute('src', \Storage::disk('public')->url($path));
            }
        }
        $updatedContent = $dom->saveHTML();
        return $updatedContent;
        return response()->json(['message' => 'Content saved successfully']);
    }

    public function getAllQuestion($examId)
    {
        $exams = Exam::whereIn('type', [1, 2])->where('status', 1)->orderBy('created_at', 'desc')
            ->with('questions')
            ->get();

        $nameExam = Exam::where('id', $examId)->pluck('name')->first();

        $questionExamDocument = EmployeeQuestionExamDocument::where('exam_id', $examId)
            ->with('question')
            ->get();

        return [
            'exams' => $exams,
            'nameExam' => $nameExam,
            'questionExamDocument' => $questionExamDocument,
        ];
    }

    public function storeOrUpdateQuestionExamDocument(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'exam_id' => 'required|integer|exists:employee_exam,id',
            'question_ids' => 'required|array',
            'question_ids.*' => 'integer|exists:employee_questions,id',
        ]);

        $examId = $validated['exam_id'];
        $questionIds = $validated['question_ids'];
        $existingRecord = EmployeeQuestionExamDocument::where('exam_id', $examId)->first();

        if ($existingRecord) {
            EmployeeQuestionExamDocument::where('exam_id', $examId)->delete();
        }

        foreach ($questionIds as $questionId) {
            EmployeeQuestionExamDocument::create([
                'exam_id' => $examId,
                'question_id' => $questionId,
            ]);
        }

        return response()->json(['message' => 'Cập nhật và lưu thành công!'], 200);
    }
}
