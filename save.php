<?php

$email = file_get_contents("php://input");

if(filter_var($email, FILTER_VALIDATE_EMAIL)) {
    file_put_contents('./emails.txt', $email."\n", FILE_APPEND | LOCK_EX);
} else {
    header("HTTP/1.1 500 Internal Server Error");
    echo "Invalid email";
}

?>
