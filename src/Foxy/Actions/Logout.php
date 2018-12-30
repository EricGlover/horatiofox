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

  class Logout
  {
    public function __invoke(Request $request, Application $app) : Response
    {
      /** @var User **/
      $user = $app["user"];
      if(empty($user)) {
        return new Response("You're not logged in.", 400);
      }
      $user->logout();
      $pdo = DB::getPDO();
      $mapper = new UserMapper($pdo);
      $mapper->update($user);
      session_start();
      unset($_SESSION["user"]);
      \session_write_close();
      return new Response();
    }
  }
