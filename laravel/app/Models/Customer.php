<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $fillable = ['name', 'source', 'phone', 'date', 'email', 'file_infor' , 'customer_comment', 'status_id', 'source_id'];

    public function status()
    {
        return $this->belongsTo(CustomerStatus::class, 'status_id');
    }

    public function dataSource()
    {
        return $this->belongsTo(CustomerDataSource::class, 'source_id');
    }

    public function sales()
    {
        return $this->hasMany(CustomerSale::class);
    }
}
