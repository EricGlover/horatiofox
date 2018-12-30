<?php

  declare(strict_types=1);

  namespace Foxy;

  class DB
  {
    /** @var \PDO **/
    private static $pdo;
    /** @var bool **/
    private static $init = false;

    private static function init()
    {
      try {
        self::$pdo = new \PDO('mysql:host=localhost;dbname=horatio_fox', "root", "");
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
