<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    public function index()
    {
        $classes = Classe::withCount('etudiants')->get();
        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'niveau' => 'required|string|max:255',
            'disponible' => 'sometimes|boolean',
        ]);

        $classe = Classe::create($request->all());
        return response()->json($classe, 201);
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
        $classe = Classe::find($id);
        if (!$classe) {
            return response()->json(['message' => 'Classe non trouvée'], 404);
        }

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'niveau' => 'sometimes|required|string|max:255',
            'disponible' => 'sometimes|boolean',
        ]);

        $classe->update($request->only(['nom', 'niveau', 'disponible']));
        return response()->json($classe);
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
}