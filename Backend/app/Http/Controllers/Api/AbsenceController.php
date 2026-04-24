<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{

    public function getAbsencesByEtudiant($etudiantId)
    {
        try {
            $absences = Absence::where('etudiant_id', $etudiantId)
                ->with('enseignant') 
                ->get(['id', 'date', 'enseignant_id', 'nb_heures', 'justifiee']);
            return response()->json($absences);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}