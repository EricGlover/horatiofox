<?php

declare(strict_types=1);

namespace Foxy\Actions;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig_Environment;
use Twig_Loader_Filesystem;

class SuperStarTrek
{
    public function __invoke(Request $request, Application $app): Response
    {
        $user = $app['user'];
        $loggedIn = !empty($user);
        $loader = new Twig_Loader_Filesystem(__DIR__ . "/../../.." . '/templates');
        $twig = new Twig_Environment($loader);
        $context = [
            "playTester" => $user->isPlaytester(),
            "user" => $user,
            "loggedIn" => $loggedIn
        ];
        return new Response($twig->render("superStarTrek.twig", $context));
    }
}
