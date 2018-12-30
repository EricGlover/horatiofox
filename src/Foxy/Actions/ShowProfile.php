<?php

  declare(strict_types=1);

  namespace Foxy\Actions;

  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Symfony\Component\HttpFoundation\JsonResponse;
  use Silex\Application;
  use Foxy\DB;
  use Foxy\Mappers\UserMapper;
  use Foxy\Entities\User;

  class ShowProfile
  {
    public function __invoke(Request $request, Application $app) : Response
    {
      $user = $app["user"];

      return new Response();
    }
  }
