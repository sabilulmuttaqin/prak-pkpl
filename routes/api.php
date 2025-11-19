<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransaksiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('/cat_foods', App\Http\Controllers\Api\catFoodController::class);
Route::apiResource('/cat_toys', App\Http\Controllers\Api\catToyController::class);
Route::apiResource('/transaksis', App\Http\Controllers\Api\TransaksiController::class);
Route::patch('/transaksis/{id}/status', [TransaksiController::class, 'updateStatus']);
Route::delete('/transaksis/{id}', [TransaksiController::class, 'destroy']); // pastikan ada
