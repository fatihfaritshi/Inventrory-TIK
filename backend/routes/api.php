<?php

// routes/api.php
Route::get('/test', function () {
    return response()->json([
        'message' => 'API connected'
    ]);
});

