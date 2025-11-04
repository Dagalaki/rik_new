<?php
// parse anixa HD visits by URL.
require("config.php");
$dupmysqli= new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");

$tms = time()-86400 * 1;
if (1) {
$dt = date('Y-m-d', $tms);
$url = 'https://database.smart-tv-data.de/agf/pixel/'. $dt .'.csv';;
//$url = $dt .'.csv';;
echo $url. "\n";

//$data = file_get_contents($url);
$fh = fopen($url, 'r'); $i  =0 ; $line = 0;

while (($s = fgets($fh, 4096)) !== false) {
	$a = explode(';', $s);
	if (count($a)) {
		$ts = strtotime($a[0]);
		$ip = preg_replace('/, .*/si', '', $a[1]);
		$page = $a[2];
		$agentId = $a[4];
		$referrer = trim($a[5]);

		if ($ts && $ip && $page && $agentId) {
			$mysqli->query("REPLACE INTO visits SET pstart = 0, ts = ". $ts .", ip = INET_ATON('". $ip ."'), page = '". $page ."', referrer = '". $mysqli->real_escape_string($referrer) ."', agent_id = ".  $agentId);
			if ($mysqli->error) {
				echo $mysqli->error. "\n";
				continue;
			}

			$dupmysqli->query("REPLACE INTO visits SET pstart = 0, ts = ". $ts .", ip = INET_ATON('". $ip ."'), page = '". $page ."', referrer = '". $dupmysqli->real_escape_string($referrer) ."', agent_id = ".  $agentId);
			if ($dupmysqli->error) {
				echo $dupmysqli->error. "\n";
				continue;
			}
			$i++;
		} else
			echo "Missing values in line ". $line ."\n";
	}
	$line++;
}
fclose($fh);
echo "total visits ". $i."\n";
}

$url = 'https://database.smart-tv-data.de/agf/pixel/agent.csv';
echo $url. "\n";

//$data = file_get_contents($url);
$fh = fopen($url, 'r'); $i  =0 ; $line = 0;

$i = 0;
while (($s = fgets($fh, 4096)) !== false) {
	//$a = explode(';', $s);
	if (!preg_match('#(\d*);(.*)$#si', $s, $a))
		die('reg failed for .'. $s);

	if (count($a)) {
		$id = (int)$a[1];
		$agent = trim($a[2]);

		if ($id && strlen($agent) > 10) {
			$mysqli->query("REPLACE INTO visits_agent SET id = ". $id .", agent = '". $mysqli->real_escape_string($agent) ."'");
			if ($mysqli->error)
				die($mysqli->error);

			$dupmysqli->query("REPLACE INTO visits_agent SET id = ". $id .", agent = '". $dupmysqli->real_escape_string($agent) ."'");
			if ($dupmysqli->error)
				echo($dupmysqli->error);
			$i++;
		}
	}
}
fclose($fh);
echo "total agents ". $i."\n";
$ts = $tms;

$c = " ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 23:59:59')";
$res = $mysqli->query("SELECT COUNT(ip), COUNT(DISTINCT(ip)), page FROM visits WHERE ". $c ." GROUP BY page" );

$ipRepa = 0; $ipdRepa = 0;
$ipGeni = 0; $ipdGeni = 0;
while ($row = $res->fetch_row()) {
	if ($row[2] == 'reppa.de' || $row[2] == 'reppa.com') {
		$ipRepa = $row[0];
		$ipdRepa = $row[1];
	} else if ($row[2] == 'genius') {
		$ipGeni = $row[0];
		$ipdGeni = $row[1];
	}
}
$dt = date('Ymd', $ts);
echo("REPLACE INTO visits_totals VALUES ($dt, $ipRepa, $ipdRepa, $ipGeni, $ipdGeni)\n");
$mysqli->query("REPLACE INTO visits_totals VALUES ($dt, $ipRepa, $ipdRepa, $ipGeni, $ipdGeni)");
