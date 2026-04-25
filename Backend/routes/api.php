<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\EtudiantController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);


    Route::get('/enseignants/{id}', [EnseignantController::class, 'show']);
    Route::get('/enseignants/{id}/cours', [EnseignantController::class, 'cours']);

    Route::get('/etudiants/{id}', [EtudiantController::class, 'show']);
    Route::get('/etudiants/{id}/notes', [EtudiantController::class, 'notes']);
    Route::get('/etudiants/{id}/absences', [EtudiantController::class, 'absences']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});