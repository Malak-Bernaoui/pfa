<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $table = 'absences';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'date',
        'etudiant_id'
    ];
    
    protected $casts = [
        'date' => 'date'
    ];
    
    // Relations
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }
}