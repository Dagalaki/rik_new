<?php
require_once('config.php');
//$mc = new Memcached(); 
//$mc->addServer("localhost", 11211); 

$pm = new DateTime();
$pm->sub(new DateInterval('P1M'));
$pmTs = $pm->getTimestamp();

$from = $_GET['from'];
$to = $_GET['to'];
$ctype = $_GET['ctype'];
$visitsTime = $_GET['visitsTime'];
$out = [];

$table = "durations_n"; $extra = ', smart_id';
if ($from < $pmTs) {
	if (date('Ymd', $from) < 20191014)
		$extra = '';
	$table = "durations_". date('mY', $from);
}

if (!$from || !$to) {
	$out['error'] = "No from or to found";
} else {
	// these are saved to memcached by parseProgram.php
	$dec = [];
	if ($mc) {
	$key = 'visits.v1.run.'.$from;

	$dec = json_decode($mc->get($key));
	}

	if (count($dec)) {
		foreach ($dec as $item) {
			$row['id'] = $item->id;
			$row['ts'] = $item->ts;
			$row['end'] = $item->end;
			$row['duration'] = $item->end - $item->ts;

			$out[] = $row;
		}
	} else {
		if (1 && $_GET['test']) {
			echo("(SELECT id, ts, end, ip $extra FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to .") UNION (SELECT id, ts, end, ip $extra FROM ". $table ." WHERE ts BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND end > ". $to .")");
			//echo("SELECT id, ts, end, ip FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to ." OR (ts BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND end > ". $to .")");
			exit;
		}
		$ips = []; $add = '';
		$res = $mysqli->query("SELECT customer FROM program_run WHERE start = ". $from);
		if ($row = $res->fetch_row()) {
			if ($row[0] && strlen($row[0])) {
				if (preg_match('#Reppa#si', $row[0]))
					$add = " AND page IN ('reppa.de','reppa.com')";
				else
					$add = " AND page = 'genius'";
			}

			if ($add) {
				$res = $mysqli->query("SELECT DISTINCT ip FROM visits WHERE ts BETWEEN ". $from ." AND ". ($to + $visitsTime) .$add);
				while ($row = $res->fetch_row()) {
					$ips[] = $row[0];
				}
			}
		}

		if ($_GET['test']) {
			echo("SELECT DISTINCT ip FROM visits WHERE ts BETWEEN ". $from ." AND ". ($to + $visitsTime) .$add);
			exit;
		}

		//$res = $mysqli->query("SELECT id, ts, end, ip FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to ." OR (ts BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND end > ". $to .")");
		$res = $mysqli->query("(SELECT id, ts, end, ip $extra FROM ". $table ." WHERE ts BETWEEN ". $from ." AND ". $to .") UNION (SELECT id, ts, end, ip $extra FROM ". $table ." WHERE ts BETWEEN ". ($from - 86400 * 7) ." AND ". $from ." AND end > ". $from .")");
		if ($mysqli->error) {
			echo "Error 1: ". $mysqli->error."\n";
		}

		while ($row = $res->fetch_assoc()) {
			$vstart = $row['ts'];
			$vend = $row['end'];
			$row['duration'] = $row['end'] - $row['ts'];
			$row['start'] = tm($vstart);
			$row['end'] = tm($vend);

			if (($vstart >= $from && $vstart <= $to) ||
				($vstart <= $from && $vend > $from)) {
				if (in_array($row['ip'], $ips))
					$row['tracked'] = 1;
				$out[] = $row;
			}
		}
	}
}
echo json_encode($out);
function tm($d) {
	return date('H:i:s', $d);
}
