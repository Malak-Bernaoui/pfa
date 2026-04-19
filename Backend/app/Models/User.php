<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    public $incrementing = true;
    
    protected $fillable = [
        'login',
        'mot_de_passe'
    ];
    
    protected $hidden = [
        'mot_de_passe'
    ];
    
    // Relations
    public function etudiant()
    {
        return $this->hasOne(Etudiant::class, 'user_id');
    }
    
    public function enseignant()
    {
        return $this->hasOne(Enseignant::class, 'user_id');
    }
    
    public function administrateur()
    {
        return $this->hasOne(Admin::class, 'user_id');
    }
}