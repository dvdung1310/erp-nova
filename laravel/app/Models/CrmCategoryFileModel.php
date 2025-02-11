<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmCategoryFileModel extends Model
{
    use HasFactory;
    protected $table='crm_category_file';
    protected $primaryKey = 'category_id';
    protected $fillable=[
        'category_name','category_status'
    ];
}
