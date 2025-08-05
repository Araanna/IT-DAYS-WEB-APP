<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;

class Kernel extends HttpKernel
{
    /**
     * Global HTTP middleware stack.
     */
    protected $middleware = [
        // Add this as the FIRST item in your middleware array:
        \Illuminate\Http\Middleware\HandleCors::class,

        // Keep your existing middleware:
        HandleAppearance::class,
    ];

    // Rest of your Kernel file remains exactly the same...
    protected $middlewareGroups = [
        'web' => [
            HandleInertiaRequests::class,
        ],
        'api' => [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    protected $routeMiddleware = [
        // Your existing route middleware...
    ];
}
