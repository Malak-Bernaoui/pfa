<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
public function index()
{
    $user = auth()->user();
    $enseignant = $user->enseignant;
    if ($enseignant) {
        $classes = $enseignant->classes()->withCount('etudiants')->get();
    } else {
        $classes = Classe::withCount('etudiants')->get();
    }
    return response()->json($classes);
}

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'niveau' => 'nullable|string|max:100',
            'enseignant_ids' => 'array|exists:enseignants,id', // liste facultative
        ]);

        $classe = Classe::create($request->only(['nom', 'niveau']));

        if ($request->has('enseignant_ids')) {
            $classe->enseignants()->sync($request->enseignant_ids);
        }

        return response()->json($classe->load('enseignants'), 201);
    }

    public function show($id)
    {
        $classe = Classe::with('etudiants')->find($id);
        if (!$classe) {
            return response()->json(['message' => 'Classe non trouvée'], 404);
        }
        return response()->json($classe);
    }

    public function update(Request $request, $id)
    {
        $classe = Classe::findOrFail($id);
        $classe->update($request->only(['nom', 'niveau']));

        if ($request->has('enseignant_ids')) {
            $classe->enseignants()->sync($request->enseignant_ids);
        }

        return response()->json($classe->load('enseignants'));
    }

    public function destroy($id)
    {
        $classe = Classe::find($id);
        if (!$classe) {
            return response()->json(['message' => 'Classe non trouvée'], 404);
        }

        $classe->delete();
        return response()->json(['message' => 'Classe supprimée']);
    }
    public function assignTeacher(Request $request, $id)
{
    $request->validate([
        'enseignant_id' => 'required|exists:enseignants,id',
    ]);

    $classe = Classe::findOrFail($id);
    $classe->enseignant_id = $request->enseignant_id;
    $classe->save();

    return response()->json($classe->load('enseignant'));
}
}