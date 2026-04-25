<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{

    public function index()
    {
        $absences = Absence::with(['etudiant', 'enseignant'])->get();
        return response()->json($absences);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'etudiant_id' => 'required|exists:etudiants,id',
            'enseignant_id' => 'required|exists:enseignants,id',
            'nb_heures' => 'required|numeric|min:0',
            'justifiee' => 'boolean',
        ]);

        $absence = Absence::create($request->all());
        return response()->json($absence->load(['etudiant', 'enseignant']), 201);
    }

    public function show($id)
    {
        $absence = Absence::with(['etudiant', 'enseignant'])->find($id);
        if (!$absence) {
            return response()->json(['message' => 'Absence non trouvée'], 404);
        }
        return response()->json($absence);
    }

    public function update(Request $request, $id)
    {
        $absence = Absence::find($id);
        if (!$absence) {
            return response()->json(['message' => 'Absence non trouvée'], 404);
        }

        $request->validate([
            'date' => 'required|date',
            'etudiant_id' => 'required|exists:etudiants,id',
            'enseignant_id' => 'required|exists:enseignants,id',
            'nb_heures' => 'required|numeric|min:0',
            'justifiee' => 'boolean',
        ]);

        $absence->update($request->all());
        return response()->json($absence->load(['etudiant', 'enseignant']));
    }

    public function destroy($id)
    {
        $absence = Absence::find($id);
        if (!$absence) {
            return response()->json(['message' => 'Absence non trouvée'], 404);
        }

        $absence->delete();
        return response()->json(['message' => 'Absence supprimée']);
    }

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