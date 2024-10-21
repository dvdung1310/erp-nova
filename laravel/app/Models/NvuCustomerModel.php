<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NvuCustomerModel extends Model
{
    use HasFactory;
    protected $table='nvu_customer';
    protected $primaryKey = 'customer_id';
    protected $fillable=[
        'customer_name','customer_phone','customer_date_receipt','customer_source','customer_description',
        'customer_sale','customer_status'
    ];
}
