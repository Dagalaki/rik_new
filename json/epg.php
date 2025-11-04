<?php
$path = '/var/www/html/skai/video/';
include('/var/www/html/skai/admin/config.php');
$day = date('j')-date('w')+1;

$ts = mktime(0,0,0,date('n'),$day);

for ($i = 0; $i < 7; $i++) {
	$dt = date('Y-m-d', $ts);
	$ymd = date('Ymd', $ts);

	$mysqli->query("DELETE FROM program WHERE dt = ". $ymd);
	echo $mysqli->error;

	$url = 'https://www.skaitv.gr/hbbtv/program.json?date='.$dt;
	Echo 'Getting url '. $url ."\n";
	$epg = json_decode(file_get_contents($url));

	foreach ($epg->date as $p) {
		$start = strtotime($p->start);
		$end = strtotime($p->end);
		$descr = $p->short_descr;
		$descr = preg_replace("#[\\r,\\n]*#si", '', $descr);
		$descr = preg_replace("#&#si", '&amp;', $descr);

		if ($p->title == 'ΣΚΑΪ Καιρός') {
			echo "skip kairos\n";
			continue;
		}
		$q = "REPLACE INTO program SET title = '". mysqli_escape_string($mysqli, $p->title) ."', ";
		$q .= "rating = '". mysqli_escape_string($mysqli, $p->rating_img) ."', ";
		$q .= "img = '". mysqli_escape_string($mysqli, $p->img) ."', ";
		$q .= "yp = '". (int)@$p->has_yp ."', ";
		$q .= "short_descr = '". mysqli_escape_string($mysqli, $descr) ."', ";
		$q .= "start = ". $start .", end = ". $end .", dt = ". $ymd .", duration = ". ($end - $start);

		$mysqli->query($q);
		if ($mysqli->error) {
			echo $mysqli->error;
			exit;
		}

	}
	$ts += 86400;
}
