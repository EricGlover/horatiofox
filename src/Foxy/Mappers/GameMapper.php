<?php


namespace Foxy\Mappers;


use Foxy\DB;
use Foxy\Entities\Game;

class GameMapper
{
    /** @var \PDO * */
    private $pdo;

    /** @var GameMapper */
    private static $mapper;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public static function getGameMapper() : GameMapper
    {
        if(!self::$mapper) {
            $pdo = DB::getPDO();
            self::$mapper = new GameMapper($pdo);
        }
        return self::$mapper;
    }

    public function getGameById(int $id): ?Game
    {
        $query = <<<EOT
select *
from horatio_fox.game
where game_id = :game_id;
EOT;
        $statement = $this->pdo->prepare($query);
        if (!$statement->execute([':game_id' => $id])) {
            $code = $statement->errorCode();
            $info = print_r($statement->errorInfo(), true);
            $ex = new \Exception("SQL ERROR : $code. $info");
            throw $ex;
        }
        $result = $statement->fetch(\PDO::FETCH_OBJ);
        if(empty($result)) {
            return null;
        }
        return $this->convertIntoEntity($result);
    }


    private function convertIntoEntity(\stdClass $row): Game
    {
        $game = new Game($row->title);
        $game->setId( $row->game_id);
        return $game;
    }
}