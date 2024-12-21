<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialUserTags extends Model
{
    //
    protected $table = 'social_user_tags';
    protected $primaryKey = 'tag_id';
    protected $fillable = [
        'post_id',
        'comment_id',
        'tagged_user_id', //  -- ID của người được gắn thẻ
        'tagger_user_id',     //-- ID của người thực hiện gắn thẻ
    ];
    public $timestamps = true;
}
