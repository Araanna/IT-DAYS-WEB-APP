<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // This should properly set Access-Control-Allow-Headers
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
