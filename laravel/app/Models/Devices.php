<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devices extends Model
{
    use HasFactory;

    protected $table = 'work_devices';
    protected $primaryKey = 'device_id';
    public $incrementing = true;
    protected $fillable = [
        'device_id',
        'user_id',
        'endpoint',
    ];
}
