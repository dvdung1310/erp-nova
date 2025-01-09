<?php

namespace App\Http\Controllers\Api\Social;

use App\Http\Controllers\Controller;
use App\Models\SocialComment;
use App\Models\SocialGalleries;
use App\Models\SocialHashtag;
use App\Models\SocialPost;
use App\Models\SocialPostHashtag;
use App\Models\SocialReaction;
use App\Models\SocialUserTag;
use App\Models\User;
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

    public function create(Request $request)
    {
        try {
            // Xác thực dữ liệu
            $request->validate([
                'post_content' => 'required|string',
                'files' => 'nullable|array',
                'list_user_tag' => 'nullable|array',
                'hash_tags' => 'nullable|array',
            ]);

            $file_names = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $imagePath = $file->store('social', 'public');
                    $file_names[] = $imagePath;
                }
            }

            $user = auth()->user();
            $post_content = $request->post_content;
            $newPost = SocialPost::create([
                'create_by_user_id' => $user->id,
                'post_content' => $post_content,
            ]);

            $post_id = $newPost->post_id;

            // Lưu gallery
            if (!empty($file_names)) {
                $galleryData = array_map(fn($file_name) => [
                    'post_id' => $post_id,
                    'media_url' => $file_name,
                ], $file_names);
                SocialGalleries::insert($galleryData);
            }

            // Lưu tag người dùng
            $list_user_tag = $request->input('list_user_tag', []);
            if (is_array($list_user_tag) && count($list_user_tag) > 0) {
                SocialUserTag::create([
                    'post_id' => $post_id,
                    'list_user_id' => json_encode($list_user_tag),
                ]);
            }

            // Lưu hashtags
            $hash_tags = $request->input('hash_tags', []);
            if (is_array($hash_tags) && count($hash_tags) > 0) {
                $hashtagIds = [];
                foreach ($hash_tags as $hash_tag) {
                    $hashtag = SocialHashtag::firstOrCreate(['hashtag_name' => $hash_tag]);
                    $hashtagIds[] = [
                        'post_id' => $post_id,
                        'hashtag_id' => $hashtag->hashtag_id,
                    ];
                }
                SocialPostHashtag::insert($hashtagIds);
            }

            return response()->json([
                'message' => 'Create post successfully',
                'data' => [
                    'post_id' => $post_id,
                    'create_by_user' => $user,
                    'post_content' => $post_content,
                    'galleries' => array_map(fn($file_name) => ['media_url' => $file_name], $file_names),
                    'list_user_tag' => User::whereIn('id', $list_user_tag)->get(),
                    'hashtags' => SocialHashtag::whereIn('hashtag_name', $hash_tags)->get(),
                ],
                'error' => false,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'data' => null,
                'error' => true,
            ], 500);
        }
    }


    public function getAllPosts()
    {
        try {
            $posts = SocialPost::with(['createByUser', 'galleries', 'userTag', 'hashTag', 'reactions'])
                ->orderBy('created_at', 'desc')
                ->get();
            $posts->map(function ($post) {
                $decoded_user_ids = $post->userTag->pluck('list_user_id')
                    ->flatMap(fn($user_ids) => json_decode($user_ids, true))
                    ->toArray();

                $list_user = User::whereIn('id', $decoded_user_ids)
                    ->select(['name', 'email', 'avatar', 'phone'])
                    ->get();
                $post->list_user_tag = $list_user;

                $hashtag_ids = $post->hashTag->pluck('hashtag_id')->toArray();
                $hashtags = SocialHashtag::whereIn('hashtag_id', $hashtag_ids)->get();
                $post->hashtags = $hashtags;

                $comments = SocialComment::where('post_id', $post->post_id)
                    ->with(['createByUser', 'galleries', 'reactions'])
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->toArray();
                $nestedComments = $this->buildNestedComments($comments);
                $post->comments = $nestedComments;

            });

            return response()->json([
                'message' => 'Get all posts successfully',
                'data' => $posts,
                'error' => false
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'data' => null,
                'error' => true
            ], 500);
        }
    }

    function buildNestedComments($comments, $parentId = null): array
    {
        $nestedComments = [];
        foreach ($comments as $comment) {
            if ($comment['comment_parent_id'] == $parentId) {
                $children = $this->buildNestedComments($comments, $comment['comment_id']);
                if ($children) {
                    $comment['children'] = $children;
                }
                $nestedComments[] = $comment;
            }
        }
        return $nestedComments;
    }

    public function getPostsById($post_id)
    {
        try {
            $post = SocialPost::with([
                'createByUser',
                'galleries',
                'userTag',
                'hashTag',
                'reactions',
            ])->find($post_id);

            if (!$post) {
                return response()->json([
                    'message' => 'Post not found',
                    'data' => null,
                    'error' => true
                ], 404);
            }
            $comments = SocialComment::where('post_id', $post_id)
                ->with(['createByUser', 'galleries'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->toArray();
            $nestedComments = $this->buildNestedComments($comments);
            $post->comments = $nestedComments;
            $decoded_user_ids = $post->userTag->pluck('list_user_id')
                ->flatMap(fn($user_ids) => json_decode($user_ids, true))
                ->toArray();

            $list_user = User::whereIn('id', $decoded_user_ids)
                ->select(['name', 'email', 'avatar', 'phone'])
                ->get();
            $post->list_user_tag = $list_user;

            $hashtag_ids = $post->hashTag->pluck('hashtag_id')->toArray();
            $hashtags = SocialHashtag::whereIn('hashtag_id', $hashtag_ids)->get();
            $post->hashtags = $hashtags;

            return response()->json([
                'message' => 'Get post successfully',
                'data' => $post,
                'error' => false
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'data' => null,
                'error' => true
            ], 500);
        }
    }

    // reaction
    public function createOrUpdateReaction(Request $request)
    {
        try {
            // Xác thực dữ liệu
            $request->validate([
                'post_id' => 'required|integer',
                'reaction_type' => 'required|in:like,love,haha,wow,sad,angry',
            ]);
            $user_id = auth()->user()->id;
            $reaction_type = $request->reaction_type;
            $post_id = $request->post_id;
            $reaction = SocialReaction::where('post_id', $post_id)->where('user_id', $user_id)->first();
            if ($reaction) {
                $reaction->update([
                    'reaction_type' => $reaction_type,
                ]);
            } else {
                SocialReaction::create([
                    'user_id' => $user_id,
                    'post_id' => $post_id,
                    'reaction_type' => $reaction_type,
                ]);
            }
            return response()->json([
                'data' => $reaction,
                'status' => 200,
                'message' => 'Success',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => null,
                'status' => 500,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function delete($post_id)
    {
        try {
            $post = SocialPost::find($post_id);
            if (!$post) {
                return response()->json([
                    'message' => 'Post not found',
                    'data' => null,
                    'error' => true
                ], 404);
            }
            $post->delete();
            return response()->json([
                'message' => 'Delete post successfully',
                'data' => null,
                'error' => false
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'data' => null,
                'error' => true
            ], 500);
        }

    }

}
