<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialPost extends Model
{
    //
    protected $table = 'social_posts';
    protected $primaryKey = 'post_id';
    protected $fillable = ['create_by_user_id', 'post_content'];

    public function createByUser()
    {
        return $this->belongsTo(User::class, 'create_by_user_id')
            ->select(['id', 'name', 'email', 'avatar', 'phone']);
    }

    public function galleries()
    {
        return $this->hasMany(SocialGalleries::class, 'post_id');
    }

    public function userTag()
    {
        return $this->hasMany(SocialUserTag::class, 'post_id');
    }

    public function hashTag()
    {
        return $this->hasMany(SocialPostHashtag::class, 'post_id');
    }
    public function comments()
    {
        return $this->hasMany(SocialComment::class, 'post_id');
    }
    public function reactions()
    {
        return $this->hasMany(SocialReaction::class, 'post_id', 'post_id');
    }
}
