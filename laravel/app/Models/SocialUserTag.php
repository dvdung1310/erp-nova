<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialUserTag extends Model
{
    //
    protected $table = 'social_user_tags';
    protected $primaryKey = 'user_tag_id';
    protected $fillable = ['post_id', 'comment_id', 'list_user_id'];
}
