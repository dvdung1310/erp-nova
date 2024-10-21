<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvuStatusCustomerModel extends Model
{
    use HasFactory;
    protected $table='nvu_status_customer';
    protected $primaryKey = 'status_id';
    protected $fillable=[
        'status_name','status_color','status'
    ];
}
