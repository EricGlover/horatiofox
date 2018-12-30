<?php

  declare(strict_types=1);

  namespace Foxy\Actions;

  use Foxy\DB;
  use Foxy\Mappers\UserMapper;
  use Foxy\Entities\User;
  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Symfony\Component\HttpFoundation\JsonResponse;


  class CreateUser
  {
    public function __invoke(Request $request)
    {
      $body = $request->request;
      $email = $body->get("email");
      $password = $body->get("password");
      $username = $body->get("username");
      $user = new User($email, $password, $username);
      $user->login();

      $pdo = DB::getPDO();
      $mapper = new UserMapper($pdo);
      $mapper->create($user);
      return new Response();
    }
  }
