<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('/cat_foods', App\Http\Controllers\Api\catFoodController::class);
Route::apiResource('/cat_toys', App\Http\Controllers\Api\catToyController::class);
