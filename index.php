<?php

  function http2ServerPush(string $uri, string $as) : void
  {
    header("Link: <{$uri}>; rel=preload; as=$as", false);
  }

  http2ServerPush("/web/lib/semantic/semantic.min.css", "text/css");
  http2ServerPush("/web/lib/semantic/semantic.min.css", "text/javascript");

  # setup static files
  # for running locally let's just poop out index.html
  readfile(__DIR__ . "/web/index.html");
