<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentModel extends Model
{
    protected $table = 'doc_document';
    protected $fillable = ['doc_title', 'doc_status'];
}
