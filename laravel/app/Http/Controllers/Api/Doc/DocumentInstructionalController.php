<?php

namespace App\Http\Controllers\Api\Doc;

use App\Http\Controllers\Controller;
use App\Models\DocumentModel;
use App\Models\DocumentPageModel;
use Illuminate\Http\Request;

class DocumentInstructionalController extends Controller
{
    public function instructional_document()
    {
        try {
            $user_id = auth()->user()->id;
            $document = DocumentModel::all();
            return response()->json([
                'success' => true,
                'message' => 'Thêm đại lý thành công',
                'data' => $document,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thêm đại lý thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function save_instructional_document(Request $request)
    {
        // Xác thực dữ liệu đầu vào
        $documentData = $request->validate([
            'name' => 'required|string',
            'pages' => 'required|array',
            'pages.*.title' => 'required|string',
            'pages.*.description' => 'nullable|string',
            'pages.*.content' => 'nullable|string',
        ]);

        // Lưu tài liệu vào bảng doc_document
        try {
            $document = DocumentModel::create([
                'doc_title' => $documentData['name'],
                'doc_status' => 1,  // Ví dụ: Tình trạng tài liệu
            ]);

            // Lưu các trang của tài liệu vào bảng doc_document_page
            $pagesData = array_map(function ($page) use ($document) {
                return [
                    'page_title' => $page['title'],
                    'page_description' => $page['description'] ?? null,
                    'page_content' => $page['content'] ?? null,
                    'document_id' => $document->id,
                ];
            }, $documentData['pages']);

            // Sử dụng phương thức insert để giảm số lần gọi DB
            DocumentPageModel::insert($pagesData);

            return response()->json([
                'success' => true,
                'message' => 'Tạo tài liệu thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo tài liệu thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function detail_instructional_document($id)
    {
        try {
            $document = DocumentPageModel::where('document_id', $id)->get();
            return response()->json([
                'success' => true,
                'message' => 'Tạo tài liệu thành công',
                'data' => $document,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo tài liệu thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete_instructional_document($id)
    {
        try {
            DocumentModel::where('id', $id)->delete();
            return response()->json([
                'success' => true,
                'message' => 'File đã được xóa thành công!',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xóa file tạm thời thất bại! ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update_instructional_document(Request $request, $id)
    {
        $documentData = $request->validate([
            'pages' => 'required|array',
            'pages.*.title' => 'required|string',
            'pages.*.description' => 'nullable|string',
            'pages.*.content' => 'nullable|string',
        ]);
        try {
            $delete_page = DocumentPageModel::where('document_id',$id)->delete();
            if($delete_page){
                $pagesData = array_map(function ($page) use ($id) {
                    return [
                        'page_title' => $page['title'],
                        'page_description' => $page['description'] ?? null,
                        'page_content' => $page['content'] ?? null,
                        'document_id' => $id,
                    ];
                }, $documentData['pages']);
            }
            // Sử dụng phương thức insert để giảm số lần gọi DB
            DocumentPageModel::insert($pagesData);

            return response()->json([
                'success' => true,
                'message' => 'Tạo tài liệu thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo tài liệu thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
