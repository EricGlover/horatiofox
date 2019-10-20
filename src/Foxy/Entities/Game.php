<?php

declare(strict_types=1);

namespace Foxy\Entities;

class Game
{
    /** @var int */
    private $id;
    /** @var string  */
    private $title;

    public function __construct(string $title)
    {
        $this->title = $title;
    }

    /**
     * @param int $id
     */
    public function setId(int $id): void
    {
        $this->id = $id;
    }

    /**
     * @param string $title
     */
    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title;
    }
}
