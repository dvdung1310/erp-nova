<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvuRoomRentModel extends Model
{
    use HasFactory;
    protected $table='nvu_room_rent';
    protected $primaryKey = 'rent_id';
    protected $fillable=[
        'rent_room','rent_customer','rent_start_time','rent_end_time','rent_status'
    ];
}
