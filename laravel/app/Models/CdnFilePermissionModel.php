<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CdnFilePermissionModel extends Model
{
    protected $table='cdn_file_permissions';
    protected $fillable=[
        'file_id','user_id','permission'
    ];
}
