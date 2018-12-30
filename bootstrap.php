<?php
  // god I hate php

  // setup the autoloader
  require("vendor/autoload.php");

  // setup error logging
  use Monolog\Logger;
  use Monolog\Handler\StreamHandler;
  use Silex\Application;
  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;

  // create a log channel
  $log = new Logger('logMan');
  $log->pushHandler(new StreamHandler(__DIR__ . '/logs/error.log', Logger::WARNING));

  // $log->error('Bar');
  $errorHandler = function(int $errno, string $errstr, string $errfile , int $errline , array $errcontext ) use($log)
  {
    $log->warning(" error handler ");
    $message = $errno . "\n" . $errstr . PHP_EOL . "$errfile : $errline";
    $log->error($message);
  };
  $exceptionHandler = function($ex) use(&$log)
  {
    $log->warning(" exception handler");
    $log->error($ex->getMessage());
  };
  set_error_handler($errorHandler);
  set_exception_handler($exceptionHandler);

  // authenticate

  // start session

  // authorize

  // setup Silex app
  $app = new Application();

  // build routes
  $app->get("/web", function() {
    return false;
  });
  $app->get("/", function(Request $request) use($log) {
    $log->warning("/ running");
    $index = file_get_contents(__DIR__ . "/web/index.html");
    return new Response($index);
  });
  $app->get("/test", function(Request $request) {
    return new Response("hello test");
  });
  $app->get("", function() use($log) {
    $log->warning("ohhh noes");
    return false;
  });
  // handle request
  $app->run();
