<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\AsetController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\LokasiController;
use App\Http\Controllers\PenilaianController;
use App\Http\Controllers\PemeliharaanController;
use App\Http\Controllers\RiwayatScanController;

// routes/api.php

Route::get('/test', function () {
    return response()->json(['message' => 'API connected']);
});

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/me', fn(Request $request) => response()->json($request->user()));

// ✅ Penilaian: route statis SEBELUM apiResource
Route::get('penilaians/ranking', [PenilaianController::class, 'ranking']);
Route::post('penilaians/recalculate', [PenilaianController::class, 'recalculate']);
Route::apiResource('penilaians', PenilaianController::class);

// ✅ Pemeliharaan: route statis SEBELUM apiResource
Route::get('pemeliharaans/prioritas', [PemeliharaanController::class, 'getPrioritas']);
Route::get('pemeliharaans/statistik', [PemeliharaanController::class, 'statistik']);
Route::post('pemeliharaans/{id}/selesai', [PemeliharaanController::class, 'markAsCompleted']);
Route::apiResource('pemeliharaans', PemeliharaanController::class);

Route::apiResource('asets', AsetController::class);
Route::apiResource('users', UsersController::class);
Route::apiResource('lokasis', LokasiController::class);
Route::post('bulk-scan-rfid', [RiwayatScanController::class, 'bulkScanRfid']);
Route::apiResource('riwayat-scans', RiwayatScanController::class);


