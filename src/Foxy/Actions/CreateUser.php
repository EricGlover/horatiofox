<?php

declare(strict_types=1);

namespace Foxy\Actions;

use Foxy\DB;
use Foxy\Mappers\UserMapper;
use Foxy\Entities\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;


class CreateUser
{
    /**
     * Must be at least 8 chars long
     *
     *
     **/
    private function isValidPassword(string $password): bool
    {
        $pass = $password;
        //continually trim and strip tags until nothing else changes
        do {
            $before = $pass;
            $pass = trim($pass);
            $pass = \strip_tags($pass);
        } while ($before !== $pass);

        // check length
        return strlen($pass) >= 8;
    }

    public function __invoke(Request $request)
    {
        $body = $request->request;
        $email = \strip_tags($body->get("email"));
        // validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new Response("Invalid email address", 400);
        }

        // validate password
        $password = \strip_tags($body->get("password"));
        if (!$this->isValidPassword($password)) {
            return new Response("Invalid password", 400);
        }

        //TODO:: TEST STRIP TAGS
        $username = \strip_tags($body->get("username"));
        $firstName = \strip_tags($body->get("firstName"));
        $lastName = \strip_tags($body->get("lastName"));
        $user = new User($email, $password, $username, $firstName, $lastName);
        $user->login();
        $mapper = UserMapper::getUserMapper();

        try {
            $mapper->create($user);
        } catch (\Exception $e) {
            error_log("error creating user");
            error_log($e->getMessage());
            return new Response("Something doesn't look right here.", 500);
        }

        // set the session
        session_start();
        $_SESSION["user"] = ["id" => $user->getId()];
        session_write_close();

        //send verification email

        return new Response();
    }
}
