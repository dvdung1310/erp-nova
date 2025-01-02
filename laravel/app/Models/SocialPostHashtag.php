<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialPostHashtag extends Model
{
    //
    protected $table = 'social_post_hashtags';
    protected $primaryKey = 'post_hashtag_id';
    protected $fillable = ['post_id', 'hashtag_id'];
}
