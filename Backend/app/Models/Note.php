<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $table = 'notes';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'matiere',
        'note',
        'etudiant_id'
    ];
    
    // Relations
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }
    
    // Accesseur pour formater la note
    public function getNoteFormateeAttribute()
    {
        return $this->note . '/20';
    }
}