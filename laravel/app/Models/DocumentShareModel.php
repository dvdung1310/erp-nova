<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentShareModel extends Model
{
    protected $table = 'doc_document_share';
    protected $fillable = ['document_id', 'department_id'];
}
