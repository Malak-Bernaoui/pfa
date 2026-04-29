<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\NoteController;  
use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\ContactController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);


    Route::get('/enseignants/{id}', [EnseignantController::class, 'show']);
    Route::get('/enseignants/{id}/cours', [EnseignantController::class, 'cours']);

    Route::apiResource('/etudiants', EtudiantController::class);
    Route::get('/etudiants/{id}/notes', [NoteController::class, 'getNotesByEtudiant']);
    Route::get('/etudiants/{id}/absences', [AbsenceController::class, 'getAbsencesByEtudiant']);

    Route::apiResource('/classes', ClasseController::class);
    Route::put('/classes/{id}/assign-teacher', [ClasseController::class, 'assignTeacher']);
    Route::apiResource('/notes', NoteController::class);
    Route::apiResource('/absences', AbsenceController::class);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
    Route::delete('/absences/{id}', [AbsenceController::class, 'destroy']);
    Route::get('/enseignants', [EnseignantController::class, 'index']);
    Route::get('/enseignants', [EnseignantController::class, 'index']);
    Route::get('/etudiants/{etudiantId}/notes/matiere', [NoteController::class, 'getNotesByEtudiantAndMatiere']);

    Route::post('/contact', [ContactController::class, 'store']);

});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});
Route::middleware('auth:sanctum')->post('/change-password', [App\Http\Controllers\Api\AuthController::class, 'changePassword']);