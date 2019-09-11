<?php

  declare(strict_types=1);

  namespace Foxy\Actions;

  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Twig_Environment;
  use Twig_Loader_Filesystem;

  class WorkingTitle
  {
    public function __invoke(Request $request) : Response
    {
      $loader = new Twig_Loader_Filesystem(__DIR__ . "/../../.." . '/templates');
      $twig = new Twig_Environment($loader);
      return new Response($twig->render("workingTitle.twig"));
    }
  }
