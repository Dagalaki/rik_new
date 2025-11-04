<?php
define('PSSALT', 'F2-%dg_Hx651.oR@');
define('USERHASH', 'v@c.04!xc'); // DO not use -
if (1 || $_SERVER['REMOTE_ADDR'] == '139.91.252.65')
	define('ENABLE_LOGIN', true);
else
	define('ENABLE_LOGIN', false);

date_default_timezone_set("Europe/Berlin");

if (1) {
	$sm_host = "127.0.0.1";
	$sm_data = "skai";
	$sm_user = "skai";
	$sm_pass = "skai-3311";
} else {
	// Maxscale
	$sm_host = "46.4.18.190";
	$sm_data = "piwik";
	$sm_user = "dio";
	$sm_pass = "dio123";
}

$mysqli= new mysqli($sm_host, $sm_user, $sm_pass, $sm_data);
$mysqli->set_charset("utf8");
if (0) {
$res = $mysqli->query("show tables");
echo $mysqli->error;
while ($row = $res->fetch_row())
	print_r($row);

$res = $mysqli->query("SELECT * FROM durations_n limit 10");
echo $mysqli->error;
while ($row = $res->fetch_row())
	print_r($row);
exit;
}
function pass_encrypt($pass) {
        return crypt($pass, '$5$'. PSSALT .'$');
}
function insert_user($username, $pass) {
        global $mysqli;

        $mysqli->query("INSERT INTO users SET ts = UNIX_TIMESTAMP(), username ='". $username ."', pass = '". pass_encrypt($pass) ."' ON DUPLICATE KEY UPDATE pass = '". pass_encrypt($pass) ."'");
        $mysqli->error;
}
?>
