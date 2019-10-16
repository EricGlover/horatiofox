<?php

  declare(strict_types=1);

  namespace Foxy\Actions;

  use Foxy\Entities\User;
  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Silex\Application;
  use Twig_Environment;
  use Twig_Loader_Filesystem;

  class GetProfilePage
  {
    public function __invoke(Request $request, Application $app) : Response
    {
      $loader = new Twig_Loader_Filesystem(__DIR__ . "/../../.." . '/templates');
      $twig = new Twig_Environment($loader);
      /** @var User $user */
      $user = $app["user"];
      $loggedIn = !empty($user);
      return new Response($twig->render("profile.twig", ["playTester" => $user->isPlaytester(), "user" => $user, "loggedIn" => $loggedIn]));
    }
  }
