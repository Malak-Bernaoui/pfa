<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model
{
    protected $table = 'enseignants';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'user_id',
        'nom',
        'matiere'
    ];
    
    // Relations
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}