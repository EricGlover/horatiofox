<?php

declare(strict_types=1);

namespace Foxy\Mappers;

use Foxy\Entities\User;

class UserMapper
{
    /** @var \PDO * */
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getUserByEmail(string $email): ?User
    {
        $query = <<<EOT
select *
from horatio_fox.users
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
from horatio_fox.users
where id = :id;
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
INSERT INTO horatio_fox.users
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
    }

    public function update(User $user)
    {
        $query = <<<EOT
UPDATE horatio_fox.users
SET email = :email, username = :username, password = :password, first_name = :firstName, last_name = :lastName, last_login = :lastLogin, avatar_img = :avatarImg, active = :active, token = :token, playtester = :playtester
WHERE id = :id
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
            ":id" => $user->getId(),
            ":playtester" => $user->isPlaytester(),
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
        $user = new User($row->email, $row->password, $row->username, $row->first_name, $row->last_name, $row->avatar_img, false, (bool) $row->playtester);
        $user->setId((int)$row->id);
        $user->lastLogin = new \DateTime($row->last_login);
        $user->joinedAt = new \DateTime($row->joined_at);
        $user->active = (bool)$row->active;
        $user->avatarImg = $row->avatar_img;
        $user->token = $row->token;
        return $user;
    }
}
