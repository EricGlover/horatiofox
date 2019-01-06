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
      $email = \strip_tags($body->get("email"));

      // validate email
      if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return new Response("Invalid email address", 400);
      }

      $username = \strip_tags($body->get("username"));
      $firstName = \strip_tags($body->get("firstName"));
      $lastName = \strip_tags($body->get("lastName"));
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
