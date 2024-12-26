<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialCategories extends Model
{
    //
    protected $table = 'social_categories';
    protected $primaryKey = 'category_id';
    protected $fillable = [
        'category_name',
        'category_description',
    ];
}
