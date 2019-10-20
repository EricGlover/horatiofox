<?php

declare(strict_types=1);

namespace Foxy\Middleware;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Silex\Application;

class LoggedInOnly
{
    public function __invoke(Request $request, Application $app)
    {
        $user = $app["user"];
        // if there's no user then redirect to /
        if (empty($user)) {
            return new RedirectResponse("/");
        }
    }
}
