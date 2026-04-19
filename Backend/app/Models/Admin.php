<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    protected $table = 'admin';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'user_id'
    ];
    
    // Relations
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}