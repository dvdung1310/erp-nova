<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class CustomerStatus extends Model
{
    use HasFactory;
    protected $table = 'customer_status';
    protected $fillable = ['name', 'color', 'status'];

    public function customers()
    {
        return $this->hasMany(Customer::class, 'status_id');
    }
}
