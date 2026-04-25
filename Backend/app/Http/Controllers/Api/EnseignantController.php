<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use Illuminate\Http\Request;

class EnseignantController extends Controller
{
    public function show($id)
    {
        $enseignant = Enseignant::with('user')->find($id);
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 404);
        }
        return response()->json([
            'id' => $enseignant->id,
            'nom' => $enseignant->nom,
            'matiere' => $enseignant->matiere,
            'user' => $enseignant->user
        ]);
    }

    public function cours($id)
    {
        // Exemple - à adapter selon votre structure de tables
        $enseignant = Enseignant::find($id);
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 404);
        }
        // Retourner les cours de cet enseignant (vous devez adapter selon votre BDD)
        $cours = []; // Exemple vide
        return response()->json($cours);
    }
}