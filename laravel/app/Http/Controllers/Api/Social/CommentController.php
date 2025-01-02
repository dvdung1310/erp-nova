<?php

namespace App\Http\Controllers\Api\Social;

use App\Http\Controllers\Controller;
use App\Models\SocialComment;
use App\Models\SocialGalleries;
use App\Models\SocialHashtag;
use App\Models\SocialPost;
use App\Models\SocialPostHashtag;
use App\Models\SocialUserTag;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function create(Request $request)
    {
        try {
            // Xác thực dữ liệu
            $request->validate([
                'post_id' => 'required|integer',
                'comment_content' => 'required|string',
                'files' => 'nullable|array',
            ]);
            $create_by_user_id = auth()->user()->id;
            $comment_parent_id = $request->comment_parent_id ?? null;
            $newComment = SocialComment::create([
                'create_by_user_id' => $create_by_user_id,
                'post_id' => $request->post_id,
                'comment_content' => $request->comment_content,
                'comment_parent_id' => $comment_parent_id,
            ]);

            $file_names = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $imagePath = $file->store('social', 'public');
                    $file_names[] = $imagePath;
                }
            }
            if (!empty($file_names)) {
                $galleryData = array_map(fn($file_name) => [
                    'comment_id' => $newComment->comment_id,
                    'media_url' => $file_name,
                ], $file_names);
                SocialGalleries::insert($galleryData);
            }
            $dataResponse = SocialComment::with(['createByUser', 'galleries'])->find($newComment->comment_id);
            return response()->json([
                'status' => true,
                'message' => 'Comment created successfully',
                'data' => $dataResponse,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Comment created failed',
                'error' => $e->getMessage(),
            ]);
        }
    }
}
