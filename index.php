<?php
  // god I hate php

  // setup the autoloader
  require("vendor/autoload.php");

  // setup error logging
  use Monolog\Logger;
  use Monolog\Handler\StreamHandler;
  use Silex\Application;
  use Foxy\Middleware\Authenticate;
  use Foxy\Actions\Login;
  use Foxy\Actions\Logout;
  use Foxy\Actions\GetLandingPage;
  use Foxy\Actions\CreateUser;
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
    $message = $errno . "\n" . $errstr . PHP_EOL . "$errfile : $errline";
    $log->error($message);
  };
  $exceptionHandler = function(Throwable $ex) use(&$log)
  {
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
    return new Response("error");
  });
  // $app->error(function(\Exception) {
  //   return Response("error");
  // });

  // setup middleware
  $app->before(function (Request $request) {
    if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
        $data = json_decode($request->getContent(), true);
        $request->request->replace(is_array($data) ? $data : array());
    }
  });

  // authenticate
  $app->before(new Authenticate());
  // authorize

  // build routes
  $app->get("/", new GetLandingPage());

  // login
  $app->post("/login", new Login());
  // logout
  $app->post("/logout", new Logout());
  // create user
  $app->post("/users", new CreateUser());

  // handle request
  $app->run();
