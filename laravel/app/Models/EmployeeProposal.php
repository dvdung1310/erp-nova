<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeProposal extends Model
{
    protected $fillable = ['user_id', 'manager_id', 'title', 'description', 'file', 'status', 'approved_by'];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
