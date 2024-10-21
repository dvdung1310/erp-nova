<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmRecruitNewsModel extends Model
{
    use HasFactory;
    protected $table='crm_recruit_news';
    protected $primaryKey = 'news_id';
    protected $fillable=[
        'news_title','news_content','news_salary','target_id','news_start_date','news_end_date','news_status'
    ];
}
