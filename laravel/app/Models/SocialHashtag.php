<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialHashtag extends Model
{
    //
    protected $table = 'social_hashtags';
    protected $primaryKey = 'hashtag_id';
    protected $fillable = ['hashtag_name'];
}
