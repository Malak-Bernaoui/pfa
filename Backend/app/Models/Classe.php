<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    protected $table = 'classes';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'nom',
        'niveau',
        'disponible'
    ];
    
    // Relations
    public function etudiants()
    {
        return $this->hasMany(Etudiant::class, 'classe_id');
    }
}