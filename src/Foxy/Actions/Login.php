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

  class Login
  {
    public function __invoke(Request $request, Application $app) : Response
    {
      // need an email and password
      if(!$request->request->has("email") || !$request->request->has("password")) {
        return new Response("", Response::HTTP_BAD_REQUEST);
      }
      $email = $request->request->get("email");
      $password = $request->request->get("password");

      // if they're already logged in
      /** @var User **/
      $user = $app["user"];
      if(!empty($user) && $user->getEmail() === $email) {
        return new Response("Please logout first", 400);
      } else if (!empty($user) && $user->getEmail() !== $email) {       // if they're logged in on a different account
        return new Response("Before switching accounts you need to logout of your current one", 400);
      } else if (!empty($user) && $user->getActive()) {   //they're logged in, maybe on a different device ?
        return new Response("Please logout first", 400);
      }
      // TODO:: RATE LIMIT LOGIN ATTEMPTS

      $pdo = DB::getPDO();
      $mapper = new UserMapper($pdo);
      /** @var User **/
      $user = $mapper->getUserByEmail($email);
      if(empty($user)) {
        error_log("user not found");
        return new Response("Incorrect email and / or password", 400);
      }

      //check password
      if(!$user->verifyPassword($password)) {
        error_log("pass no match");
        return new Response("Incorrect email and / or password", 400);
      }

      //log them in
      $user->login();
      $mapper->update($user);

      // set the session
      session_start();
      $_SESSION["user"] = ["id" => $user->getId()];
      session_write_close();

      return new Response();
    }
  }
