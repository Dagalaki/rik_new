<?php
include('/var/www/html/skai/admin/config.php');

function sendmail($to, $subject, $msg) {
	$url = "http://look3.anixa.tv/stats-runas/tools/alert.php";
	$url .= "?to=". urlencode($to);
	$url .= "&subject=". urlencode($subject);
	$url .= "&msg=". urlencode($msg);
	$url .= "&pass=". urlencode("dio-43!");

	return file_get_contents($url);
}

$res = $mysqli->query("SELECT COUNT(*) FROM episodes WHERE show_id = 67362");
$allgood = 0;

if ($row = $res->fetch_row()) {
	if ($row[0] > 1)
		$allgood = 1;

}

if (!$allgood) {
	$email = 'hatdio@gmail.com';
	$name = 'Dio';
	$from = 'Dio';
	$subject = 'Skai Alert: no episodes found';
	$message = 'Skai Alert!!!. No episodes found';
	echo "Sending emails\n";
	echo sendmail($email, $subject, $message);

	$email = 'd.chatzidakis@realtv-media.de ';
	echo sendmail($email, $subject, $message);
}
