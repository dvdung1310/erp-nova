<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class CustomerDataSource extends Model
{
    use HasFactory;
    protected $table = 'customer_data_source';
    protected $fillable = ['name', 'status'];

    public function customers()
    {
        return $this->hasMany(Customer::class, 'source_id');
    }
}
