<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocialPosts extends Model
{
    //
    protected $table = 'social_posts';
    protected $primaryKey = 'post_id';
    protected $fillable = [
        'user_id',
        'post_content',
        'post_title',
    ];

    public function comments(): HasMany
    {
        return $this->hasMany(SocialComments::class, 'post_id', 'post_id');
    }

    public function galleries(): HasMany
    {
        return $this->hasMany(SocialGalleries::class, 'post_id', 'post_id');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(SocialPostsCategories::class, 'post_id', 'post_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(SocialReactions::class, 'post_id', 'post_id');
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public $timestamps = true;
}
