<?php

declare(strict_types=1);

namespace Foxy\Middleware;

use Symfony\Component\HttpFoundation\Request;

class DecodeJson
{
    public function __invoke(Request $request)
    {
        if (0 === strpos($request->headers->get('Content-Type') ?? "", 'application/json')) {
            $data = json_decode($request->getContent(), true);
            $request->request->replace(is_array($data) ? $data : array());
        }
    }
}
