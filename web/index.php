<?php
  // setup the autoloader
  require(__DIR__ . "/../vendor/autoload.php");

  // setup error logging
  use Monolog\Logger;
  use Monolog\Handler\StreamHandler;
  use Foxy\ApplicationBuilder;


  ini_set("log_errors", 1);
  ini_set("error_log", __DIR__ . "/../logs/error.log");

  // create a log channel
  $log = new Logger('logMan');
  $log->pushHandler(new StreamHandler(__DIR__ . '/../logs/error.1.log', Logger::WARNING));

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

  $builder = new ApplicationBuilder();
  $app = $builder->buildApp();

  // handle request
  $app->run();
