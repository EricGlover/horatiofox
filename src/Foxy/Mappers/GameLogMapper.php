<?php


namespace Foxy\Mappers;

use Foxy\DB;
use Foxy\Entities\GameLog;
use Foxy\Entities\User;

class GameLogMapper
{
    private $schema = "horatio_fox";
    private $table = "game_log";

    /** @var GameLogMapper */
    private static $mapper;

    /** @var \PDO * */
    private $pdo;
    /** @var GameMapper */
    private $gameMapper;

    public function __construct(\PDO $pdo, GameMapper $gameMapper)
    {
        $this->pdo = $pdo;
        $this->gameMapper = $gameMapper;
    }

    public static function getGameLogMapper() : GameLogMapper
    {
        if(!self::$mapper) {
            $pdo = DB::getPDO();
            $gameMapper = new GameMapper($pdo);
            self::$mapper = new GameLogMapper($pdo, $gameMapper);
        }
        return self::$mapper;
    }

    public function create(GameLog $log) : void
    {
        $query = <<<EOT
insert into $this->schema.$this->table 
(user_id, game_id, score, victory)
values (:user_id, :game_id, :score, :victory)
EOT;
        $statement = $this->pdo->prepare($query);
        $params = [
            ":user_id" => $log->getUser()->getId(),
            ":game_id" => $log->getGame()->getId(),
            ":score" => $log->getScore(),
            ":victory" => (int)$log->isVictory()
            ];
        if(!$statement->execute($params)){
            error_log('creating game log failed');
            $code = $statement->errorCode();
            $info = print_r($statement->errorInfo(), true);
            $ex = new \Exception("SQL ERROR : $code. $info");
            throw $ex;
        }
        $log->setId((int) $this->pdo->lastInsertId());
    }

    /**
     * @param User $user
     * @return GameLog[]
     * @throws \Exception
     */
    public function getGameLogsForUser(User $user) : array
    {
        /** @var GameLog[] $logs */
        $logs = [];
        $query = <<<EOT
select *
from $this->schema.$this->table
where user_id = :user_id
EOT;
        $statement = $this->pdo->prepare($query);
        $statement->execute([':user_id' => $user->getId()]);
        $results = $statement->fetchAll(\PDO::FETCH_OBJ);
        if (empty($results)) {
            return $logs;
        }
        $games = [];
        foreach ($results as $result) {
            /** @var GameLog $log */
            $log = $this->convertIntoEntity($result);
            $log->setUser($user);
            // get the game
            $gameId = (int) $result->game_id;
            if(!isset($games[$gameId])) {
                $game = $this->gameMapper->getGameById($gameId);
                $games[$gameId] = $game;
            }
            $log->setGame($games[$gameId]);
            // add to logs found
            $logs[] = $log;
        }
        return $logs;
    }


    private function convertIntoEntity(\stdClass $row): GameLog
    {
        $at = new \DateTime($row->occurred_at);
        return new GameLog((int)$row->score, (bool)$row->victory, $at);
    }
}