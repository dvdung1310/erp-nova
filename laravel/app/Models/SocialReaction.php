<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialReaction extends Model
{
    //
    protected $table = 'social_reactions';
    protected $primaryKey = 'reaction_id';
    protected $fillable = ['post_id', 'comment_id', 'user_id', 'reaction_type'];
}
