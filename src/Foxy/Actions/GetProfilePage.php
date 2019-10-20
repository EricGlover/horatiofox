<?php

declare(strict_types=1);

namespace Foxy\Actions;

use Foxy\Entities\Game;
use Foxy\Entities\GameLog;
use Foxy\Entities\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;
use Twig_Environment;
use Twig_Loader_Filesystem;

class GetProfilePage
{
    public function __invoke(Request $request, Application $app): Response
    {
        $loader = new Twig_Loader_Filesystem(__DIR__ . "/../../.." . '/templates');
        $twig = new Twig_Environment($loader);
        /** @var User $user */
        $user = $app["user"];
        $loggedIn = !empty($user);
        $recentGames = [];
        $highScores = [];
        if($loggedIn) {
            // sort recent game logs by date
            $recentGames = $user->getGameLogs();
            usort($recentGames, function(GameLog $a, GameLog $b) : int {
                if($a->getOccurredAt() == $b->getOccurredAt()) return 0;
                return $a->getOccurredAt() > $b->getOccurredAt() ?  -1 : 1;
            });

            // find high scores (title => array len >= 5)

            // sort by game, title => allLogs
            /** @var GameLog $log */
            foreach($user->getGameLogs() as $log) {
                $title = $log->getGame()->getTitle();
                if(!isset($highScores[$title])) $highScores[$title] = [];
                $highScores[$title][] = $log;
            }
            // foreach game sort logs by score
            /**
             * @var string $title
             * @var  GameLog[] $logs
             */
            foreach($highScores as $title => $logs) {
                usort($logs, function(GameLog $a, GameLog $b) : int {
                    if($a->getScore() === $b->getScore()) return 0;
                    return $a->getScore() > $b->getScore() ? -1 : 1;
                });
                // filter down the list of logs to the first 5
                $highScores[$title] = array_slice($logs, 0, 5);
            }
            // twig doesn't allow you to print the key of an array so split up the keys
            // and the values into two separate arrays
            $highScoreGameTitles = array_keys($highScores);
        }

        $context = [
            "playTester" => $user->isPlaytester(),
            "user" => $user,
            "loggedIn" => $loggedIn,
            "recentGames" => $recentGames,
            "noRecentGames" => count($recentGames) === 0,
            "highScores" => $highScores,
            "highScoreGameTitles" => $highScoreGameTitles,
            "noHighScores" => count($highScores) === 0
        ];
        return new Response($twig->render("profile.twig", $context));
    }
}
