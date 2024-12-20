<?php

namespace App\Http\Controllers\Api\Social;

use App\Http\Controllers\Controller;
use App\Models\SocialGalleries;
use App\Models\SocialPosts;
use App\Models\SocialPostsCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function create(Request $request): JsonResponse
    {
        try {
            $validator = $request->validate([
                'post_title' => 'required|string',
                'post_content' => 'required|string',
                'post_category' => 'required|string',
            ]);
            $file_names = [];

            // Kiểm tra xem có tệp tin được gửi lên không
            if ($request->hasFile('files')) {
                $files = $request->file('files');

                // Duyệt qua từng file
                foreach ($files as $file) {
                    // Lưu file vào thư mục 'social' trong storage/public
                    $imagePath = $file->store('social', 'public');
                    $file_names[] = $imagePath;
                }
            }
            $user_id = auth()->user()->id;
            $post = SocialPosts::create([
                'user_id' => $user_id,
                'post_title' => $validator['post_title'],
                'post_content' => $validator['post_content'],
            ]);
            $post_id = $post->post_id;
            $socialGallery = new SocialGalleries();
            foreach ($file_names as $file_name) {
                $socialGallery->create([
                    'post_id' => $post_id,
                    'media_url' => $file_name
                ]);
            }
            $postCategory = new SocialPostsCategories();
            $postCategory->create([
                'post_id' => $post_id,
                'category_id' => $validator['post_category']
            ]);
            return response()->json([
                'error' => false,
                'message' => 'Post created successfully',
                'data' => $post
            ], 200);


        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function getById($posts_id): JsonResponse
    {
        try {
            $post = SocialPosts::with(['user', 'comments', 'galleries', 'categories.category', 'reactions'])
                ->where('post_id', $posts_id)
                ->first();
            if (!$post) {
                return response()->json([
                    'error' => true,
                    'message' => 'Post not found',
                    'data' => null
                ], 404);
            }
            return response()->json([
                'error' => false,
                'message' => 'Post found',
                'data' => $post
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function getAll()
    {
        try {
            $posts = SocialPosts::with(['comments', 'galleries', 'categories.category', 'reactions', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json([
                'error' => false,
                'message' => 'Posts found',
                'data' => $posts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'data' => null
            ], 500);
        }

    }

}
