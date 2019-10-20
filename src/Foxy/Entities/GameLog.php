<?php

declare(strict_types=1);

namespace Foxy\Entities;

class GameLog
{
    /** @var int */
    private $id;
    /** @var User */
    private $user;
    /** @var Game */
    private $game;
    /** @var int */
    private $score;
    /** @var bool */
    private $victory;
    /** @var \DateTime */
    private $occurredAt;

    public function __construct(int $score, bool $victory, \DateTime $occurredAt = null)
    {
        $this->score = $score;
        $this->victory = $victory;
        if (!$occurredAt) $occurredAt = new \DateTime();
        $this->occurredAt = $occurredAt;
    }

    public static function makeLog(User $user, Game $game, int $score, bool $victory): GameLog
    {
        $gameLog = new GameLog($score, $victory);
        $gameLog->user = $user;
        $gameLog->game = $game;
        $gameLog->score = $score;
        $gameLog->occurredAt = new \DateTime();
        return $gameLog;
    }

    /**
     * @return User
     */
    public function getUser(): User
    {
        return $this->user;
    }

    /**
     * @param User $user
     */
    public function setUser(User $user): void
    {
        $this->user = $user;
    }

    /**
     * @return Game
     */
    public function getGame(): Game
    {
        return $this->game;
    }

    /**
     * @param Game $game
     */
    public function setGame(Game $game): void
    {
        $this->game = $game;
    }

    /**
     * @return int
     */
    public function getScore(): int
    {
        return $this->score;
    }

    /**
     * @param int $score
     */
    public function setScore(int $score): void
    {
        $this->score = $score;
    }

    /**
     * @return bool
     */
    public function isVictory(): bool
    {
        return $this->victory;
    }

    /**
     * @param bool $victory
     */
    public function setVictory(bool $victory): void
    {
        $this->victory = $victory;
    }

    /**
     * @return \DateTime
     */
    public function getOccurredAt(): \DateTime
    {
        return $this->occurredAt;
    }

    /**
     * @param \DateTime $occurredAt
     */
    public function setOccurredAt(\DateTime $occurredAt): void
    {
        $this->occurredAt = $occurredAt;
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId(int $id): void
    {
        $this->id = $id;
    }
}
