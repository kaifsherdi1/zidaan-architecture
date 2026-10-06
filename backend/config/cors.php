<?php

$origins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
)));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // In local dev, allow the Vite servers; in production, use CORS_ALLOWED_ORIGINS.
    'allowed_origins' => $origins ?: [
        'http://localhost:5173', 'http://127.0.0.1:5173', // frontend-dashboard
        'http://localhost:5174', 'http://127.0.0.1:5174', // frontend-user
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    // Token auth uses Authorization headers, not cookies.
    'supports_credentials' => false,

];
