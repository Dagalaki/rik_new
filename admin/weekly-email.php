<?php
// get weekly stats for a customer (now reppa). 
// 1. show with more visits
// 2. show with most avg time per viewer
// 3. show with most site visits
$EMAIL = 'd.chatzidakis@anixa.gr';
//$EMAIL = 'hatdio@gmail.com';
//$EMAIL = 'hatdi@yahoo.com';
//$EMAIL = 'l.kalykakis@realtv-media.de';
$EMAIL = 'e.lapidakis@anixe.tv';
require("config.php");
function fm($n) {
	return number_format($n, 0, ',', '.');
}
function getDuration($secs) {
	$secs = floor($secs);
	$duration = '';
	$days = floor($secs / 86400);
	$secs -= $days * 86400;
	$hours = floor($secs / 3600);
	$secs -= $hours * 3600;
	$minutes = floor($secs / 60);
	$seconds = $secs - $minutes * 60;

	if($days > 0) {
		$duration .= $days . 'd';
	}
	if($hours > 0) {
		$duration .= ($duration ? ' ':'') . $hours . 'h';
	}
	if($minutes > 0) {
		$duration .= ($duration ? ' ':'') . $minutes . 'm';
	}
	if($seconds > 0) {
		$duration .= ' ' . $seconds . 's';
	}
	return $duration;
}

$pm = new DateTime();
$pm->sub(new DateInterval('P1W'));
$pmts = $pm->getTimestamp();
$ts = $pmts;
$customer = 'reppa'; $customerName = 'Reppa';
$mvisits = []; $mtime = []; $mtrack = [];

$h = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title></title> <style type="text/css"> #outlook a {padding:0;} body{-webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:5px; padding:0;} /* force default font sizes */';
$h .= '.ExternalClass {width:100%;} .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;} /* Hotmail */ table td {border-collapse: collapse;}';
$h .= 'table { border-collapse: collapse; padding: 5px; font-family: Verdana, Arial, Helvetica, sans-serif; width: 99vw; }';
$h .= 'table th { padding: .7em; text-align: left; background: #5a5a5a; color: #fff; } ';
$h .= 'table td { padding: .7em; border: solid 1px #ccc; min-width: 5em;}'; 
$h .= 'table td.b { font-weight: bold;}'; 
$h .= ' @media only screen and (min-width: 600px) { .maxW { width:600px !important; } } </style> </head>';
$h .= "<body style=\"margin: 0px; padding: 0px; -webkit-text-size-adjust:none; -ms-text-size-adjust:none;\" leftmargin=\"0\" topmargin=\"0\" marginwidth=\"0\" marginheight=\"0\" bgcolor=\"#FFFFFF\" font-family: Verdana, Arial, Helvetica, sans-serif;>";
$h .= '<h2>Auswertung Anixe HD</h2>';
$h .= '<table cellpadding="0" cellspacing="0">';
$h .= '<thead><tr><th>Anforderung</th>';
for ($i = 0; $i < 7; $i++) {
	$dt = date('Ymd', $ts);

	$res = $mysqli->query("SELECT start, cnt FROM program_run WHERE dt = ". $dt ." AND customer LIKE '%". $customer ."%' ORDER BY cnt DESC LIMIT 1");
	if ($row = $res->fetch_assoc()) {
		$mvisits[$dt] = $row;
	}

	$res = $mysqli->query("SELECT start, avg_duration FROM program_run WHERE dt = ". $dt ." AND customer LIKE '%". $customer ."%' ORDER BY avg_duration DESC LIMIT 1");
	if ($row = $res->fetch_assoc()) {
		$mtime[$dt] = $row;
	}

	$res = $mysqli->query("SELECT start, visited FROM program_run WHERE dt = ". $dt ." AND customer LIKE '%". $customer ."%' ORDER BY visited DESC LIMIT 1");
	if ($row = $res->fetch_assoc()) {
		$mtrack[$dt] = $row;
	}

	$ts += 86400;
}
$subject = $customerName .' Email report for week '. date('d', $pmts) .' - '. date('d M Y', $ts-86400);

$ts = $pmts;
for ($i = 0; $i < 7; $i++) {
	$h .= '<th>'. date('l', $ts) .'</th><th>Value</th>';
	$ts += 86400;
}
$h .= '</tr></thead><tbody>';
$h .= '<tr><td>Sendung mit den meisten Zuschauern je Tag</td>';

$ts = $pmts;
for ($i = 0; $i < 7; $i++) {
	$dt = date('Ymd', $ts);
	$row = $mvisits[$dt];

	$h .= '<td>'. date('H:i:s', $row['start']) .'</td><td class="b">'. fm($row['cnt']) .'</td>';
	$ts += 86400;
}
$h .= '</tr>';
$h .= '<tr><td>Sendung mit der längsten Verweildauer je Zuschauer je Tag</td>';

$ts = $pmts;
for ($i = 0; $i < 7; $i++) {
	$dt = date('Ymd', $ts);
	$row = $mtime[$dt];

	$h .= '<td>'. date('H:i:s', $row['start']) .'</td><td class="b">'. getDuration($row['avg_duration']) .'</td>';
	$ts += 86400;
}
$h .= '</tr>';
$h .= '<tr><td>Sendung mit den meisten Verbindungen zu reppa.de anhand der IP Adressen</td>';

$ts = $pmts;
for ($i = 0; $i < 7; $i++) {
	$dt = date('Ymd', $ts);
	$row = $mtrack[$dt];

	$h .= '<td>'. date('H:i:s', $row['start']) .'</td><td class="b">'. fm($row['visited']) .'</td>';
	$ts += 86400;
}
$h .= '</tr></tbody></table></body></html>';

//file_put_contents('d.html', $h);exit;

$headers = "MIME-Version: 1.0\r\n"
	."From: service@anixehd.tv\r\n"
	. "X-Mailer: PHP ". phpversion()."\r\n"
	."Content-Type: text/html; format=fixed; charset=\"utf-8\"\r\nContent-Transfer-Encoding: 8bit\r\n";

if (mail($EMAIL, $subject, $h, $headers, "-fservice@anixehd.tv"))
	echo "Mail sent succesfully\n";
else
	echo "Mail sent failed\n";

//echo $h;
//file_put_contents('d.html', $h);
