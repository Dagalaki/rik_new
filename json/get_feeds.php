<?php
include('/var/www/html/skai/admin/config.php');
$shows = json_decode(file_get_contents('https://www.skaitv.gr/hbbtv/shows.json'));
$keys = ['enimerosi','psuchagogia','seires','cinema','athlitika'];
$inactive = []; $dbShows = []; $foundShowIds = []; $titles = [];
define('BB', 67280);

$res = $mysqli->query("SELECT id, title FROM shows");
while ($row = $res->fetch_row())
	$dbShows[] = $row[0];

$res = $mysqli->query("SELECT id FROM inactive");
while ($row = $res->fetch_row())
	$inactive[] = $row[0];

foreach ($keys as $k=>$key) {
	foreach ($shows->shows->$key as $j=>$show) {
		$feed = $show->link;
		echo $show->title .' ---> '. $feed ."\n";
		$titles[$show->id] = $show->title;

		$o = json_decode(file_get_contents($feed));
		if (!in_array($show->id, $inactive) && !isset($o->episodes))
			continue;
		$eps = $o->episodes;
		$show = $o->show;

		if ((!$eps || !count($eps)) && $show->id != BB && !in_array($show->id, $inactive)) {
			continue;
		}

		echo "got show ". $o->show->title ."\n";
		echo " ----- found ". count($eps) ." episodes\n";
		$foundShowIds[] = $show->id;

		if (!in_array($show->id, $dbShows)) {
			$q = "REPLACE INTO shows SET ";
			$q .= "id = ". $show->id .", ";
			$q .= "is_movie = 0, ";
			$q .= "title = '". mysqli_escape_string($mysqli, $show->title) ."', ";
			$q .= "subtitle = '". mysqli_escape_string($mysqli, $show->subtitle) ."', ";
			$q .= "descr = '". mysqli_escape_string($mysqli, $show->descr) ."', ";
			$q .= "short_descr = '". mysqli_escape_string($mysqli, $show->short_descr) ."', ";
			$q .= "caption = '". (isset($show->caption) ? mysqli_escape_string($mysqli, $show->caption) : '') ."', ";
			$q .= "logo = '". mysqli_escape_string($mysqli, $show->logo) ."', ";
			$q .= "img = '". mysqli_escape_string($mysqli, $show->img) ."', ";
			$q .= "cat_id = ". $k .", ";
			$q .= "active = 0, ";
			$q .= "updated = 0, ";
			$q .= "link = '". $feed ."'";

			$mysqli->query($q);
		} else {
			$q = "UPDATE shows SET link = '". $feed ."', ";
			$q .= "title = '". mysqli_escape_string($mysqli, $show->title) ."', ";
			$q .= "subtitle = '". mysqli_escape_string($mysqli, $show->subtitle) ."', ";
			$q .= "descr = '". mysqli_escape_string($mysqli, $show->descr) ."', ";
			$q .= "short_descr = '". mysqli_escape_string($mysqli, $show->short_descr) ."', ";
			$q .= "caption = '". (isset($show->caption) ? mysqli_escape_string($mysqli, $show->caption) : '') ."'";
			$q .= " WHERE id = ". $show->id; // XXX we may update more info here

			$mysqli->query($q);
		}
		if ($mysqli->error) {
			echo $mysqli->error;
			exit;
		}
	}
}

if (count($foundShowIds) < 10)
	die("Failed to get shows from JSONs!\n");

if (count($foundShowIds) != count($dbShows)) {
	echo count($foundShowIds).' - '. count($dbShows)."\n";
	echo " ---- show ids not present in JSON\n";
	$diff = array_diff($dbShows, $foundShowIds);
	print_r($diff);
	$msg = '';

	foreach ($diff as $d) {
		if ($d == 67297)
			continue;
		echo("DELETE FROM shows WHERE id = $d\n");
		$msg .= '- Show: '. $titles[$d] .' ['. $d ."]\n";
		//$mysqli->query("DELETE FROM shows WHERE id = $d");
	}
	if (strlen($msg) > 1) {
		$email = 'hatdio@gmail.com';
		$subject = 'Skai Alert: shows inactive in JSON ('. count($diff) .")";
		echo $msg;
		//echo sendmail($email, $subject, $msg);
	}
}

function sendmail($to, $subject, $msg) {
	$url = "http://look3.anixa.tv/stats-runas/tools/alert.php";
	$url .= "?to=". urlencode($to);
	$url .= "&subject=". urlencode($subject);
	$url .= "&msg=". urlencode($msg);
	$url .= "&pass=". urlencode("dio-43!");

	return file_get_contents($url);
}
