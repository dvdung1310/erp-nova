<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialPostsCategories extends Model
{
    //
    protected $table = 'social_posts_categories';
    protected $primaryKey = 'post_category_id';
    public $timestamps = true;
    protected $fillable = [
        'post_id',
        'category_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(SocialCategories::class, 'category_id', 'category_id');
    }
}
