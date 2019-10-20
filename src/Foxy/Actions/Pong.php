<?php

declare(strict_types=1);

namespace Foxy\Actions;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig_Environment;
use Twig_Loader_Filesystem;

class Pong
{
    public function __invoke(Request $request, Application $app): Response
    {
        $user = $app['user'];
        $loggedIn = !empty($user);

        $loader = new Twig_Loader_Filesystem(__DIR__ . "/../../.." . '/templates');
        $twig = new Twig_Environment($loader);
        $context = ['user' => $user, 'loggedIn' => $loggedIn];
        return new Response($twig->render("pong.twig", $context));
    }
}
