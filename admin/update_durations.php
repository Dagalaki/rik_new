<?php
// collect latest visits, process and update to a new schema that have
// duration for every visitor. We consider that the visitor is still inside TV if has another IP log between 10 - 20 seconds from last one.
//

require_once('/var/www/html/stats-nginx/config.php');
$test = 1;
$writetest = 0;
$testIp = '1350607440';//'3108790514';
$testId = '883c6000e0dc1f0e';
$maxTs = 0;
$dupmysqli= new mysqli('46.4.18.190', 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");

$mres = $mysqli->query("SELECT MAX(ts) FROM durations_n");
if ($mysqli->error)
	echo "Error: ". $mysqli->error ."\n";

if ($r = $mres->fetch_row())
	$maxTs = $r[0];

if (!$maxTs)
	$maxTs = 1560951660;
echo "Max ts: ". date('r', $maxTs). "\n";

$nowTs = time();

while ($maxTs < $nowTs) {
	$ips = array();
	$ipsSt = array();

	$ipsD = array();
	$ipsStD = array();

	echo "Max ts: ". date('r', $maxTs). "\n";

	$cond = " AND ts > ". $maxTs;
	if (time() - $maxTs > 1800)
		$cond = " AND ts BETWEEN $maxTs AND ". ($maxTs + 1800);
	//echo $cond;exit;

	$ures = $mysqli->query("SELECT id, ts, end FROM durations_n WHERE ts >= ". ($maxTs - 40) ." OR end >= ". ($maxTs -40));
	echo "Got ". $ures->num_rows ." rows for durations\n";

	while($row = $ures->fetch_assoc()) {
		$id = $row['id'];
		$ts = $row['ts'];
		$end = $row['end'];
		$ips[$id] = $end;
		$ipsSt[$id] = $ts;

		$ipsD[$id] = $end;
		$ipsStD[$id] = $ts;
	}

	if (0 && $test) {
		$res = $mysqli->query("SELECT ts, ip FROM netflow WHERE `l4_dst_port` != 80 AND `ip` NOT IN (3561031415) AND ip = ". $testIp ." AND ts > ". $ips[$testIp]. " GROUP BY ts, ip ORDER BY ip, id" );
	} else {
		//echo("SELECT pid, ts, info FROM hits WHERE `ip` NOT IN (3561031415) ". $cond ." GROUP BY ts, pid ORDER BY id". ($test ? " " : "") ."\n");
		$res = $mysqli->query("SELECT pid, ts, ip, info FROM hits WHERE `ip` NOT IN (3561031415) ". $cond);
		if ($mysqli->error)
			echo "Error: ". $mysqli->error ."\n";

		$res = $dupmysqli->query("SELECT pid, ts, ip, info FROM hits WHERE `ip` NOT IN (3561031415) ". $cond);
		if ($dupmysqli->error)
			echo "Error: ". $dupmysqli->error ."\n";
	}
	echo "Got ". $res->num_rows ." rows for netflow\n";

	$proces = $res->num_rows;
	echo('Updating from '. date('r', $maxTs) .', Processing '. $proces ."\n");

	//if ($ips[$testIp])
	//echo "Got ip last duration for ". $testIp. ": ". date('r', $ips[$testIp]). "\n";

	$updates = [];
	$i = 0; $u = 0; $j = 0; $lastTs = 0;
	while($row = $res->fetch_assoc()) {
		$ip = $row['ip'];
		$id = $row['pid'];
		$json = $row['info'];
		$ts = (int)$row['ts'];
		$ins = true;
		$debug = $id == $testId;
		$lastTs = 0;
		if ($debug)
			echo(date('r', $ts). " - ". $id. "\n");

		if (!isset($ips[$id])) {
			$ips[$id] = $ts;
			$ipsSt[$id] = $ts;
			if ($debug)
				echo "Setting new id ". $id. "\n";
		} else {
			$lastTs = $ips[$id];
			$ins = false;

			if ($ts < $lastTs) {
				echo($ts .' - '. $lastTs. " = ". ($ts - $lastTs) ." - ". $id ."\n");
				echo($id. " ".date('r', $ts). "\n");
				echo("ooooops\n");
				continue;
			}

			if ($ts > $lastTs && $ts - $lastTs < 10) {
				$ips[$id] = $ts;
				continue;
			}

			if ($debug)
				echo($ts .' - '. $lastTs. " = ". ($ts - $lastTs) ."\n");

			// As Gerd said there are cases with 15 seconds for an IP visit, because some TVs send the http request with some delay (4-6) seconds
			// so we check if the diff is less than 18 seconds, then we update else we insert as a new visit
			if ($ts > $lastTs && $ts - $lastTs > 18) {
				$ips[$id] = $ts;
				$ipsSt[$id] = $ts;
				$ins = true;
			}
		}
		$ips[$id] = $ts;
		$diff = $ts - $lastTs;

		if ($ins) {
			$i++;
			if ($test) {
				if ($id == $testIp)
					echo("INSERT INTO durations_n SET id = ". $id .", ts = ". $ts ."\n");
			} else {
				if ( $id == $testIp)
					echo("INSERT INTO durations_n SET id = ". $id .", ts = ". $ts ."\n");
				$mysqli->query("INSERT INTO durations_n SET id = '". $id ."', ip = ". $ip .", info = '". $mysqli->real_escape_string($json) ."', ts = ". $ts .", end = ". $ts);
				$dupmysqli->query("INSERT INTO durations_n SET id = '". $id ."', ip = ". $ip .", info = '". $dupmysqli->real_escape_string($json) ."', ts = ". $ts .", end = ". $ts);
			}
		} else {
			$u++;
			//$mysqli->query("UPDATE durations_n SET duration = duration + ". $diff .", end = end + ". $diff ." WHERE id = ". $id ." AND ts = ". $ipsSt[$id]);
			// 30 May. less queries:

			if ($diff > 0) {
				$k = md5($id.$ipsSt[$id]);

				if (isset($updates[$k])) {
					$updates[$k]['end'] = $ts;
					//$updates[$k]['diff'] += $diff;

				/*
				$s = $updates[$k];
				if ($s['id'] != $id || $s['ts'] != $ipsSt[$id]) {
					echo "Failed: k $k id $id ts ". $ipsSt[$id] ."\n";
					print_r($s);
					exit;
				}
				 */
				} else {
					$s = [];
					$s['ts'] = $ipsSt[$id];
					$s['id'] = $id;
					$s['end'] = $ts;
					$s['diff'] = $diff;
					$updates[$k] = $s;
				}
			}
		}
		$j++;
		//if ($j % 1000 == 0)
		//echo("Now: ". $j ." ". date('r', $ts). "\n");
	}
	$maxTs += 1800;
	break;
}
//print_r($updates);exit;
echo "Doing ". count($updates) ." updates...\n";
foreach ($updates as $s) {
	if ($test)
		echo("UPDATE durations_n SET end = ". $s['end'] ." WHERE id = ". $s['id'] ." AND ts = ". $s['ts'] ."\n");
	else {
		$mysqli->query("UPDATE durations_n SET end = ". $s['end'] ." WHERE id = '". $s['id'] ."' AND ts = ". $s['ts']);
		$dupmysqli->query("UPDATE durations_n SET end = ". $s['end'] ." WHERE id = '". $s['id'] ."' AND ts = ". $s['ts']);
	}
}
//$mysqli->query("UPDATE duration_last_update SET ts = ". $updated);
echo("done ". $i . " inserts ". $u ." updates\n");

function wb($str) {
	global $buf;
	$buf .= $str;
}

function wrtetest() {
	if ($writetest) {
		$buf = '';

		wb("Max ts: ". date('r', $maxTs). "\n");
		wb( "ips:\n");
		$buf .= var_export($ipsD, true);
		wb( "ipsSt:\n");
		$buf .= var_export($ipsStD, true);

		wb( "got rows:". $res->num_rows ."\n");
		while($row = $res->fetch_assoc()) {
			$id = $row['ip'];
			$ts = (int)$row['ts'];
			wb( $id. ", ". $ts ." (". date('r', $ts) ."\n");

			$ins = true;

			if (!isset($ipsD[$id])) {
				$ipsD[$id] = $ts;
				$ipsStD[$id] = $ts;
				wb( "setting ts\n");
			} else {
				$lastTs = $ipsD[$id];
				$ins = false;

				if ($ts < $lastTs) {
					wb("ooooops - continue\n");
					continue;
				}

				// As Gerd said there are cases with 15 seconds for an IP visit, because some TVs send the http request with some delay (4-6) seconds
				// so we check if the diff is less than 18 seconds, then we update else we insert as a new visit
				if ($ts > $lastTs && $ts - $lastTs > 18) {
					$ins = true;
				}
			}
			$ipsD[$id] = $ts;

			if ($ins) {
				wb ("insert...\n");
			} else {
				wb("update...\n");
			}
		}
		@file_put_contents("/var/www/html/netflow/test_logs/test_durations_". date('d-m_H:i') .'.txt', $buf);
		$res->data_seek(0);
	}


}
