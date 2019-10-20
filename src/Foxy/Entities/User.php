<?php

declare(strict_types=1);

namespace Foxy\Entities;


class User
{
    private $id;
    private $email;
    private $username;
    private $password;  //hashed
    private $firstName;
    private $lastName;
    private $name;
    public $joinedAt;
    public $lastLogin;
    public $avatarImg;
    public $active;
    public $token;
    private $verified;
    /** @var boolean */
    private $playtester;
    /** @var GameLog[] */
    private $gameLogs;

    public function __construct(string $email, string $password, string $username = null, string $firstName = null, string $lastName = null, string $avatarImg = null, bool $hashForMe = true, bool $playtester = false)
    {
        $this->email = $email;
        if ($hashForMe) {
            $this->setPassword($password);
        } else {
            $this->password = $password;
        }
        $this->username = $username;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->avatarImg = $avatarImg;
        $this->verified = false;
        $this->playtester = $playtester;
        $this->gameLogs = [];
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): void
    {
        $this->username = $username;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): void
    {
        $this->firstName = $firstName;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): void
    {
        $this->lastName = $lastName;
    }

    public function getJoinedAt(): \DateTime
    {
        return $this->joinedAt;
    }

    public function getLastLogin(): \DateTime
    {
        return $this->lastLogin;
    }

    public function getAvatarImg(): ?string
    {
        return $this->avatarImg;
    }

    public function setAvatarImg(string $img): void
    {
        $this->avatarImg = $img;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function getActive(): bool
    {
        return $this->active;
    }

    public function setPassword(string $password): void
    {
        //hash it
        $this->password = password_hash($password, PASSWORD_DEFAULT);
    }

    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->password);
    }

    public function isVerified(): bool
    {
        return $this->verified;
    }

    public function setVerified(bool $verified)
    {
        $this->verified = $verified;
    }

    public function login(): void
    {
        $this->active = true;
        $this->lastLogin = new \DateTime();
    }

    public function logout(): void
    {
        $this->active = false;
        //todo:: log playtime for this session
    }

    /**
     * @return bool
     */
    public function isPlaytester(): bool
    {
        return $this->playtester;
    }

    /**
     * @param bool $playtester
     */
    public function setPlaytester(bool $playtester): void
    {
        $this->playtester = $playtester;
    }

    /**
     * @return GameLog[]
     */
    public function getGameLogs(): array
    {
        return $this->gameLogs;
    }

    /**
     * @param GameLog[] $gameLogs
     */
    public function setGameLogs(array $gameLogs): void
    {
        $this->gameLogs = $gameLogs;
    }

    /**
     * @param GameLog $log
     */
    public function addGameLog(GameLog $log) : void
    {
        $this->gameLogs[] = $log;
    }
}
