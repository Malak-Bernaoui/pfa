<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class EnseignantController extends Controller
{
    public function store(Request $request)
    {
        $rules = [
            'user_id' => 'nullable|exists:users,id',
            'nom' => 'required|string',
            'prenom' => 'nullable|string',
            'email' => 'required_without:user_id|email|unique:users',
            'password' => 'required_without:user_id|min:6',
            'matiere' => 'required|string',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->filled('user_id')) {
            $user = User::find($request->user_id);
            if (!$user) return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        } else {
            $user = User::create([
                'name' => $request->nom . ' ' . ($request->prenom ?? ''),
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
        }

        $enseignant = Enseignant::create([
            'user_id' => $user->id,
            'nom' => $request->nom,
            'matiere' => $request->matiere,
        ]);

        return response()->json($enseignant->load('user'), 201);
    }
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
    public function index()
    {
        $enseignants = Enseignant::with('user')->get();
        return response()->json($enseignants);
    }

        public function cours($id)
        {
            $enseignant = Enseignant::find($id);
            if (!$enseignant) {
                return response()->json(['message' => 'Enseignant non trouvé'], 404);
            }
            // Retourner les cours de cet enseignant (vous devez adapter selon votre BDD)
            $cours = []; 
            return response()->json($cours);
        }
        public function update(Request $request, $id)
    {
        $enseignant = Enseignant::find($id);
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 404);
        }

        $rules = [
            'nom' => 'required|string',
            'prenom' => 'nullable|string',
            'email' => 'nullable|email|unique:users,email,' . $enseignant->user_id,
            'password' => 'nullable|min:6',
            'matiere' => 'required|string',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Mise à jour des champs de l'enseignant
        $enseignant->nom = $request->nom;
        $enseignant->matiere = $request->matiere;
        $enseignant->save();

        // Mise à jour de l'utilisateur associé
        $user = $enseignant->user;
        if ($user) {
            if ($request->has('nom') || $request->has('prenom')) {
                $user->name = $request->nom . ' ' . ($request->prenom ?? '');
            }
            if ($request->filled('email')) {
                $user->email = $request->email;
            }
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }
            $user->save();
        }

        return response()->json($enseignant->load('user'));
    }

    public function destroy($id)
    {
        $enseignant = Enseignant::find($id);
        if (!$enseignant) {
            return response()->json(['message' => 'Enseignant non trouvé'], 404);
        }
        $enseignant->user->delete();
        $enseignant->delete();
        return response()->json(['message' => 'Enseignant supprimé']);
    }
}