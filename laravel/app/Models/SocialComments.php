<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialComments extends Model
{
    //
    protected $table = 'social_comments';
    protected $fillable = [
        'post_id',
        'user_id',
        'comment_parent_id',
        'comment_content',
    ];
    protected $primaryKey = 'comment_id';
    public $timestamps = true;
}
