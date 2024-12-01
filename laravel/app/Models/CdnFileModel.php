<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CdnFileModel extends Model
{
    protected $table='cdn_file';
    protected $fillable=[
        'file_name','file_size','file_type','file_path','file_storage_path','is_folder','parent_id','is_public','created_by','updated_by'
    ];
}
