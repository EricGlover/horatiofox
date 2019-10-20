<?php


namespace Foxy\Actions\SuperStarTrek;


use Foxy\Entities\GameLog;
use Foxy\Entities\User;
use Foxy\Mappers\GameLogMapper;
use Foxy\Mappers\GameMapper;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class CreateGameLog
{
    public function __invoke(Request $request, Application $app)
    {
        /** @var User * */
        $user = $app["user"];
        // get some request vars
        $body = $request->request;
        $score = $body->getInt("score", 0);
        $victory = $body->getBoolean("victory", false);
        $gameId = $body->getInt('gameId');

        // try and get the game
        $gameMapper = GameMapper::getGameMapper();
        $game = $gameMapper->getGameById($gameId);

        if (empty($game)) {
            return new Response("Game not recognized.", 400);
        }
        // make log
        $log = GameLog::makeLog($user, $game, $score, $victory);

        // save to db
        $mapper = GameLogMapper::getGameLogMapper();
        $mapper->create($log);
        return new Response();
    }
}