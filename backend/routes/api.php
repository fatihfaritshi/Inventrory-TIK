<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\AsetController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\LokasiController;
use App\Http\Controllers\PemeliharaanController;

// routes/api.php
Route::get('/test', function () {
    return response()->json([
        'message' => 'API connected'
    ]);
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return response()->json($request->user());
});

Route::apiResource('asets', AsetController::class);
Route::apiResource('users', UsersController::class);
Route::apiResource('lokasis', LokasiController::class);
Route::apiResource('pemeliharaans', PemeliharaanController::class);
