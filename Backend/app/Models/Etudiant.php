<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    protected $table = 'etudiants';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'date_naissance',
        'classe_id'
    ];
    
    protected $casts = [
        'date_naissance' => 'date'
    ];
    
    // Relations
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function classe()
    {
        return $this->belongsTo(Classe::class, 'classe_id');
    }
    
    public function notes()
    {
        return $this->hasMany(Note::class, 'etudiant_id');
    }
    
    public function absences()
    {
        return $this->hasMany(Absence::class, 'etudiant_id');
    }
    
    // Accesseur pour le nom complet
    public function getNomCompletAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }
}