<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CdnFileShareModel extends Model
{
    protected $table='cdn_file_share';
    protected $fillable=[
        'file_id','user_id','can_edit','can_download'
    ];
}
