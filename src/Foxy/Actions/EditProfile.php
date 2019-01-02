<?php

  declare(strict_types=1);

  namespace Foxy\Actions;

  use Foxy\DB;
  use Foxy\Mappers\UserMapper;
  use Foxy\Entities\User;
  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Symfony\Component\HttpFoundation\JsonResponse;
  use Silex\Application;


  class EditProfile
  {
    public function __invoke(Request $request, Application $app)
    {
      /** @var User **/
      $user = $app["user"];

      $body = $request->request;
      $email = $body->get("email");
      $username = $body->get("username");
      $firstName = $body->get("firstName");
      $lastName = $body->get("lastName");
      $user->setEmail($email);
      $user->setUsername($username);
      $user->setFirstName($firstName);
      $user->setLastName($lastName);

      $pdo = DB::getPDO();
      $mapper = new UserMapper($pdo);
      $mapper->update($user);
      return new Response();
    }
  }
