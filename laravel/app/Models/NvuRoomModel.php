<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvuRoomModel extends Model
{
    use HasFactory;
    protected $table='nvu_room';
    protected $primaryKey = 'room_id';
    protected $fillable=[
        'room_name','room_address','room_description','room_color','room_status'
    ];
}
