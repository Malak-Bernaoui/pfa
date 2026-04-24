<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function getNotesByEtudiant($etudiantId)
    {
        try {
            $notes = Note::where('etudiant_id', $etudiantId)
                         ->get(['id', 'matiere', 'note']);
            return response()->json($notes);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}