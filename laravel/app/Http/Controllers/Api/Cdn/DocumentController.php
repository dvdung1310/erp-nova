<?php

namespace App\Http\Controllers\Api\Cdn;

use App\Http\Controllers\Controller;
use App\Models\CdnFileModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $user_id = auth()->user()->id;
            $document_folder = CdnFileModel::where('is_folder', 1)->where('is_deleted', 0)->where('parent_id', null)->orderBy('id', 'desc')->get();
            $document_file = CdnFileModel::where('is_folder', 0)->where('is_deleted', 0)->where('parent_id', null)->orderBy('id', 'desc')->get();
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục thành công',
                'document_folder' => $document_folder,
                'document_file' => $document_file,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo thư mục thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function show_folder($id)
    {
        try {
            $user_id = auth()->user()->id;
            $document_folder = CdnFileModel::where('is_folder', 1)->where('is_deleted', 0)->where('parent_id', $id)->orderBy('id', 'desc')->get();
            $document_file = CdnFileModel::where('is_folder', 0)->where('is_deleted', 0)->where('parent_id', $id)->orderBy('id', 'desc')->get();
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục thành công',
                'document_folder' => $document_folder,
                'document_file' => $document_file,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo thư mục thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function check_download_file($id)
    {
        try {
            $user_id = auth()->user()->id;
            // Kiểm tra điều kiện: người tạo file hoặc người được chia sẻ với quyền tải xuống
            $check_rule = CdnFileModel::leftjoin('cdn_file_share', 'cdn_file.id', '=', 'cdn_file_share.file_id')
                ->where('cdn_file.id', $id) // Kiểm tra theo ID của file
                ->where(function ($query) use ($user_id) {
                    // Nhóm các điều kiện liên quan đến quyền truy cập file
                    $query->where('cdn_file.created_by', $user_id) // Người tạo file
                        ->orWhere(function ($query) use ($user_id) {
                            $query->where('cdn_file_share.user_id', $user_id) // Người được chia sẻ quyền
                                ->where('cdn_file_share.can_download', 1); // Người đó có quyền tải xuống
                        });
                })
                ->first();

            // Kiểm tra nếu có kết quả thỏa mãn điều kiện
            if ($check_rule) {
                return response()->json([
                    'can_download' => true,
                    'file_id' => $id,
                    'file_url' => url($check_rule->file_storage_path) // Trả về URL đầy đủ của file
                ]);
            } else {
                return response()->json([
                    'can_download' => false,
                    'message' => 'Bạn không có quyền tải file này.'
                ], 403); // Trả về lỗi nếu không thỏa mãn điều kiện
            }
        } catch (\Exception $e) {
            return response()->json([
                'can_download' => false,
                'message' => 'Bạn không có quyền tải file này.',
                'error' => $e->getMessage(),
            ], 403); // Trả về lỗi nếu không thỏa mãn điều kiện
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
    public function store_folder(Request $request)
    {
        try {
            $request->validate([
                'file_name' => 'required|string|max:255',
            ]);
            $user_id = auth()->user()->id;
            $data = new CdnFileModel();
            $data['file_name'] = $request->file_name;
            $data['is_folder'] = 1;
            // $data['parent_id'] = $request->parent_id;
            $data['created_by'] = $user_id;
            $data['updated_by'] = $user_id;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo thư mục thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_folder_child(Request $request, $id)
    {
        try {
            $request->validate([
                'file_name' => 'required|string|max:255',
            ]);
            $user_id = auth()->user()->id;
            $data = new CdnFileModel();
            $data['file_name'] = $request->file_name;
            $data['is_folder'] = 1;
            $data['parent_id'] = $id;
            $data['created_by'] = $user_id;
            $data['updated_by'] = $user_id;
            $data->save();
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo thư mục thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store_file(Request $request)
    {
        try {
            $user_id = auth()->user()->id;

            // Xác thực file được tải lên
            $request->validate([
                'files.*' => 'required|file|mimes:jpg,png,pdf,docx,txt,xls,xlsx|max:10240', // Thêm xls, xlsx vào mimes
            ]);

            // Mảng để lưu thông tin các tệp đã tải lên
            $uploadedFiles = [];

            foreach ($request->file('files') as $file) {
                // Lưu file vào thư mục public và lấy đường dẫn lưu trữ tệp trên server
                $filePath = $file->store('uploads/document', 'public');  // Lưu vào thư mục public/uploads

                // Tạo URL xem trước cho file (nếu là file Word hoặc Excel)
                $previewUrl = null;

                if (in_array($file->getClientOriginalExtension(), ['docx', 'xls', 'xlsx'])) {
                    // Tạo URL Google Docs Viewer để xem trước
                    $previewUrl = 'https://docs.google.com/gview?url=' . urlencode(Storage::url($filePath)) . '&embedded=true';
                }

                // Lưu thông tin vào database
                $fileRecord = CdnFileModel::create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'file_type' => $file->getClientMimeType(),
                    'file_path' => $file->getClientOriginalName(), // Lưu tên file gốc
                    'file_storage_path' => Storage::url($filePath), // Lưu đường dẫn URL đến tệp
                    'file_preview_url' => $previewUrl, // Lưu đường dẫn preview (nếu có)
                    'is_folder' => 0,  // 0 vì đây là file không phải thư mục
                    'created_by' => $user_id,
                    'updated_by' => $user_id,
                ]);

                $uploadedFiles[] = $fileRecord;
            }

            return response()->json([
                'success' => true,
                'message' => 'Tải tệp lên thành công!',
                'files' => $uploadedFiles,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tải tệp thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function store_folder_file(Request $request, $id)
    {
        try {
            $user_id = auth()->user()->id;

            // Kiểm tra và validate
            $request->validate([
                'files.*' => 'required|file|mimes:jpg,png,pdf,docx,txt,xls,xlsx|max:10240',
            ]);

            if (!$request->hasFile('files')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có tệp nào được tải lên.',
                ], 400);
            }

            $uploadedFiles = [];
            foreach ($request->file('files') as $file) {
                try {
                    // Lưu file
                    $filePath = $file->store('uploads/document', 'public');

                    // Tạo URL xem trước
                    $previewUrl = null;
                    if (in_array($file->getClientOriginalExtension(), ['docx', 'xls', 'xlsx'])) {
                        $previewUrl = 'https://docs.google.com/gview?url=' . urlencode(Storage::url($filePath)) . '&embedded=true';
                    }

                    // Lưu vào database
                    $fileRecord = CdnFileModel::create([
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'file_type' => $file->getClientMimeType(),
                        'file_path' => $filePath, // Sử dụng đường dẫn thực tế
                        'file_storage_path' => Storage::url($filePath),
                        'file_preview_url' => $previewUrl,
                        'parent_id' => $id,
                        'is_folder' => 0,
                        'created_by' => $user_id,
                        'updated_by' => $user_id,
                    ]);

                    $uploadedFiles[] = $fileRecord;
                } catch (\Exception $e) {
                    $uploadedFiles[] = [
                        'file_name' => $file->getClientOriginalName(),
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tải tệp lên thành công!',
                'files' => $uploadedFiles,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tải tệp thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function rename_folder(Request $request, $id)
    {
        $request->validate([
            'file_name' => 'required|string|max:255',
        ]);
        try {
            $user_id = auth()->user()->id;
            $folder = CdnFileModel::findOrFail($id);
            $folder->file_name = $request->file_name;
            $folder->updated_by = $user_id;
            $folder->save();
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật Folder thành công!',
                'files' => $folder,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật Folder thất bại!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function delete_file($id)
    {
        try {
            $file = CdnFileModel::find($id);

            // Nếu file không tồn tại
            if (!$file) {
                return response()->json([
                    'success' => false,
                    'message' => 'File không tồn tại!',
                ], 404);
            }
            // Cập nhật trạng thái của file thành xóa tạm thời
            $file->is_deleted = 1;
            $file->deleted_at = now(); // Thời gian hiện tại
            $file->save();

            return response()->json([
                'success' => true,
                'message' => 'File đã được xóa tạm thời và chuyển vào thùng rác!',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xóa file tạm thời thất bại! ' . $e->getMessage(),
            ], 500);
        }
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
}
