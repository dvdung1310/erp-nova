<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentPageModel extends Model
{
    protected $table = 'doc_document_page';
    protected $fillable = ['page_title', 'page_description','page_content','document_id'];
}
