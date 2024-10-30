<?php

namespace App\Http\Controllers\Api\Nova;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Nova\NvRecruitCandidatesResource;
use App\Models\CrmRecruitCandidatesModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NvRecruitCandidatesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => CrmRecruitCandidatesModel::paginate(10)
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
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
        try {
            // Kiểm tra và xử lý file upload
            $cvPath = null; // Biến để lưu đường dẫn file

            if ($request->hasFile('candidates_cv')) {
                $file = $request->file('candidates_cv');

                // Kiểm tra xem file có hợp lệ không
                if ($file->isValid()) {
                    // Lưu file vào thư mục 'uploads/cvs' trong storage
                    $cvPath = $file->store('uploads/cvs', 'public');
                }
            }

            // Tạo ứng viên mới và lưu thông tin vào database
            $candidate = CrmRecruitCandidatesModel::create([
                'candidates_name' => $request->input('candidates_name'),
                'candidates_phone' => $request->input('candidates_phone'),
                'candidates_email' => $request->input('candidates_email'),
                'candidates_feedback' => $request->input('candidates_feedback'),
                'news_id' => $request->input('news_id'),
                'candidates_status' => 0,
                'candidates_cv' => $cvPath, // Lưu đường dẫn file vào database
            ]);

            return response()->json([
                'error' => false,
                'message' => 'Ứng viên được lưu thành công.',
                'data' => $candidate,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Không thể lưu ứng viên: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CrmRecruitCandidatesModel $nvrecruitcandidates)
    {
        try {

            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvrecruitcandidates
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CrmRecruitCandidatesModel $nvrecruitcandidates)
    {
        try {

            return response()->json([
                'error' => false,
                'message' => 'Customers retrieved successfully.',
                'data' => $nvrecruitcandidates
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'No customers found.',
                'data' => []
            ]);
        }
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $candidate = CrmRecruitCandidatesModel::findOrFail($id);
            $cvPath = $candidate->candidates_cv;
            // Kiểm tra nếu có file mới được tải lên
            if ($request->hasFile('candidates_cv')) {
                // Xóa CV cũ nếu tồn tại
                if ($cvPath) {
                    Storage::disk('public')->delete($cvPath);
                }
                $file = $request->file('candidates_cv');
                if ($file->isValid()) {
                    $cvPath = $file->store('uploads/cvs', 'public');
                }
            }
            $updateData = [
                'candidates_name' => $request->input('candidates_name', $candidate->candidates_name),
                'candidates_phone' => $request->input('candidates_phone', $candidate->candidates_phone),
                'candidates_email' => $request->input('candidates_email', $candidate->candidates_email),
                'candidates_feedback' => $request->input('candidates_feedback', $candidate->candidates_feedback),
                'news_id' => $request->input('news_id', $candidate->news_id),
                'candidates_cv' => $cvPath,
            ];
            $candidate->update($updateData);
            return response()->json([
                'error' => false,
                'message' => 'Candidate updated successfully.',
                'data' => $candidate,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Could not update candidate: ' . $e->getMessage(),
                'data' => [],
            ], 400);
        }
    }
    public function destroy($nvrecruitcandidates)
    {
        try {
            $data = CrmRecruitCandidatesModel::where('candidates_id', $nvrecruitcandidates)->delete();
            // Fetch the updated list of candidates
            $candidates = CrmRecruitCandidatesModel::paginate(10);

            return response()->json([
                'error' => false,
                'message' => 'Candidate deleted successfully.',
                'data' => $candidates // Return the updated data
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => true,
                'message' => 'Could not delete candidate.',
                'data' => []
            ]);
        }
    }
}
