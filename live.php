<?php
$o = file_get_contents('http://skai.smart-tv-data.com/img/live/schedule.json?'.rand());
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo $o;
