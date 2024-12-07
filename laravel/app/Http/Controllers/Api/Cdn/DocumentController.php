<?php

namespace App\Http\Controllers\Api\Cdn;

use App\Http\Controllers\Controller;
use App\Models\CdnFileModel;
use App\Models\CdnFilePermissionModel;
use App\Models\CdnFileShareModel;
use App\Models\User;
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
            $document_folder = CdnFileModel::where('is_folder', 1)->where('is_deleted', 0)->where('parent_id', null)->orderBy('id', 'desc')->where('created_by', $user_id)->get();
            $document_file = CdnFileModel::where('is_folder', 0)->where('is_deleted', 0)->where('parent_id', null)->orderBy('id', 'desc')->where('created_by', $user_id)->get();
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
    public function my_document()
    {
        try {
            $user_id = auth()->user()->id;
            $document_folder = CdnFileModel::where('is_folder', 1)->where('is_deleted', 0)->where('parent_id', null)->where('created_by', $user_id)->orderBy('id', 'desc')->get();
            $document_file = CdnFileModel::where('is_folder', 0)->where('is_deleted', 0)->where('parent_id', null)->where('created_by', $user_id)->orderBy('id', 'desc')->get();
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
    public function document_share_me()
    {
        try {
            $user_id = auth()->user()->id;
            $document_folder = CdnFileModel::leftjoin('cdn_file_permissions', 'cdn_file.id', '=', 'cdn_file_permissions.file_id')
                ->select('cdn_file.*', 'cdn_file_permissions.user_id', 'cdn_file_permissions.permission')
                ->where('is_folder', 1)->where('is_deleted', 0)->where('parent_id', null)
                ->where('created_by', $user_id)->orderBy('id', 'desc')
                ->where('cdn_file_permissions.user_id', $user_id)
                ->get();
            $document_file = CdnFileModel::leftjoin('cdn_file_share', 'cdn_file.id', '=', 'cdn_file_share.file_id')
                ->select('cdn_file.*', 'cdn_file_share.user_id', 'cdn_file_share.can_edit', 'cdn_file_share.can_download')
                ->where('is_folder', 0)->where('is_deleted', 0)
                ->where('parent_id', null)->where('created_by', $user_id)->orderBy('id', 'desc')
                ->where('cdn_file_share.user_id', $user_id)->get();
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
    public function document_trash()
    {
        try {
            $user_id = auth()->user()->id;
            $document_folder = CdnFileModel::where('is_folder', 1)->where('is_deleted', 1)->where('parent_id', null)->where('created_by', $user_id)->orderBy('id', 'desc')->get();
            $document_file = CdnFileModel::where('is_folder', 0)->where('is_deleted', 1)->where('parent_id', null)->where('created_by', $user_id)->orderBy('id', 'desc')->get();
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
            $document_folder = CdnFileModel::leftjoin('cdn_file_permissions', 'cdn_file.id', '=', 'cdn_file_permissions.file_id')
            ->select('cdn_file.*', 'cdn_file_permissions.permission')
            ->where('is_folder', 1)
            ->where('is_deleted', 0)
            ->where('parent_id', $id)
            ->distinct('cdn_file_permissions.file_id')
            ->orderBy('cdn_file.id', 'desc')
            ->get();
            $document_file = CdnFileModel::where('is_folder', 0)->where('is_deleted', 0)->where('parent_id', $id)->orderBy('id', 'desc')->get();
            $role_folder = CdnFilePermissionModel::where('file_id', $id)->first();
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục thành công',
                'document_folder' => $document_folder,
                'document_file' => $document_file,
                'role_folder'=>$role_folder
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
                    'file_url' => url($check_rule->file_storage_path),
                    'file_name' => $check_rule->file_name
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

    public function show_file_share($id)
    {
        try {
            $file = CdnFileShareModel::where('file_id', $id)->get();
            $data = User::all();
            return response()->json([
                'success' => true,
                'message' => 'Danh sách nhân viên',
                'data' => $file,
                'employee' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function share_file(Request $request, $id)
    {
        try {
            // Lấy dữ liệu từ request
            $user_ids = $request->user_id;
            $roles = $request->role;

            // Kiểm tra dữ liệu
            if (!$user_ids || !$roles) {
                return response()->json(['error' => 'Thiếu dữ liệu user_id hoặc role'], 400);
            }

            // Duyệt qua từng user_id
            foreach ($user_ids as $user_id) {
                // Kiểm tra xem bản ghi đã tồn tại hay chưa
                $existingShare = CdnFileShareModel::where('file_id', $id)
                    ->where('user_id', $user_id)
                    ->first();

                if ($existingShare) {
                    // Nếu đã tồn tại, cập nhật quyền
                    $existingShare->can_edit = in_array("1", $roles); // Quyền chỉnh sửa
                    $existingShare->can_download = in_array("2", $roles); // Quyền tải xuống
                    $existingShare->save();
                } else {
                    // Nếu chưa tồn tại, thêm mới bản ghi
                    $data = new CdnFileShareModel();
                    $data->file_id = $id;
                    $data->user_id = $user_id;
                    $data->can_edit = in_array("1", $roles); // Quyền chỉnh sửa
                    $data->can_download = in_array("2", $roles); // Quyền tải xuống
                    $data->save();
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Quyền đã được cập nhật hoặc tạo mới thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thao tác thất bại',
                'error' => $e->getMessage(),
            ], 500);
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
            // Validate input
            $request->validate([
                'file_name' => 'required|string|max:255',
            ]);
    
            $user_id = auth()->user()->id;
    
            // Tạo thư mục con
            $data = new CdnFileModel();
            $data->file_name = $request->file_name;
            $data->is_folder = 1; // Đánh dấu đây là một thư mục
            $data->parent_id = $id; // Gán parent_id từ thư mục cha
            $data->created_by = $user_id;
            $data->updated_by = $user_id;
            $data->save();
    
            // Lấy quyền của thư mục cha
            $parentPermissions = CdnFilePermissionModel::where('file_id', $id)->get();
    
            // Áp dụng quyền từ cha cho thư mục con
            foreach ($parentPermissions as $permission) {
                CdnFilePermissionModel::create([
                    'file_id' => $data->id, // ID của thư mục con
                    'user_id' => $permission->user_id,
                    'permission' => $permission->permission,
                ]);
            }
            return response()->json([
                'success' => true,
                'message' => 'Tạo thư mục và áp dụng quyền thành công',
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
                'files.*' => 'required|file|max:10240', // Không giới hạn loại tệp nào
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
                'files.*' => 'required|file|max:10240', // Không giới hạn loại tệp nào
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
    public function show_folder_share($id)
    {
        try {
            $file = CdnFilePermissionModel::where('file_id', $id)->get();
            $data = User::all();
            return response()->json([
                'success' => true,
                'message' => 'Danh sách nhân viên',
                'data' => $file,
                'employee' => $data,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function share_folder(Request $request, $id)
    {
        try {
            // Lấy dữ liệu từ request
            $user_ids = $request->input('user_id');
            $role = $request->input('role'); // Role áp dụng cho tất cả user

            // Kiểm tra dữ liệu đầu vào
            if (empty($user_ids) || !$role) {
                return response()->json(['error' => 'Thiếu dữ liệu user_id hoặc role'], 400);
            }

            // Lấy danh sách các thư mục con và chính thư mục hiện tại
            $allFolderIds = $this->getDescendantFolderIds($id);

            // Xử lý phân quyền cho từng user_id
            foreach ($user_ids as $user_id) {
                foreach ($allFolderIds as $folderId) {
                    // Kiểm tra xem bản ghi đã tồn tại hay chưa
                    $existingPermission = CdnFilePermissionModel::where('file_id', $folderId)
                        ->where('user_id', $user_id)
                        ->first();

                    if ($existingPermission) {
                        // Nếu đã tồn tại, cập nhật quyền
                        $existingPermission->permission = $role;
                        $existingPermission->save();
                    } else {
                        // Nếu chưa tồn tại, thêm mới bản ghi
                        CdnFilePermissionModel::create([
                            'file_id' => $folderId,
                            'user_id' => $user_id,
                            'permission' => $role,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Quyền đã được áp dụng thành công cho thư mục và các thư mục con.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thao tác thất bại.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    private function getDescendantFolderIds($folderId)
    {
        $folderIds = [$folderId]; // Bắt đầu với thư mục gốc
        $children = CdnFileModel::where('parent_id', $folderId)->pluck('id');

        foreach ($children as $childId) {
            $folderIds = array_merge($folderIds, $this->getDescendantFolderIds($childId));
        }

        return $folderIds;
    }

    public function re_store($id)
    {
        try {
            $user_id = auth()->user()->id;
            $folder = CdnFileModel::findOrFail($id);
            $folder->is_deleted = 0;
            $folder->save();
            return response()->json([
                'success' => true,
                'message' => 'Khôi phục thành công!',

            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Khôi phục thất bại!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function remove_file($id)
    {
        if (!$id) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy File']);
        }

        try {
            // Lấy thông tin tệp hoặc thư mục
            $fileOrFolder = CdnFileModel::find($id);

            if (!$fileOrFolder) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy file hoặc thư mục.']);
            }

            // Nếu là thư mục, xóa tất cả con bên trong (bao gồm cả file)
            if ($fileOrFolder->is_folder) {
                $this->deleteFolderAndChildren($id);
            } else {
                // Nếu là tệp, xóa tệp khỏi hệ thống tệp và cơ sở dữ liệu
                if ($fileOrFolder->file_storage_path) {
                    $this->deleteFileFromStorage($fileOrFolder->file_storage_path);
                }
                $fileOrFolder->delete(); // Xóa khỏi cơ sở dữ liệu
            }

            return response()->json(['success' => true, 'message' => 'Xóa tệp hoặc thư mục thành công.']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi xóa file hoặc thư mục.',
                'error' => $e->getMessage()
            ]);
        }
    }

    // Hàm đệ quy xóa tất cả các con trong thư mục
    private function deleteFolderAndChildren($folderId)
    {
        $children = CdnFileModel::where('parent_id', $folderId)->get();

        foreach ($children as $child) {
            if ($child->is_folder) {
                // Gọi đệ quy nếu là thư mục
                $this->deleteFolderAndChildren($child->id);
            } else {
                // Xóa file khỏi hệ thống tệp
                if ($child->file_storage_path) {
                    $this->deleteFileFromStorage($child->file_storage_path);
                }
            }

            // Xóa mục hiện tại khỏi cơ sở dữ liệu
            $child->delete();
        }

        // Xóa thư mục gốc sau khi xóa tất cả con
        $folder = CdnFileModel::find($folderId);
        $folder->delete();
    }

    // Hàm xóa file khỏi hệ thống lưu trữ
    private function deleteFileFromStorage($filePath)
    {
        try {
            // Convert URL thành đường dẫn tương đối (nếu cần)
            $relativePath = str_replace('/storage/', '', parse_url($filePath, PHP_URL_PATH));

            // Xóa file từ hệ thống lưu trữ
            if (Storage::exists('public/' . $relativePath)) {
                Storage::delete('public/' . $relativePath);
            }
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }
}
