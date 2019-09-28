<?php

  declare(strict_types=1);

  namespace Foxy\Actions\SuperStarTrek;

  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;
  use Twig_Environment;
  use Twig_Loader_Filesystem;

  class GetHelp
  {
    public function __invoke(Request $request) : Response
    {
      $command = $request->query->get('command');

      // look for a text file
      $filePath = realpath(__DIR__ . '/../../Games/SuperStarTrek/HelpDocs/' . $command . '.txt');

      // throws a nasty Error if it doesn't exist
      try {
        if(!\file_exists($filePath)) {
          return new Response("Command $command not found.", 404);
        }
      } catch(\Throwable $e) {
        return new Response("Command $command not found.", 404);
      }

      // read contents
      return new Response(\file_get_contents($filePath, true));
    }
  }
