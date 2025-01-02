<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialGalleries extends Model
{
    //
    protected $table = 'social_galleries';
    protected $primaryKey = 'gallery_id';
    protected $fillable = ['post_id', 'comment_id', 'media_url'];

}
