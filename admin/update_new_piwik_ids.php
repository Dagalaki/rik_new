<?php
// update new piwik ids
require("/var/www/html/stats-runas/config.php");
$dupmysqli = new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$tms = time()-86400 * 1;
define('START_DT', 20190621);

function unique($v) {
	global $found;
	return !in_array($v, $found);
}

function update($ts) {
	global $mysqli, $dupmysqli, $found;

	$t = strtotime(date('Y-m-d', $ts) .'00:00:00');
	$sts = $ts; $new = [];

	echo "----- dt ". date('d/m', $ts) ." -----\n";

	for ($i = 0; $i < 24;$i++) {
		$hour = date('H', $t);
		$t += 3600;
		$res = $mysqli->query("SELECT DISTINCT id FROM durations_n WHERE ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) .' '. $hour .":00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) .' '. $hour .":59:59')");
		echo 'hour '. $hour .' '. $res->num_rows ."\n";

		$ids = [];
		while ($row = $res->fetch_row()) {
			$ids[] = $row[0];
		}

		$found = [];
		$res = $mysqli->query("SELECT DISTINCT id FROM durations_n WHERE ts < ". $sts ." AND id IN ('". implode("','", $ids) ."')");
		echo $mysqli->error;
		while ($row = $res->fetch_row()) {
			$found[] = $row[0];
		}
		echo 'ids '. count($ids). "\n";

		for ($m = 6; $m < date('n', $ts); $m++) {
			//echo("SELECT DISTINCT id FROM durations_". ($m < 10 ? '0':'').$m .date('Y', $ts) ." WHERE id IN ('xx')\n");
			$res = $mysqli->query("SELECT DISTINCT id FROM durations_". ($m < 10 ? '0':'').$m .date('Y', $ts) ." WHERE id IN ('". implode("','", $ids) ."')");

			if (!$mysqli->error) {
				//echo 'for '. $m .' got '. $res->num_rows ."\n";
				while ($row = $res->fetch_row()) {
					$found[] = $row[0];
				}
			} else
				echo $mysqli->error."\n";
		}

		$new = array_merge($new, array_filter($ids, 'unique'));
		echo "new now ". count($new) ."\n";
	}
	$new = array_unique($new);
	$new = count($new);
	echo "new $new\n";
	if (1) {
		$mysqli->query("INSERT INTO total_new SET new=0, dt= ". date('Ymd', $sts) .", new_piwik = ". $new ." ON DUPLICATE KEY UPDATE new_piwik = ". $new);
		echo $mysqli->error;
		$dupmysqli->query("INSERT INTO total_new SET new=0, dt= ". date('Ymd', $sts) .", new_piwik = ". $new ." ON DUPLICATE KEY UPDATE new_piwik = ". $new);
	}
}
if (0) {
	for ($i = 10; $i < 32; $i++) {
		$tms = time()-86400 * $i;
		update($tms);
	}
} else
	update($tms);

