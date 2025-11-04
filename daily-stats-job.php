<?php
// get daily videos and calc duration and save to db (vid_stats)
define('STATE_PLAYING', 1);
define('STATE_STOP', 0);
define('STATE_PAUSE', 2);
define('STATE_CONNECTING', 3);
define('STATE_BUFFERING', 4);
define('STATE_FINISHED', 5);
define('STATE_ERROR', 6);
$states = ['stop','play','pause','connect','buffer','finish','error'];
$servername = "127.0.0.1";
$username = "stats";
$password = "dklfgR.h542";
date_default_timezone_set("Europe/Athens");

$test=0;
$conn = new mysqli($servername, $username, $password, 'skai');
if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8");

$ts = time()-86400* 1;
//$ts = time();
$dt = date('Ymd', $ts);
//$dt = 20220823; $ts = strtotime($dt);
echo "--- date $dt ---\n";

if (!$test) {
	$conn->query("DELETE FROM vid_stats WHERE dt = ". $dt);
	$conn->query("DELETE FROM vid_stats_hour WHERE dt = ". $dt);
}

$cond = " ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $ts) ." 23:59:59')";
//$cond .= ' AND vid = 7935';

$q = "SELECT smid, vid, ts, state FROM vid_actions WHERE $cond ORDER BY ts, vid";
echo $q;
$res = $conn->query($q);
if ($conn->error) {
	echo 'SQL error: '. $conn->error ."\n";
	exit;
}
$lastid = 0;$lastvid = 0;$lastts = 0;$duration = 0;$tid = 0;
$started = false; $TESTSMID=9467791;
$smids = [];
while ($row = $res->fetch_assoc()) {
	$smid = $row['smid'];
	$vid = $row['vid'];
	$ts = $row['ts'];
	$state = $row['state'];
	if ($smid == $TESTSMID)
		echo "vid $vid smid $smid state ". $states[$state] ."\n";

	if (!isset($smids[$smid]))
		$smids[$smid] = [];
	$smids[$smid]['done'] = 0;

	if ($state == STATE_STOP || $state == STATE_FINISHED) {
		if (@$smids[$smid]['started'] && isset($smids[$smid]['lastts']) && $vid == $smids[$smid]['lastvid']) {
			if ($ts > $smids[$smid]['lastts'])
				$smids[$smid]['duration'] += ($ts - $smids[$smid]['lastts']);
			if ($smid == $TESTSMID) {
				print_r($row);
				print_r($smids[$smid]);
				echo "duration ". $smids[$smid]['duration'] ."\n";
				echo 'state stop/fin '.date('r', $ts) .' - '. date('r', $smids[$smid]['lastts']) ."\n";
			}
			//echo "smid $smid d2 $duration\n";
			$smids[$smid]['lastts'] = $ts;
			$smids[$smid]['started'] = false;
			//print_r($smids[$smid]);
			if ($smids[$smid]['duration'] > 0) {
				addVideo();

				initSmid($smid, $vid);
			}
		}
	} else if ($state == STATE_CONNECTING || $state == STATE_BUFFERING) {
		// case smid viewed another video but no state stop/finished exist
		if (isset($smids[$smid]) && isset($smids[$smid]['lastvid']) && $vid != $smids[$smid]['lastvid'] && isset($smids[$smid]['duration']) && $smids[$smid]['duration'] > 0)
			addVideo();

		initSmid($smid, $vid);
		$smids[$smid]['lastts'] = $ts;
		//echo "new video $vid smid $smid\n";
	} else if ($state == STATE_PLAYING) {
		if (@$smids[$smid]['started'] || isset($smids[$smid]['lastts'])) {
			if ($vid != $smids[$smid]['lastvid']) {
				if ($smids[$smid]['duration'] > 0)
					addVideo();

				initSmid($smid, $vid);
			}
			if ($smids[$smid]['lastts']) {
				if ($ts > $smids[$smid]['lastts'])
					$smids[$smid]['duration'] += ($ts - $smids[$smid]['lastts']);
			}
			if ($smid == $TESTSMID) {
				print_r($row);
				echo "duration ". $smids[$smid]['duration'] ."\n";
				echo 'state play '.date('r', $ts) .' - '. date('r', $smids[$smid]['lastts']) ."\n";
			}
			//echo "smid $smid d " .$smids[$smid]['duration'] ."\n";
		} else
			$smids[$smid]['duration'] = 0;
		$smids[$smid]['lastts'] = $ts;
		$smids[$smid]['started'] = true;
	} else if ($state == STATE_PAUSE || $state == STATE_STOP || $state == STATE_FINISHED) {
		//echo "vid $vid smid $smid state ". $states[$state] ."\n";
		if (@$smids[$smid]['started'] && !isset($smids[$smid]['lastts'])) {
			if ($ts > $smids[$smid]['lastts'])
				$smids[$smid]['duration'] += ($ts - $smids[$smid]['lastts']);
			if ($smid == $TESTSMID) {
				print_r($row);
				echo "duration ". $smids[$smid]['duration'] ."\n";
				echo 'state pause '.date('r', $ts) .date('r', $ts) .' - '. date('r', $smids[$smid]['lastts']) ."\n";
			}
			//echo "smid $smid d2 $duration\n";
			$smids[$smid]['lastts'] = $ts;
			$smids[$smid]['started'] = false;
		}
	}
	$smids[$smid]['lastvid'] = $vid;
}
if ($test) {
	echo "total smids ". count($smids) ."\n";;
}
$st=0;
foreach ($smids as $smid=>$v) {
	/*
	if (!isset($v['duration']) || !$v['duration']) {
		$v['duration'] = 10;
		$smids[$smid]['duration'] = 10;
	}*/
	if (isset($v['duration']) && $v['duration'] > 0 && !@$v['done'] && isset($v['lastvid']))
		addVideo();
	else if (!$v['done']) {
		//print_r($v);exit;
	}
}
echo "st smids ". $st ."\n";;
// add last one
function addVideo() {
	global $conn, $row, $smids, $test, $dt, $ts, $lastvid, $lastid, $smid, $vid;
	$lastvid = $vid;
	if (isset($smids[$smid]['lastvid']))
		$lastvid = $smids[$smid]['lastvid'];
	$duration = $smids[$smid]['duration'];
	$smids[$smid]['done'] = 1;

	//echo "add video $lastvid smid $smid duration $duration\n";
	if ($duration > 86400) {
		echo "add video $lastvid smid $smid duration $duration\n";
	       	echo "--- WARN --- duration: ". getDuration($duration) ."\n";
	}
	if ($test) return;
	$tid = 0; $eid = 0; $cid = 0; $tit = ''; $epi = '';
	$nres = $conn->query("SELECT title, episode FROM videos WHERE id = ". $lastvid);
	echo $conn->error;
	if ($row = $nres->fetch_assoc()) {
		$tid = $row['title'];
		$eid = (int)$row['episode'];
	}
	$nres = $conn->query("SELECT title, category FROM titles WHERE id = ". $tid);
	if ($row = $nres->fetch_assoc()) {
		$tit = mysqli_escape_string($conn, $row['title']);
		$cid = $row['category'];
	}
	if ($eid) {
		$nres = $conn->query("SELECT title FROM st_episodes WHERE id = ". $eid);
		if ($row = $nres->fetch_assoc())
			$epi = mysqli_escape_string($conn, $row['title']);
	}

	if ($duration < 0)
		$duration =0;
	$q = "INSERT INTO vid_stats SET smid = $smid, title = '". $tit ."', episode = '". $epi ."', vid = '$lastvid', dt = $dt, duration = $duration, tid = $tid, eid = $eid, cid = $cid, movie=0";
	if (!$test)
		$rs = $conn->query($q);
	//else echo "$q\n";

	if ($conn->error) {
		echo "$q\n";
		echo $conn->error;
		exit;
	}

	$hour = date('H', $ts);
	//echo date('r', $ts)."\n";
	$q = "INSERT INTO vid_stats_hour SET hour = $hour, dt = $dt, vid = $lastvid, cnt = 1 ON DUPLICATE KEY UPDATE cnt=cnt+1";
	//echo "$q\n";
	if (!$test)
		$rs = $conn->query($q);
	echo $conn->error;
}
function initSmid($smid, $vid) {
	global $smids;
	$smids[$smid]['lastvid'] = $vid;
	$smids[$smid]['lastts'] = 0;
	$smids[$smid]['done'] = 0;
	$smids[$smid]['duration'] = 0;
	$smids[$smid]['started'] = false;
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
		$duration .= ' ' . $hours . 'h';
	}
	if($minutes > 0) {
		$duration .= ' ' . $minutes . 'm';
	}
	if($seconds > 0) {
		$duration .= ' ' . $seconds . 's';
	}
	return $duration;
}
