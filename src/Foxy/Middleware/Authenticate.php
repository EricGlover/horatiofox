<?php

  declare(strict_types=1);

  namespace Foxy\Middleware;

  use Foxy\DB;
  use Foxy\Mappers\UserMapper;
  use Symfony\Component\HttpFoundation\Request;
  use Silex\Application;

  class Authenticate
  {
    public function __invoke(Request $request, Application $app)
    {
      $user = null;
      session_start();
      if (!isset($_SESSION["user"])) {     //if not logged in
        $app['user'] = null;
      } else {
        $user = $_SESSION["user"];
        $userId = (int) $user["id"];
        $pdo = DB::getPDO();
        $mapper = new UserMapper($pdo);
        $user = $mapper->getUserById($userId);
      }
      $app["user"] = $user;
      session_write_close();
    }
  }
