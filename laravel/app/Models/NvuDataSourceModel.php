<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvuDataSourceModel extends Model
{
    use HasFactory;
    protected $table='nvu_data_source';
    protected $primaryKey = 'source_id';
    protected $fillable=[
        'source_name','source_status'
    ];
}
