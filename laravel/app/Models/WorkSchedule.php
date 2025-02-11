<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    use HasFactory;

    protected $table = 'works_chedule';
    protected $fillable = [
        'user_id',
        'date',
        'code',
    ];

    /**
     * Một WorkSchedule thuộc về một User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
