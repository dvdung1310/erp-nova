<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialReactions extends Model
{
    //
    protected $table = 'social_reactions';
    protected $primaryKey = 'reaction_id';
    protected $fillable = [
        'post_id',
        'user_id',
        'reaction_type', // enum 'like', 'dislike', 'love', 'haha', 'wow', 'sad', 'angry'
        'comment_id',
    ];
    public $timestamps = true;
}
