<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialComment extends Model
{
    //
    protected $table = 'social_comments';
    protected $primaryKey = 'comment_id';
    protected $fillable = ['post_id', 'create_by_user_id', 'comment_content', 'comment_parent_id'];
    public function createByUser()
    {
        return $this->belongsTo(User::class, 'create_by_user_id')
            ->select(['id', 'name', 'email', 'avatar', 'phone']);
    }

    public function parentComment()
    {
        return $this->belongsTo(SocialComment::class, 'comment_parent_id');
    }

    public function galleries()
    {
        return $this->hasMany(SocialGalleries::class, 'comment_id');
    }
}
