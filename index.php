<?php
  // god I hate php

  // setup the autoloader
  require("vendor/autoload.php");

  // setup error logging
  use Monolog\Logger;
  use Monolog\Handler\StreamHandler;
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
  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Symfony\Component\HttpFoundation\JsonResponse;

  ini_set("log_errors", 1);
  ini_set("error_log", __DIR__ . "/logs/error.log");

  // create a log channel
  $log = new Logger('logMan');
  $log->pushHandler(new StreamHandler(__DIR__ . '/logs/error.1.log', Logger::WARNING));

  $errorHandler = function(int $errno, string $errstr, string $errfile , int $errline , array $errcontext ) use($log)
  {
    error_log("running global error handler");
    $message = $errno . "\n" . $errstr . PHP_EOL . "$errfile : $errline";
    $log->error($message);
  };
  $exceptionHandler = function(Throwable $ex) use(&$log)
  {
    error_log("running global exception handler");
    $log->error($ex->getMessage());
    $log->error($ex->getTraceAsString());
    throw $ex;
  };
  set_error_handler($errorHandler);
  set_exception_handler($exceptionHandler);

  //set timezone
  date_default_timezone_set("America/Chicago");

  // setup Silex app
  $app = new Application();
  $app->error(function(\Exception $e) {
    error_log($e->getMessage());
    error_log("running app error");
    return new Response("error", 500);
  });

  // setup middleware
  $app->before(new DecodeJson());

  // authenticate
  $app->before(new Authenticate());
  // authorize

  // build routes
  $app->get("/", new GetLandingPage());
  $app->get("/profile", new GetProfilePage())->before(new LoggedInOnly());

  // login
  $app->post("/login", new Login());
  // logout
  $app->post("/logout", new Logout());
  // create user
  $app->post("/users", new CreateUser());
  // edit user
  $app->put("/editProfile", new EditProfile())->before(new LoggedInOnly());

  // handle request
  $app->run();
