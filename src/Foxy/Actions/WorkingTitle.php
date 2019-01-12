<?php

  declare(strict_types=1);

  namespace Foxy\Actions;

  use Symfony\Component\HttpFoundation\Request;
  use Symfony\Component\HttpFoundation\Response;

  class WorkingTitle
  {
    public function __invoke(Request $request) : Response
    {
      return new Response("not implemented yet");
    }
  }
