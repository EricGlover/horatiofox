<?php

  declare(strict_types=1);

  namespace Foxy;

  use Silex\Application;
  use Foxy\Middleware\Authenticate;
  use Foxy\Middleware\DecodeJson;
  use Foxy\Middleware\LoggedInOnly;
  use Foxy\Actions\Login;
  use Foxy\Actions\Logout;
  use Foxy\Actions\GetLandingPage;
  use Foxy\Actions\GetProfilePage;
  use Foxy\Actions\CreateUser;
  use Foxy\Actions\EditProfile;
  use Foxy\Actions\WorkingTitle;
  use Foxy\Actions\Pong;
  use Foxy\Actions\SuperStarTrek;
  use Foxy\Actions\SuperStarTrek\GetHelp;
  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Symfony\Component\HttpFoundation\JsonResponse;

  class ApplicationBuilder
  {
    public function buildApp() : Application
    {
      $app = new Application();
      $this->setErrorHandler($app);
      $this->buildMiddleware($app);
      $this->buildRoutes($app);
      return $app;
    }

    private function setErrorHandler(Application &$app) : void
    {
      $app->error(function(\Exception $e) {
        error_log($e->getMessage());
        error_log("running app error");
        return new Response("error", 500);
      });
    }

    private function buildMiddleware(Application &$app) : void
    {
      // setup middleware
      $app->before(new DecodeJson());

      // authenticate
      $app->before(new Authenticate());
      // authorize
    }

    private function buildRoutes(Application &$app) : void
    {
      $app->get("/", new GetLandingPage());

      // games
      // unfinished game
      $app->get("/games/workingTitle", new WorkingTitle());
      // pong
      $app->get("/games/pong", new Pong());
      // star trek
      $app->get("/games/superStarTrek", new SuperStarTrek());
      $app->get('/games/superStarTrek/help', new GetHelp());

      $app->get("/profile", new GetProfilePage())->before(new LoggedInOnly());

      // login
      $app->post("/login", new Login());
      // logout
      $app->post("/logout", new Logout());
      // create user
      $app->post("/users", new CreateUser());
      // edit user
      $app->put("/editProfile", new EditProfile())->before(new LoggedInOnly());
    }
  }
