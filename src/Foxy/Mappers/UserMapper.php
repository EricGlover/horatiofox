<?php

declare(strict_types=1);

namespace Foxy\Mappers;

use Foxy\DB;
use Foxy\Entities\GameLog;
use Foxy\Entities\User;

class UserMapper
{
    /** @var string */
    private $schema = "horatio_fox";
    /** @var string */
    private $table = "user";

    /** @var \PDO * */
    private $pdo;
    /** @var GameLogMapper */
    private $gameLogMapper;

    /** @var UserMapper */
    private static $mapper;

    public function __construct(\PDO $pdo, GameLogMapper $scoreMapper)
    {
        $this->pdo = $pdo;
        $this->gameLogMapper = $scoreMapper;
    }

    public static function getUserMapper(): UserMapper
    {
        if (!self::$mapper) {
            $pdo = DB::getPDO();
            $gameMapper = new GameMapper($pdo);
            $scoreMapper = new GameLogMapper($pdo, $gameMapper);
            self::$mapper = new UserMapper($pdo, $scoreMapper);
        }
        return self::$mapper;
    }

    public function getUserByEmail(string $email): ?User
    {
        $query = <<<EOT
select *
from $this->schema.$this->table
where email = :email;
EOT;

        $statement = $this->pdo->prepare($query);
        $statement->bindParam(":email", $email);
        $statement->execute();
        $results = $statement->fetch(\PDO::FETCH_OBJ);
        if (empty($results)) {
            return null;
        }
        return $this->convertIntoEntity($results);
    }

    public function getUserById(int $id): ?User
    {
        $query = <<<EOT
select *
from $this->schema.$this->table
where user_id = :id;
EOT;
        $statement = $this->pdo->prepare($query);
        $statement->bindParam(":id", $id);
        $statement->execute();
        $results = $statement->fetch(\PDO::FETCH_OBJ);
        if (empty($results)) {
            return null;
        }
        return $this->convertIntoEntity($results);
    }

    public function create(User &$user)
    {
        $query = <<<EOT
INSERT INTO $this->schema.$this->table
(email, username, password, first_name, last_name, avatar_img, active, token)
VALUES (:email, :username, :password, :firstName, :lastName, :avatarImg, :active, :token);
EOT;
        try {
            $statement = $this->pdo->prepare($query);
            $params = [
                ":email" => $user->getEmail(),
                ":username" => $user->getUsername(),
                ":password" => $user->getPassword(),
                ":firstName" => $user->getFirstName(),
                ":lastName" => $user->getLastName(),
                ":avatarImg" => $user->getAvatarImg(),
                ":active" => (int)$user->getActive(),
                ":token" => $user->getToken()
            ];
            if (!$statement->execute($params)) {
                error_log("failed to create");
                $code = $statement->errorCode();
                $info = print_r($statement->errorInfo(), true);
                $ex = new \Exception("SQL ERROR : $code. $info");
                throw $ex;
            }
        } catch (\Exception $e) {
            error_log("creation error");
            error_log($e->getMessage());
            throw $e;
        }
        $user->setId((int)$this->pdo->lastInsertId());

        // create score records (probably none but I'll play it safe)
        /** @var GameLog $log */
        foreach ($user->getGameLogs() as $log) {
            $this->gameLogMapper->create($log);
        }
    }

    public function update(User $user)
    {
        $query = <<<EOT
UPDATE $this->schema.$this->table
SET email = :email, username = :username, password = :password, first_name = :firstName, last_name = :lastName, last_login = :lastLogin, avatar_img = :avatarImg, active = :active, token = :token, playtester = :playtester
WHERE user_id = :user_id
LIMIT 1;
EOT;
        $statement = $this->pdo->prepare($query);
        $params = [
            ":email" => $user->getEmail(),
            ":username" => $user->getUsername(),
            ":password" => $user->getPassword(),
            ":firstName" => $user->getFirstName(),
            ":lastName" => $user->getLastName(),
            ":lastLogin" => $this->formatDate($user->getLastLogin()),
            ":avatarImg" => $user->getAvatarImg(),
            ":active" => (int)$user->getActive(),
            ":token" => $user->getToken(),
            ":user_id" => (int)$user->getId(),
            ":playtester" => (int)$user->isPlaytester(),
        ];
        $statement->execute($params);
    }

    //TODO::
    // should probably address the timezone issue at some point
    // it's currently set to UTC
    private function formatDate(\DateTime $d): string
    {
        return $d->format("Y-m-d H:i:s");
    }

    private function convertIntoEntity(\stdClass $row): User
    {
        $user = new User($row->email, $row->password, $row->username, $row->first_name, $row->last_name, $row->avatar_img, false, (bool)$row->playtester);
        $user->setId((int)$row->user_id);
        $user->lastLogin = new \DateTime($row->last_login);
        $user->joinedAt = new \DateTime($row->joined_at);
        $user->active = (bool)$row->active;
        $user->avatarImg = $row->avatar_img;
        $user->token = $row->token;
        // get scores
        $user->setGameLogs($this->gameLogMapper->getGameLogsForUser($user));
        return $user;
    }
}
