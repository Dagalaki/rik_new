<?php
// update new smart ids
require("/var/www/html/stats-runas/config.php");
$dupmysqli = new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$tms = time()-86400 * 1;

function unique($v) {
	global $found;
	return !in_array($v, $found);
}

function updatepro($ts) {
	global $mysqli, $dupmysqli, $found;

	$t = strtotime(date('Y-m-d', $ts) .'00:00:00'); $dt = date('Ymd', $ts);
	$sts = $ts; $new = []; $ranges = []; $newIds = [];


	$res = $mysqli->query("SELECT start, end FROM program_run WHERE dt = ". $dt);

	while ($row = $res->fetch_row()) {
		$sts = $row[0];
		$ets = $row[1];

		$ranges[$sts] = $ets;
		$newIds[$sts] = [];
		$new[$sts] = [];
	}
	echo "----- dt ". date('d/m', $ts) ." -----\n";

	for ($i = 0; $i < 24;$i++) {
		$hour = date('H', $t);
		$t += 3600;
		$res = $mysqli->query("SELECT DISTINCT smart_id FROM durations_n WHERE ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) .' '. $hour .":00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) .' '. $hour .":59:59')");
		echo 'hour '. $hour .' '. $res->num_rows ."\n";

		$ids = [];
		while ($row = $res->fetch_row()) {
			$ids[] = $row[0];
		}

		$found = [];
		$res = $mysqli->query("SELECT smart_id, MIN(ts), MIN(end) FROM durations_n WHERE ts < ". $sts ." AND smart_id IN (". implode(",", $ids) .") GROUP BY smart_id");
		echo $mysqli->error;
		while ($row = $res->fetch_row()) {
			$vstart = $row[0];
			$vend = $row[1];
			$smartId = $row[2];

			foreach ($ranges as $pstart=>$pend) {
				if ($vstart <= $pstart && $vend >= $pstart) {
					if ($smartId)
						$newIds[$pstart][] = $smartId;
				}
			}
		}

		$res = $mysqli->query("SELECT smart_id, MIN(ts), MIN(end) FROM durations_092019 WHERE ts < ". $sts ." AND smart_id IN (". implode(",", $ids) .") GROUP BY smart_id");
		echo $mysqli->error;
		while ($row = $res->fetch_row()) {
			$vstart = $row[0];
			$vend = $row[1];
			$smartId = $row[2];

			foreach ($ranges as $pstart=>$pend) {
				if ($vstart <= $pstart && $vend >= $pstart) {
					if ($smartId)
						$newIds[$pstart][] = $smartId;
				}
			}
		}

		foreach ($ranges as $pstart=>$pend) {
			$found = $newIds[$pstart];

			$new[$pstart] = array_merge($new[$pstart], array_filter($ids, 'unique'));
			echo "new for ". date('r', $pstart) .': '. count($new[$pstart]) ."\n";
		}
	}
	echo "new ". count($new) ."\n";
	if (0) {
		$mysqli->query("INSERT INTO total_new SET new_piwik=0, dt= ". date('Ymd', $sts) .", new = ". $new ." ON DUPLICATE KEY UPDATE new = ". $new);
		echo $mysqli->error;
		$dupmysqli->query("INSERT INTO total_new SET new_piwik=0, dt= ". date('Ymd', $sts) .", new = ". $new ." ON DUPLICATE KEY UPDATE new = ". $new);
	}
}

function update($ts) {
	global $mysqli, $dupmysqli, $found;

	$t = strtotime(date('Y-m-d', $ts) .'00:00:00');
	$sts = $ts; $new = [];

	echo "----- dt ". date('d/m', $ts) ." -----\n";

	for ($i = 0; $i < 24;$i++) {
		$hour = date('H', $t);
		$t += 3600;
		$res = $mysqli->query("SELECT DISTINCT smart_id FROM durations_n WHERE ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) .' '. $hour .":00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) .' '. $hour .":59:59')");
		echo 'hour '. $hour .' '. $res->num_rows ."\n";

		$ids = [];
		while ($row = $res->fetch_row()) {
			$ids[] = $row[0];
		}

		if (!count($ids))
			continue;
		$found = [];
		$res = $mysqli->query("SELECT DISTINCT smart_id FROM durations_n WHERE ts < ". $sts ." AND smart_id IN (". implode(",", $ids) .")");
		echo $mysqli->error;
		while ($row = $res->fetch_row()) {
			$found[] = $row[0];
		}

		$res = $mysqli->query("SELECT DISTINCT smart_id FROM durations_092019 WHERE ts < ". $sts ." AND smart_id IN (". implode(",", $ids) .")");
		echo $mysqli->error;
		while ($row = $res->fetch_row()) {
			$found[] = $row[0];
		}

		$new = array_merge($new, array_filter($ids, 'unique'));
		echo "new now ". count($new) ."\n";
	}
	$new = array_unique($new);
	$new = count($new);
	echo "new ". $new ."\n";
	if (1) {
		$mysqli->query("INSERT INTO total_new SET new_piwik=0, dt= ". date('Ymd', $sts) .", new = ". $new ." ON DUPLICATE KEY UPDATE new = ". $new);
		echo $mysqli->error;
		$dupmysqli->query("INSERT INTO total_new SET new_piwik=0, dt= ". date('Ymd', $sts) .", new = ". $new ." ON DUPLICATE KEY UPDATE new = ". $new);
	}
}
if (0) {
	for ($i = 1; $i < 5; $i++) {
		$tms = time()-86400 * $i;
		update($tms);
	}
} else
	update($tms);
