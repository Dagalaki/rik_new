<?php
// parse program by URL. Also saves visits to memcached (will be used by showRange.php which is called by groupdurations.php)
require("config.php");
$dupmysqli = new mysqli($replicationHost, 'dio', 'dio123', 'piwik');
$dupmysqli->set_charset("utf8");
$doRep = 0;
define('TIMEEL', 60);

$mc = new Memcached(); 
$mc->addServer("localhost", 11211); 
$tms = time()-86400 * 1;
$isUpdate = 0;
function saveProgram($tms, $json, $mysqli, $getDurations = true) {
	global $mc, $dupmysqli, $doRep, $isUpdate;

	$readOnly = 0;
	$cnts = []; $ranges = []; $cstart = []; $cend = []; $vgt1 = []; $genius = []; $geniusIPS = []; $compares = []; $reppa = []; $reppaIPS = []; $zero = [];
	$stTs = mktime(0, 0, 0, date('n', $tms), date('j', $tms), date('Y', $tms)); $totalDuration = []; $skipVgt1 = 0; $viewerIds = []; $hashes = [];

	$todayTsCond = " ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $tms) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $tms) ." 23:59:59')";

	$cond = $todayTsCond;
	$cond .= " OR (ts <= ". $stTs ." AND end > ". $stTs .")";
	//print_r($json);

	//$d = date_parse_from_format("d.m.Y", $json['Sendeprotokoll']['Datum']);
	//$ts = mktime( $d['hour'], $d['minute'], $d['second'], $d['month'], $d['day'], $d['year']);
	//$dt = date('Ymd', $ts);
	//echo("Date ". $dt. "\n");

	if (!$readOnly) {
		$mysqli->query("DELETE FROM program_run WHERE dt = ". date('Ymd', $tms));
		if ($doRep) $dupmysqli->query("DELETE FROM program_run WHERE dt = ". date('Ymd', $tms));
	}
	$lastStart = 0; $lastEnd = 0;

	foreach ($json as $item) {
		$sts = strtotime($item->begin);
		$ets = strtotime($item->end);
		$dt = date('Ymd', $sts);
		$duration = $ets - $sts;
		if (!isset($item->commercials))
			$item->commercials = '';

		$cnts[$sts] = 0;
		$cstart[$sts] = 0;
		$cend[$sts] = 0;
		$viewerIds[$sts] = [];
		$vgt1[$sts] = 0;
		$zero[$sts] = 0;
		$totalDuration[$sts] = 0;
		$ranges[$sts] = $ets;
		$hashes[$sts] = md5($item->article.' '.date('Hi', $sts));

		//echo "customer ". $item->article ." duration ". $duration ."\n";
		if (preg_match('#genius#si', $item->commercials) && $duration > 10)
			$genius[$sts] = $ets;

		if (preg_match('#reppa#si', $item->commercials) && $duration > 10)
			$reppa[$sts] = $ets;

		if (preg_match('#Window france24#si', $item->article))
			$skipVgt1 = $sts;

		//echo(date('r', $sts) .' -- '. date('r', $ets) ." duration ". $duration ."\n");

		if ($sts == 1557791119 || $sts > $ets || $ets - $sts > 6 * 3600) {
			echo "oops start is > from end, skipping ...\n";
			continue;
		}

		if ($lastStart && $lastEnd && $lastEnd != $sts) {
			echo "Fixing last end:";
			echo("UPDATE program_run SET end = ". $sts .", duration = ". ($sts-$lastStart) ." WHERE start = ". $lastStart ."\n");
			$mysqli->query("UPDATE program_run SET end = ". $sts .", duration = ". ($sts-$lastStart) ." WHERE start = ". $lastStart);
			if ($doRep) $dupmysqli->query("UPDATE program_run SET end = ". $sts .", duration = ". ($sts-$lastStart) ." WHERE start = ". $lastStart);
			$ranges[$lastStart] = $sts;
		}

		if ($duration > 60 * 5 - 1) { // create stats for comparisation
			$compares[$sts] = [];
			for ($i = 1; $i < (int)($duration / TIMEEL) + 2; $i++) {
				$compares[$sts][$i] = 0;
			}
		}

		//echo("INSERT INTO program_run SET dt = ". $dt .", start = ". $sts .", end = ". $ets. ", duration = ". $duration .", title = '". mysqli_escape_string($mysqli, $item->article). "', customer = '". mysqli_escape_string($mysqli, $item->commercials). "\n");

		if (!$readOnly) {
			if (!$mysqli->query("INSERT INTO program_run SET visited = 0, visits_total = 0, avg_duration=0, new=0, zero = 0, vgt1 = 0, cnt = 0, count_start = 0, count_end = 0, dt = ". $dt .", start = ". $sts .", end = ". $ets .", duration = ". $duration. ", title = '". mysqli_escape_string($mysqli, $item->article). "', customer = '". mysqli_escape_string($mysqli, $item->commercials). "' ON DUPLICATE KEY UPDATE duration = ". $duration .", customer = '". mysqli_escape_string($mysqli, $item->commercials). "'"))
				echo $mysqli->error. "\n";

			if ($doRep) {
				if (!$dupmysqli->query("INSERT INTO program_run SET visited = 0, avg_duration=0, new=0, zero = 0, vgt1 = 0, cnt = 0, count_start = 0, count_end = 0, dt = ". $dt .", start = ". $sts .", end = ". $ets .", duration = ". $duration. ", title = '". mysqli_escape_string($dupmysqli, $item->article). "', customer = '". mysqli_escape_string($dupmysqli, $item->commercials). "' ON DUPLICATE KEY UPDATE duration = ". $duration .", customer = '". mysqli_escape_string($dupmysqli, $item->commercials). "'"))
					echo $dupmysqli->error. "\n";
			}
		}
		$lastStart = $sts; $lastEnd = $ets;
	}

	if ($getDurations) {
		echo 'Getting durations for '. $cond ."\n";
		$pm = new DateTime();
		$pm->sub(new DateInterval('P1M'));
		$pmTs = $pm->getTimestamp();
		$table = "durations_n";
		if ($tms < $pmTs)
			$table = "durations_". date('mY', $tms);
		$res = $mysqli->query("SELECT id, ts, end, ip, smart_id FROM $table WHERE ". $cond);
		echo "Got ". $res->num_rows ." durations\n";
		echo $mysqli->error. "\n";
		$cache = [];
		$test = 0;

		while ($row = $res->fetch_assoc()) {
			$vstart = $row['ts'];
			$vend = $row['end'];
			$id = $row['id'];
			$ip = $row['ip'];
			$smartId = $row['smart_id'];

			foreach ($ranges as $pstart=>$pend) {

				if ($pend - $pstart > 120 && $vstart < $pend && $vend > $pstart && $vend - $vstart >= 60 && ($vend - $vstart) < 4 * 3600 && $skipVgt1 != $pstart) { // one minute or more
					// check also case that visit start is before program start and that end is not less than one minute - and same for end
					$go = true;
					$diffStart = 0; $diffEnd = 0;

					if ($vstart < $pstart)
						$diffStart = $vend - $pstart;

					if ($vend > $pend)
						$diffEnd = $vend - $pend;

					if ($diffStart && $diffStart < 60)
						$go = false;
					if ($diffEnd && $vstart > $pstart && $pend - $vstart < 60 && $diffEnd < 60)
						$go = false;

					if ($go) {
						$vgt1[$pstart]++;
					}
				}
				if ($vstart <= $pstart && $vend >= $pstart) {
					//if ($pstart == 1561328046) echo 'hit '. date('r', $vstart). ' id '. $id .' cnt '. $cstart[$pstart] ."\n";
					$cstart[$pstart]++;

					if (isset($compares[$pstart])) {
						$t = $pstart; $i = 1;

						while ($t <= $vend && $t <= $pend) {
							$compares[$pstart][$i]++;
							$t += TIMEEL;
							$i++;
						}
					}
				}

				if ($vstart <= $pstart && $vend >= $pend) {
					$cend[$pstart]++;
					if ($pend - $pstart > 5 * 60-1) {
						$viewerIds[$pstart][] = $id;
					}
				}


				if (($vstart >= $pstart && $vstart <= $pend) ||
					($vstart <= $pstart && $vend > $pstart)) {
					$cnts[$pstart]++;

					if (!isset($cache[$pstart]))
						$cache[$pstart] = [];

					if (count($cache[$pstart]) < 5002)
						$cache[$pstart][] = $row;

					if ($vstart == $vend)
						$zero[$pstart]++;
					else {
						$dur = $vend - $vstart;
						if ($dur > $pend - $pstart)
							$dur = $pend - $pstart;

						$totalDuration[$pstart] += $dur;
					}
				}
			}

			foreach ($genius as $pstart=>$pend) {
				if (($vstart >= $pstart && $vstart <= $pend) ||
					($vstart <= $pstart && $vend > $pstart)) {
					if (!isset($geniusIPS[$pstart]))
						$geniusIPS[$pstart] = [];
					$geniusIPS[$pstart][] = $ip;
				}
			}
			foreach ($reppa as $pstart=>$pend) {
				if (($vstart >= $pstart && $vstart <= $pend) ||
					($vstart <= $pstart && $vend > $pstart)) {
					if (!isset($reppaIPS[$pstart]))
						$reppaIPS[$pstart] = [];
					$reppaIPS[$pstart][] = $ip;
				}
			}
		}
		if (1) {
			foreach ($viewerIds as $ts=>$v) {
				if (!count($v))
					continue;
				$hash = $hashes[$ts];
				$q = 'REPLACE INTO viewers (ts, id, hash) VALUES ';

				foreach ($v as $id) {
					$q .= '('. $ts .', \''. $id .'\', \''. $hash .'\'),';
				}
				$q = substr($q, 0, strlen($q)-1);

				$mysqli->query($q);
				if ($mysqli->error) {
					Echo "Failed [$q]\n";
					echo $mysqli->error;
					exit;
				}
				$dupmysqli->query($q);
			}
		}
		if (count($compares)) {
			echo 'Saving '. count($compares). " compares..\n";
			foreach ($compares as $ts => $v) {
				$mysqli->query("REPLACE INTO compares SET ts = ". $ts .", v = '". implode(',', $v) ."'");
				if ($doRep) $dupmysqli->query("REPLACE INTO compares SET ts = ". $ts .", v = '". implode(',', $v) ."'");
				echo $mysqli->error;
			}
		}

		if (count($genius) || count($reppa)) {
			$mysqli->query("UPDATE visits SET pstart = 0 WHERE ". $todayTsCond);
			$mysqli->query("UPDATE program_run SET visited = 0, visits_total = 0 WHERE dt = ". date('Ymd', $tms));

			if ($doRep) $dupmysqli->query("UPDATE visits SET pstart = 0 WHERE ". $todayTsCond);
			if ($doRep) $dupmysqli->query("UPDATE program_run SET visited = 0 WHERE dt = ". date('Ymd', $tms));
		}

		if (count($genius)) {
			echo "Got ". count($genius) ." genius programs\n";
			if ($mysqli->error) {
				echo $mysqli->error;
				exit;
			}

			foreach ($genius as $pstart=>$pend) {
				if (isset($geniusIPS[$pstart]) && count($geniusIPS[$pstart])) {
					$ips = $geniusIPS[$pstart];

					$data = pack('I*', ...$geniusIPS[$pstart]);
					echo "genius ips length: ". strlen($data) ."\n";
					$mysqli->query("REPLACE INTO customer_ips SET ts = ". $pstart .", data = '". mysqli_escape_string($mysqli, $data) ."'");
					if ($doRep) $dupmysqli->query("REPLACE INTO customer_ips SET ts = ". $pstart .", data = '". mysqli_escape_string($dupmysqli, $data) ."'");

					// find number of visited
					$res = $mysqli->query("SELECT COUNT(DISTINCT ip) AS cnt, COUNT(ip) FROM visits WHERE ts BETWEEN ". $pstart ." AND ". ($pend + 6 * 3600) . " AND page='genius' AND ip IN (". implode(',', $ips) .")");
					echo $mysqli->error;

					if ($row = $res->fetch_row()) {
						$mysqli->query("UPDATE program_run SET visited = ". $row[0] .", visits_total = ". $row[1] ." WHERE start = ". $pstart);
						if ($doRep) $dupmysqli->query("UPDATE program_run SET visited = ". $row[0] ." WHERE start = ". $pstart);
					}

					if ($mysqli->error) {
						echo $mysqli->error;
						exit;
					}
					if ($dupmysqli->error) {
						echo $dupmysqli->error;
					}
				}
			}
		}
		if (count($reppa)) {
			echo "Got ". count($reppa) ." reppa programs\n";
			if ($mysqli->error) {
				echo $mysqli->error;
				exit;
			}

			foreach ($reppa as $pstart=>$pend) {
				if (isset($reppaIPS[$pstart]) && count($reppaIPS[$pstart])) {
					$ips = $reppaIPS[$pstart];

					$data = pack('I*', ...$reppaIPS[$pstart]);
					echo "reppa ips length: ". strlen($data) ."\n";
					$mysqli->query("REPLACE INTO customer_ips SET ts = ". $pstart .", data = '". mysqli_escape_string($mysqli, $data) ."', type=1");
					if ($doRep) $dupmysqli->query("REPLACE INTO customer_ips SET ts = ". $pstart .", data = '". mysqli_escape_string($dupmysqli, $data) ."', type=1");
					//$mysqli->query("UPDATE visits SET pstart = ". $pstart ." WHERE ts BETWEEN ". ($pstart - 6 * 3600) ." AND ". ($pend + 6 * 3600) . " AND page IN ('reppa.de','reppa.com') AND ip IN (". implode(',', $reppaIPS[$pstart]) .")");

					// find number of visited
					$res = $mysqli->query("SELECT COUNT(DISTINCT ip) AS cnt, COUNT(ip) FROM visits WHERE ts BETWEEN ". $pstart ." AND ". ($pend + 6 * 3600) . " AND page IN ('reppa.de','reppa.com') AND ip IN (". implode(',', $ips) .")");
					echo $mysqli->error;

					if ($row = $res->fetch_row()) {
						$mysqli->query("UPDATE program_run SET visited = ". $row[0] .", visits_total = ". $row[1] ." WHERE start = ". $pstart);
						if ($doRep) $dupmysqli->query("UPDATE program_run SET visited = ". $row[0] ." WHERE start = ". $pstart);
					}
				}
			}
		}
		if (0) {
			$res = $mysqli->query("SELECT COUNT(DISTINCT ip) AS cnt, pstart FROM visits WHERE ". $todayTsCond ." GROUP BY pstart");

			while ($row = $res->fetch_assoc()) {
				$mysqli->query("UPDATE program_run SET visited = ". $row['cnt'] ." WHERE start = ". $row['pstart']);
				$dupmysqli->query("UPDATE program_run SET visited = ". $row['cnt'] ." WHERE start = ". $row['pstart']);
			}
		}
		if (0) {
			$c=0;
			foreach ($cache as $ts=>$a) {
				if (count($cache[$ts]) < 5001) {
					$key = 'visits.v1.run.'.$ts;
					echo "found ". count($a) ." items... caching '". $key ."' val ". strlen(json_encode($a)) ."\n";
					$mc->set($key, json_encode($a), 0);
					$c++;
				}
			}
			echo "added in cache ". $c. "\n";
		}
		//print_r($cnts);exit;

		echo "saving counts ". count($cnts). "\n";
		foreach ($cnts as $k => $cnt) {
			//echo "UPDATE program_run SET cnt = ". $cnt ." WHERE start = ". $k. "\n";
			$mysqli->query("UPDATE program_run SET cnt = ". $cnt ." WHERE start = ". $k);
			if ($doRep) $dupmysqli->query("UPDATE program_run SET cnt = ". $cnt ." WHERE start = ". $k);
		}

		echo "saving start end counts ". count($cstart). "\n";
		foreach ($cstart as $ts => $cnt) {
			$avg = 0; $vgt5 = $cnts[$ts] - $zero[$ts];
			if ($vgt5) {
				$avg = $totalDuration[$ts] / $vgt5;
				//echo 'for '. $ts .': '. $totalDuration[$ts] .' / '. $vgt5 ." $avg\n";
			}
			$mysqli->query("UPDATE program_run SET count_start = ". $cnt .", count_end = ". $cend[$ts] .", zero = ". $zero[$ts] .", vgt1 = ". $vgt1[$ts] .", avg_duration = ". $avg ." WHERE start = ". $ts);
			echo $mysqli->error;
			if ($doRep) $dupmysqli->query("UPDATE program_run SET count_start = ". $cnt .", count_end = ". $cend[$ts] .", zero = ". $zero[$ts] .", vgt1 = ". $vgt1[$ts] .", avg_duration = ". $avg ." WHERE start = ". $ts);
			//echo date('r', $ts). " start ". $cnt ." end ". $cend[$ts]. "\n";
		}

		if (0) {
			$res = $mysqli->query("SELECT COUNT(DISTINCT id) AS cnt, DAY(FROM_UNIXTIME(ts)) AS d FROM durations_n WHERE ". $todayTsCond ." GROUP BY d");

			while ($row = $res->fetch_assoc()) {
				$ts = strtotime(date('m', $tms). '/'. $row['d'] .'/'. date('Y', $tms));
				$mysqli->query("REPLACE INTO counts SET ts = ". $ts .", total = ". $row['cnt']);
			}
		}
	}
}

if (0) {
	for ($i = 2;$i < 214; $i++) {
		$tms = time()-86400 * $i;
		$dt = date('Y-m-d', $tms);
		$url = 'https://www.anixehd.tv/ait/runas/expo.php?ch=anixehd&day='. $dt;
		$data = file_get_contents($url);

		$json = json_decode($data);
		saveProgram($tms, $json, $mysqli, true);
	}
	exit;
}

echo "Getting program for ". date('r', $tms). "\n";
$dt = date('Y-m-d', $tms);
$hour = date('h');
$url = 'https://www.anixehd.tv/ait/runas/expo.php?ch=anixehd&day='. $dt;
echo $url. "\n";
$data = file_get_contents($url);
echo('Got '. strlen($data). " bytes\n");

$json = json_decode($data);

saveProgram($tms, $json, $mysqli, true);
//saveProgram($json, $mysqli, $hour == 9);

if ($hour == 8) {
	$tms = time()-86400 * 2;
	$dt = date('Y-m-d', $tms);
	$url = 'https://www.anixehd.tv/ait/runas/expo.php?ch=anixehd&day='. $dt;
	echo $url. "\n";
	$data = file_get_contents($url);

	$json = json_decode($data);
	saveProgram($tms, $json, $mysqli, true);
}
?>
