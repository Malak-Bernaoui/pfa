<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    public function show($id)
    {
        $etudiant = Etudiant::with(['user', 'classe'])->find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }
        return response()->json([
            'id' => $etudiant->id,
            'nom' => $etudiant->nom,
            'prenom' => $etudiant->prenom,
            'date_naissance' => $etudiant->date_naissance,
            'classe' => $etudiant->classe,
            'user' => $etudiant->user
        ]);
    }

    public function notes($id)
    {
        $etudiant = Etudiant::find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }   
        $notes = $etudiant->notes()->get();
        return response()->json($notes);
    }

    public function absences($id)
    {
        $etudiant = Etudiant::find($id);
        if (!$etudiant) {
            return response()->json(['message' => 'Étudiant non trouvé'], 404);
        }
        $absences = $etudiant->absences()->get();
        return response()->json($absences);
    }
}