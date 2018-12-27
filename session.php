<?php




  //authenticate

  //start session
  session_name("id");
  // session_start();

  //authorize

  echo "hello testing sessions";
  echo "<br>";

  //testing cookies for funsies

  echo print_r($_COOKIE, true);

  echo "<br>";
  $visits = $_COOKIE["visits"] ?? 0;
  $visits += 1;

  setcookie("visits", (string) $visits);
  // error_log("hello logging");
  echo "session = " . print_r($_SESSION, true) . "<br>";

  session_write_close();
?>

  <p>You've been here a total of <?= $visits ?> times.</p>

  <h5>Session things</h5>
  <p>Session Id = <?= session_id() ?></p>
  <p>Username : <?= $_SESSION["username"] ?></p>
  <p>Password : <?= $_SESSION["password"] ?></p>
  <p>Email : <?= $_SESSION["email"] ?></p>
