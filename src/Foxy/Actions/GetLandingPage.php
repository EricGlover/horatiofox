<?php

  declare(strict_types=1);

  namespace Foxy\Actions;

  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Symfony\Component\HttpFoundation\JsonResponse;
  use Silex\Application;
  use Twig_Environment;
  use Twig_Loader_Filesystem;

  class GetLandingPage
  {
    public function __invoke(Request $request, Application $app) : Response
    {
      $loader = new Twig_Loader_Filesystem(__DIR__ . "/../../.." . '/templates');
      $twig = new Twig_Environment($loader);
      $user = $app["user"];
      $loggedIn = !empty($user);
      return new Response($twig->render("index.twig", ["user" => $user, "loggedIn" => $loggedIn]));
    }
  }
