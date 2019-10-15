<?php

  declare(strict_types=1);

  namespace Foxy;

  class DB
  {
    /** @var \PDO **/
    private static $pdo;
    /** @var bool **/
    private static $init = false;
    private static $dbname = "horatio_fox";

    private static function init()
    {
      include(__DIR__ . "/../../config.php");
      $host = $config['HOST'];
      $dbname = self::$dbname;
      $user = $config["DB_USERNAME"];
      $password = $config["DB_PASSWORD"];
      try {
        self::$pdo = new \PDO("mysql:host=$host;dbname=$dbname", $user, $password);
      } catch (\Exception $e) {
        error_log("pdo error");
        error_log($e->getMessage());
        throw $e;
      }
    }

    public static function getPDO() : \PDO
    {
      if(!self::$init) {
        self::init();
      }
      return self::$pdo;
    }
  }
