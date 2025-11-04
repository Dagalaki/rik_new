<?php
function fm($n) {
	return number_format($n, 0, ',', '.');
}
function percent($x, $total) {
	if (!$total)
		return 0;
	$percent = ($x * 100) / $total;
	return number_format( $percent, 2 ); // change 2 to # of decimals
}
require_once('config.php');
function dt($ts) {
	return date('D d M', $ts);
}
function timer_diff($timeStart)
{
    return number_format(microtime(true) - $timeStart, 3). ' sec.';
}
// XXX sponsors 
$pages = ['program'=>'Skai Program', 'stats'=>'TV Show Comparison', 'feeds'=>'Feed / show manager', 'users'=>'Porpular shows', 'search'=>'Search shows'];
//$rights = ['skaifeeds' => ['feeds'], 'gerasimos' => ['feeds']];
$pg = 1; $now = microtime(true); $log = '';
$perPage = 50;
$lastPg =  0;
$asc = false;
$sort = "ts";
$cont = "";
$pgMode = 'program';
$showFeeds = 0;
$counts = [];
error_reporting(E_ERROR | E_WARNING | E_PARSE);
ini_set('display_errors', 1);
ini_set('memory_limit' , '256M');
$userLoggedName = '';
$visitsTime = 6 * 3600;
$msg ='';
if (isset($_GET['showFeeds']))
	$showFeeds = (int)$_GET['showFeeds'];

if (isset($_GET['action']) && $_GET['action'] == 'runfeed' && (int)$_GET['id']) {
	$mysqli->query("REPLACE INTO run_feed SET id = ". $_GET['id'] .", ts = UNIX_TIMESTAMP(), done = 0");
        header('location: ?pgMode=feeds');
	exit;
}

if (isset($_GET['visitsTime']))
	$visitsTime = $_GET['visitsTime'];

if (isset($_GET['action']) && $_GET['action'] == 'logout') {
        setcookie('stats-userid', '', time()-3600);
        header('location: .');
        exit;
}

if (isset($_COOKIE['stats-userid'])) {
        $val = $_COOKIE['stats-userid'];

        $res = base64_decode($val);
        $a = explode('-', $res);

        if (count($a) == 2 && $a[1] === USERHASH)
                $userLoggedName = $a[0];
}
if (isset($rights[$userLoggedName]))
	$pgMode = $rights[$userLoggedName][0];

if ($userLoggedName == 'skaifeeds' || $userLoggedName == 'gerasimos' || $userLoggedName == 'skai') {
	$pages = ['feeds'=>'Feed / show manager', 'matomo'=>'Audience measurement system', 'ad'=>'Ad Server'];
	$pgMode = 'feeds';
}
$pageTitle = $pages[$pgMode];

if (count($_GET) && $_GET['custom-dt']) {
	$customdt = date('Ymd', strtotime($_GET['custom-dt']));
}

if (count($_POST) && isset($_POST['savetitles'])) {
	$ids = $_POST['ids'];
	$titles = $_POST['titles'];
	foreach ($titles as $k=>$title) {
		$id = $ids[$k];
		$title = $mysqli->real_escape_string($title);

		$mysqli->query("UPDATE categories SET title = '". $title ."' WHERE id = ". $id);
		if ($mysqli->error)
			die("SQL error: ". $mysqli->error);
	}

}

if (count($_POST) && isset($_POST['savecats'])) {
	$shows = $_POST['shows'];
	$cats = $_POST['cats'];
	$ids = $_POST['ids'];

	foreach ($shows as $k=>$id) {
		$cid = $cats[$k];
		$idsx = $ids[$k];

		if ($cid != 100) {
			// check ids
			$a = explode(',', $idsx);
			foreach ($a as $n) {
				// check every id is a valid show id
				$res = $mysqli->query("SELECT id FROM shows WHERE id = ". $n ." AND cat_id = ". $cid ." AND active = 1");
				if ($mysqli->error)
					die("SQL error: ". $mysqli->error);
				if (!$res->num_rows)
					die("Error: id ". $n ." ($cid) not found or not active");
			}
		}

		$mysqli->query("UPDATE categories SET show_id = ". $id .", ids='". $idsx ."' WHERE id = ". $cid);
		if ($mysqli->error)
			die("SQL error: ". $mysqli->error);
	}
}
if (count($_POST) && isset($_POST['saveinactive'])) {
	$inactive = $_POST['inactive'];

	if ($inactive) {
		$mysqli->query("REPLACE INTO inactive SET id = ". $inactive);
		if ($mysqli->error)
			die("SQL error: ". $mysqli->error);
		$msg = 'add-inactive';
	}
}

if (count($_POST) && isset($_POST['username']) && isset($_POST['pass'])) {
        $res = $mysqli->query("SELECT ts FROM users WHERE username='". $mysqli->real_escape_string($_POST['username']) ."' AND pass = '". $mysqli->real_escape_string(pass_encrypt($_POST['pass'])) ."'");
        if ($res->num_rows) {
                $val = base64_encode($_POST['username']. '-'. USERHASH);
                setcookie('stats-userid', $val, time()+1*86400);
                header('location: .');
                exit;
        } else {
                echo('<p>Username not found or pass incorrect</p>');
        }
}

if ($_POST['sip'] && filter_var($_POST['sip'], FILTER_VALIDATE_IP)) {
	$id = '';
	$res = $mysqli->query("SELECT id FROM durations WHERE id = '". $mysqli->real_escape_string($_POST['sip']) ."'");

	if ($res->num_rows)
		$id = $_POST['sip'];
	else {
		$res = $mysqli->query("SELECT id FROM durations WHERE ip = INET_ATON('". $_POST['sip'] ."') ORDER BY ts DESC LIMIT 1");

		if ($row = $res->fetch_row())
			$id = $row[0];
	}

	if ($id) {
		header("Location: show-id.php?id=". $id);
		exit;
	}
}

$showOther = false;
if (isset($_GET['showOther']))
	$showOther = $_GET['showOther'];

$showAll = true;
if (isset($_GET['showAll']))
	$showAll = $_GET['showAll'];

if (isset($_GET['pgMode']))
	$pgMode = $_GET['pgMode'];

if (isset($_GET['sort']))
	$sort = $_GET['sort'];

if (isset($_GET['asc']))
	$asc = (bool)$_GET['asc'];

if (isset($_GET['pg']))
	$pg = (int)$_GET['pg'];

$order = "ORDER BY ". $sort .($asc ? "" : " DESC");
$sortDtUp = "?pg=". $pg ."&sort=ts&asc=0";
$sortDtDown = "?pg=". $pg ."&sort=ts&asc=1";

$sortDrUp = "?pg=". $pg ."&sort=duration&asc=0";
$sortDrDown = "?pg=". $pg ."&sort=duration&asc=1";

$sortViUp = "?pg=". $pg ."&sort=cnt&asc=0";
$sortViDown = "?pg=". $pg ."&sort=cnt&asc=1";
//echo $order;

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

if (!ENABLE_LOGIN || (ENABLE_LOGIN && $userLoggedName)) {
	if ($pgMode == 'program') {
		$programDts = []; $program = []; $totalMorethan10 = 0; $newPiwik = 0; $newSmids = 0;

		$res = $mysqli->query("SELECT DISTINCT dt FROM program");

		$pm = new DateTime();
		$pm->sub(new DateInterval('P1M'));
		$pmd = $pm->format('Ymd');

		while ($row = $res->fetch_row()) {
			$dt = $row[0];
			if ($dt >= $pmd)
				$programDts[] = $row[0];
		}

		$curDt = (int)$programDts[count($programDts)-1];

		if (in_array(date('Ymd'), $programDts))
			$curDt = date('Ymd');

		if (isset($_GET['curDt']))
			$curDt = $_GET['curDt'];

		if (isset($customdt))
			$curDt = $customdt;

		$add = '';
		if (!$showAll)
			$add = " AND duration > 5 * 60 - 1";

		if ($_POST['sip'] && !filter_var($_POST['sip'], FILTER_VALIDATE_IP)) {
			$add .= " AND title LIKE '%". mysqli_escape_string($mysqli, $_POST['sip']) ."%'";
			$showAll = false;
		}

		$res = $mysqli->query("SELECT * FROM program WHERE dt = ". $curDt . $add);
		echo $mysqli->error;

		while ($row = $res->fetch_assoc()) {
			$program[] = $row;
		}
		$log .= 'Time for program: '. timer_diff($now);

		$table = "durations"; $from = strtotime($curDt);
		if ($from < $pmTs) {
			$table = "durations_". date('mY', $from);
		}
		$log .= '<br>Time for visits: '. timer_diff($b1);
		$b1 = microtime(true);

		$res = $mysqli->query("SELECT COUNT(*) FROM ". $table ." WHERE ts != end AND end - ts >= 10 AND ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $from) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $from) ." 23:59:59')");
		echo $mysqli->error;
		if ($row = $res->fetch_row())
			$totalMorethan10 = $row[0];

		$res = $mysqli->query("SELECT new_piwik, new FROM total_new WHERE dt = ". $curDt);
		echo $mysqli->error;
		if ($row = $res->fetch_row()) {
			$newPiwik = $row[0];
			$newSmids = $row[1];
		}

		$log .= '<br>Time for total visits > 10 seconds: '. timer_diff($b1);
	} else if ($pgMode == 'feeds') {
		$feeds = []; $shows = []; $selShows = []; $all = []; $runFeeds = []; $epNum = []; $ctitles = [];

		$res = $mysqli->query("SELECT id FROM run_feed WHERE done = 0");
		while ($row = $res->fetch_row())
			$runFeeds[] = $row[0];

		$res = $mysqli->query("SELECT * FROM shows ORDER BY updated DESC");

		while ($row = $res->fetch_assoc()) {
			$feeds[] = $row;
		}

		$res = $mysqli->query("SELECT id, title, cat_id FROM shows WHERE active = 1 ORDER BY title");

		while ($row = $res->fetch_assoc()) {
			if (!isset($shows[$row['cat_id']]))
				$shows[$row['cat_id']] = [];
			$shows[$row['cat_id']][] = $row;
			$all[] = $row;
		}
		// for home show selection
		$shows[100] = $all;

		$res = $mysqli->query("SELECT show_id, count(*) FROM episodes GROUP BY show_id");

		while ($row = $res->fetch_row()) {
			$epNum[$row[0]] = $row[1];
		}

		$res = $mysqli->query("SELECT id, show_id, ids, title FROM categories");

		while ($row = $res->fetch_assoc()) {
			$selShows[$row['id']] = $row['show_id'];
			$selIds[$row['id']] = $row['ids'];
			$ctitles[$row['id']] = $row['title'];
		}
	} else if ($pgMode == 'sponsors') {
		$sponsors = []; $all = []; $wwwvisits = [];

		$res = $mysqli->query("SELECT * FROM program ORDER BY dt DESC");

		while ($row = $res->fetch_assoc()) {
			$dt = $row['dt'];
			if (!isset($all[$dt]))
				$all[$dt] = [];
			$all[$dt][] = $row;
		}

		$res = $mysqli->query("SELECT * FROM visits_totals ORDER BY dt DESC");

		while ($row = $res->fetch_assoc()) {
			$dt = $row['dt'];
			$wwwvisits[$dt] = $row;
		}

		foreach($all as $dt=>$v) {
			if (!isset($sponsors[$dt])) {
				$sponsors[$dt] = [];
				$sponsors[$dt]['reppa'] = [];
				$sponsors[$dt]['genius'] = [];
				$sponsors[$dt]['reppa']['ipstot'] = $wwwvisits[$dt]['ip_reppa'];
				$sponsors[$dt]['reppa']['ipsuni'] = $wwwvisits[$dt]['ip_d_reppa'];
				$sponsors[$dt]['genius']['ipstot'] = $wwwvisits[$dt]['ip_genius'];
				$sponsors[$dt]['genius']['ipsuni'] = $wwwvisits[$dt]['ip_d_genius'];
			}
			foreach ($v as $row) {
				if (preg_match('#reppa#si', $row['customer'])) {
					$sponsors[$dt]['reppa']['start'] += $row['count_start'];
					$sponsors[$dt]['reppa']['end'] += $row['count_end'];
					$sponsors[$dt]['reppa']['ips'] += $row['visited'];
					$sponsors[$dt]['reppa']['ipst'] += $row['visits_total'];
				}
				else if (preg_match('#genius#si', $row['customer'])) {
					$sponsors[$dt]['genius']['start'] += $row['count_start'];
					$sponsors[$dt]['genius']['end'] += $row['count_end'];
					$sponsors[$dt]['genius']['ips'] += $row['visited'];
					$sponsors[$dt]['genius']['ipst'] += $row['visits_total'];
				}
			}
		}
		//if ($_GET['test']) { print_r($sponsors); exit; }
	} else if ($pgMode == 'users') {
		$items = []; $hashes = []; $shows = []; $tss = [];

		$res = $mysqli->query("SELECT ts, id, hash, count(*) AS cnt FROM viewers GROUP BY id, hash ORDER BY cnt DESC LIMIT ". ($pg -1) * $perPage . ','. $perPage);

		while ($row = $res->fetch_assoc()) {
			$items[] = $row;
			//$hashes[] = $row['hash'];
			$tss[] = $row['ts'];
		}
		$total = $perPage * 100;
		$lastPg = ceil($total / $perPage);
		if ($lastPg > 100)
			$lastPg = 100;

		//$res = $mysqli->query("SELECT title, start, end, duration, customer, MD5(CONCAT(title, ' ', DATE_FORMAT(FROM_UNIXTIME(start), '%H%i'))) AS hash FROM program WHERE duration > 5 * 60 -1 AND MD5(CONCAT(title, ' ', DATE_FORMAT(FROM_UNIXTIME(start), '%H%i'))) IN ('". implode("','", $hashes) ."')");
		if (count($tss)) {
			$res = $mysqli->query("SELECT title, start, end, duration, customer FROM program WHERE duration > 5 * 60 -1 AND start IN (". implode(",", $tss) .")");
			echo $mysqli->error;
			while ($row = $res->fetch_assoc()) {
				$shows[$row['start']] = $row;
			}
		}

	} else if ($pgMode == 'stats' && count($_POST)) {
		$start = $_POST['stats-start'];
		$end = $_POST['stats-end'];
		$startTs = strtotime($start);
		$endTs = strtotime($end) + 86399;
		$programStart = $_POST['tvshow'];

		if ($startTs > $endTs || $endTs - $startTs > 60 * 86400)
			die('Invalid dates selected');
	} else if ($pgMode == 'search' && count($_POST) && $_POST['search-start']) {
		$items = [];
		$start = $_POST['search-start'];
		$end = $_POST['search-end'];
		$tvshow = $_POST['tvshow'];

		$sts = strtotime($_POST['search-start']);
		$ets = strtotime($_POST['search-end'] .' 23:59:59');
		//echo("SELECT * FROM program WHERE start BETWEEN ". $sts ." AND ". $ets ." AND title = '". mysqli_escape_string($mysqli, $_POST['tvshow']) ."'");exit;
		$res = $mysqli->query("SELECT * FROM program WHERE start BETWEEN ". $sts ." AND ". $ets ." AND title = '". mysqli_escape_string($mysqli, $_POST['tvshow']) ."'");
		while ($row = $res->fetch_assoc()) {
			$items[] = $row;
		}
	}

	if ($pgMode == 'stats') {
		if (!count($_POST) && isset($_GET['start']))
			$programStart = $_GET['start'];

		if (!$programStart)
			$programStart = time()-86400;

		if (!$startTs) {
			$startTs = time() - 5 * 86400;
			$endTs = time() - 86400;
		}

		$start = date('d-m-Y', $startTs);
		$end = date('d-m-Y', $endTs);
		//echo "start $start end $end $startTs $endTs";

		$res = $mysqli->query("SELECT title, customer, start, end FROM program WHERE dt = ". date('Ymd', $programStart) ." AND duration > 5 * 60 - 1");
		while ($row = $res->fetch_row()) {
			$programCompare[$row[2]] = [];
			$programCompare[$row[2]]['title'] = $row[0]  .' '. $row[1];
			$programCompare[$row[2]]['end'] = $row[3];

			if ($row[2] == $programStart)  {
				$pageTitle = "Viewers for '". $row[0] .' '. $row[1] ."' ". dt($startTs) .' - '. dt($endTs);
			}
		}

		if ($_GET['test']) echo("SELECT ts, v FROM compares WHERE ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $startTs) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $endTs) ." 23:59:59') AND HOUR(TIME(FROM_UNIXTIME(ts))) = HOUR('". date('H:i:s', $programStart) ."') AND MINUTE(TIME(FROM_UNIXTIME(ts))) BETWEEN MINUTE('". date('H:i:s', $programStart) ."') - 4 AND MINUTE('". date('H:i:s', $programStart) ."') + 4");
		$res = $mysqli->query("SELECT ts, v FROM compares WHERE ts BETWEEN UNIX_TIMESTAMP('". date('Y-m-d', $startTs) ." 00:00:00') AND UNIX_TIMESTAMP('". date('Y-m-d', $endTs) ." 23:59:59') AND HOUR(TIME(FROM_UNIXTIME(ts))) = HOUR('". date('H:i:s', $programStart) ."') AND MINUTE(TIME(FROM_UNIXTIME(ts))) BETWEEN MINUTE('". date('H:i:s', $programStart) ."') - 4 AND MINUTE('". date('H:i:s', $programStart) ."') + 4");
		$compares = [];
		while ($row = $res->fetch_assoc()) {
			$row['a'] = explode(',', $row['v']);
			$row['n'] = count($row['a']);
			$compares[] = $row;
		}
		//usort($compares, 'sortbyn');
		if ($_GET['test']) { print_r($compares);exit; }
	}
}
function sortbyn($a, $b) {
	if ($a['n'] == $b['n']) {
		return 0;
	}
	return ($a['n'] > $b['n']) ? -1 : 1;
}
?>
<!DOCTYPE html>
<!--[if lt IE 8 ]><html lang="en" class="no-js ie ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="no-js ie"><![endif]-->
<!--[if (gt IE 8)|!(IE)]><!-->
<html class=" js hashchange backgroundsize boxshadow cssgradients" firetv-fullscreen="false" lang="en"><!--<![endif]--><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>Skai HbbTV Dashboard</title>
	<meta name="description" content="">
	<meta name="author" content="">
	
	<!-- Global stylesheets -->
	<link href="css/reset.css" rel="stylesheet" type="text/css">
	<link href="css/common.css?v=1.0.2" rel="stylesheet" type="text/css">
	<link href="css/form.css?v1.1" rel="stylesheet" type="text/css">
	<link href="css/standard.css?v4" rel="stylesheet" type="text/css">
	
	<!-- Comment/uncomment one of these files to toggle between fixed and fluid layout -->
	<!--<link href="css/960.gs.css" rel="stylesheet" type="text/css">-->
	<link href="css/960.css" rel="stylesheet" type="text/css">
	
	<!-- Custom styles -->
	<link href="css/simple-lists.css" rel="stylesheet" type="text/css">
	<link href="css/block-lists.css" rel="stylesheet" type="text/css">
	<link href="css/planning.css" rel="stylesheet" type="text/css">
	<link href="css/table.css" rel="stylesheet" type="text/css">
	<link href="css/calendars.css" rel="stylesheet" type="text/css">
	<link href="css/wizard.css" rel="stylesheet" type="text/css">
	<link href="css/gallery.css" rel="stylesheet" type="text/css">
	<link href="css/selectlistactions.css" rel="stylesheet" type="text/css">
	<!-- Favicon -->
	<link rel="shortcut icon" type="image/x-icon" href="https://www.media-theia.de/images/favicon/favicon.ico">
	<link rel="icon" type="image/png" href="https://www.media-theia.de/images/favicon/favicon-large.png">
	
	<!-- Modernizr for support detection, all javascript libs are moved right above </body> for better performance -->
	<script src="js/modernizr.js"></script>
	<script src="js/amcharts4/core.js"></script>
	<script src="js/amcharts4/charts.js"></script>
	<script src="js/amcharts4/themes/animated.js"></script>
	<script src="js/libs/jquery-1.11.3.min.js"></script>
	<script src="js/jquery-ui.min.js"></script>
	<script src="js/jquery.selectlistactions"></script>
<style>
	.table tbody tr.sub td {
		background: #f2f2f2;
	}
	#latest-visits {
		width: 50%;
	}

	table.latest-cnts {
		float: right;
		width: 50%;
	}
	table.latest-cnts td {
		width: 33%;
	}
	table.latest-cnts th,
	table.latest-cnts td {
		text-align: left;
		padding: 0 2px;
		cursor: pointer;
	}
	table.latest-cnts th small {
		font-size: 14px !important;
		vertical-align: middle;
	}
	button.loading,
	a.button.loading {
		background-image: url(images/info-loader.gif);
    		color: #1e5774;
	}
#visits_result {
	text-align: left;
}
.custom-dts {
	display: inline-block;
	width: 7%;
	vertical-align: top;
}
</style>
<script>
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var sortTmAsc = false, lastCnts = {}, cntChart = null, pgMode = '<?php echo $pgMode?>';
function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function showIframe() {
	var el = $('#inc-iframe');
	var ta = $('#stats-table');
	var hidden = el.css('display') == 'none';

	if (hidden) {
		ta.css({
			'width': '82%',
			'float': 'left',
		});
		el.css('height', ta.height());
		el.show();
	} else {
		ta.css({
			'width': '100%',
			'float': 'none',
		});
		el.hide();
	}
}

function getDuration(secs) {
	var duration = '';
	var days = Math.floor(secs / 86400);

	secs -= days * 86400;
	var hours = Math.floor(secs / 3600);

	secs -= hours * 3600;
	var minutes = Math.floor(secs / 60);
	var seconds = secs - minutes * 60;

	if(days > 0) {
		duration += days + 'd';
	}
	if(hours > 0) {
		duration += ' ' + hours + 'h';
	}
	if(minutes > 0) {
		duration += ' ' + minutes + 'm';
	}
	if(seconds > 0) {
		duration += ' ' + seconds + 's';
	}
	return duration;
}

function toggleFeed(t, id, k) {
	var el = document.getElementById('data-feed-'+ k);
	var s = 'inactive', reg = /^inactive/g;
	if (reg.test(el.innerText))
		s = 'active';
	if (confirm('Are you sure want to set show \'' + t +'\' '+ s +'?')) {
		const http = new XMLHttpRequest();
		const url = 'toggleFeed.php?id='+ id +'&s='+ el.innerText;

		http.open("GET", url);
		http.send();
		http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if (http.responseText == '1')
					el.innerHTML = '<a href="javascript:void(0)" onclick="toggleFeed(\''+ t +'\', '+ id +', '+ k +')">'+ s +'</a>';
			}
		}
	}
}
function showTm(from, to, ctype, visitsTime, sortAsc = false, ret = true) {
	var tr = document.getElementById('data-'+ from +'-0');
	if (tr) {
		for (var i = 0; i < 8000; i++) {
			var tr = document.getElementById('data-'+ from +'-'+ i);
			if (tr)
				tr.remove();
			else
				break;
		}
		if (ret)
			return;
	}
	const http = new XMLHttpRequest();
	const url = 'showRange.php?from='+ from +'&to='+ to +'&ctype='+ ctype +'&visitsTime='+ visitsTime;

	$('#a-'+ from).addClass('loading');

	http.open("GET", url);
	http.send();
	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var res = JSON.parse(http.responseText);
			$('#a-'+ from).removeClass('loading');

			if (!res) {
				alert('json failed');
				return;
			} else if (res.error) {
				alert(res.error);
				return;
			} else {
				res.sort(function(a, b) {
					if (sortAsc)
						return a['duration'] - b['duration'];
					else
						return b['duration'] - a['duration'];
				});
				var el = document.getElementById('ts-'+ from);
				var cnt = res.length > 8000 ? 8000 : res.length, addSort = true;

				if (1) {
					for (var i = 0;i < cnt; i++) {
						var o = res[i];
						var node = document.createElement("tr"); 
						var endDt = o.end, a ='',
						startDt = o.start;

						if (addSort) {
							a = '<a onclick="showTm('+ from +', '+ to +', ' + ctype +', '+ visitsTime +', '+ (sortAsc ? 'false':'true') +', false)" href="javascript:void(0)">sort '+ (sortAsc ? "desc":"asc") +'</a>';
							addSort = false;
						}

						node.innerHTML = '<td>'+ (i+1) + '</td><td'+ (o.tracked ? ' style="background: #bbffbb;"':'') +'><a target="show-id" href="show-id.php?id='+ o.id +'">' +(parseInt(o.smart_id) > 0 ? o.smart_id : o.ip)+ '</a></td><td>'+ startDt +'</td><td>'+ endDt +'</td><td>'+ (o.duration > 0 ? getDuration(o.duration) : '4s') +'</td><td>'+ a +'</td><td></td><td></td>';
						node.id = 'data-'+ from +'-'+ i;
						insertAfter(node, el);
						el = node;
					}
				} else {
					var ptitle = $(el).find('td').each(function(j, e) {
						if (j == 1)
							ptitle = e.innerHTML;
					});
					var s = '<table><thead><tr><th scope="blavk-cell"></th><th scope="col">ID</th><th scope="col">Start</th><th scope="col">End</a></th><th scope="col">Duration</th></tr></thead><tbody>';
					for (var i = 0;i < cnt; i++) {
						var o = res[i];
						var tempDt = new Date(o.ts * 1000);
						var d = toUTC(tempDt);
						var endDt = '', a = '';

						if (parseInt(o.duration)) {
							var n = (parseInt(o.ts) + parseInt(o.duration)) * 1000;
							var tmpDt = new Date(n);
							var t = toUTC(tmpDt);

							endDt = tm(t);
						}

						s += '<tr><th sceop="row">'+ (i+1) +'</th><td><a target="show-id" href="show-id.php?id='+ o.id +'">' +o.ip+ '</a></td><td>'+ tm(d) +'</td><td>'+ endDt +'</td><td>'+ (o.duration > 0 ? getDuration(o.duration) : '') +'</td></tr>';
					}
					s += '</tbody></table>';

					$.modal({
						content: s,
						title: ptitle + ' ' +' '+ res.length +' visits',
						//maxWidth: 500,
						buttons: {
							'Open new modal': function(win) { openModal(); },
							'Close': function(win) { win.closeModal(); }
						}
					});
				}
			}
		}
	}
	return false;
}

function openUploader(t, id, k) {
	var s = '<div id="form-cont" style="height: 330px;"><form id="upl-form" class="form" action="upload-show-icon.php" method="post" enctype="multipart/form-data"> <input type="file" name="img" id="img"> <button type="submit">Upload Image</button>';
	s += '<input type="hidden" name="id" value="'+ id +'">';
        s += '</form></div>';
	$.modal({
	content: s,
		title: 'Image upload for "'+ t +'"',
		width: $(window).width() - 800,
		buttons: {
			'Upload Image': function(win) {
				$('#upl-form').submit();
				win.closeModal();
			},
			'Close': function(win) { win.closeModal(); }
		}
	});
}
function openUploaderBg(t, id, k) {
	var s = '<div id="form-cont" style="height: 330px;"><form id="upl-form" class="form" action="upload-show-bg.php" method="post" enctype="multipart/form-data"> <input type="file" name="img" id="img"> <button type="submit">Upload Image</button>';
	s += '<input type="hidden" name="id" value="'+ id +'">';
        s += '</form></div>';
	$.modal({
	content: s,
		title: 'Image upload for "'+ t +'"',
		width: $(window).width() - 800,
		buttons: {
			'Upload Image': function(win) {
				$('#upl-form').submit();
				win.closeModal();
			},
			'Close': function(win) { win.closeModal(); }
		}
	});
}

function showGraph() {
	var cols = [], visits = [], i = 0, w = $(window).width() - 200;

	$.modal({
		content: '<div id="chart_div" style="height: 330px;"></div>',
		title: 'Program visits',
		width: w,
		buttons: {
			'Close': function(win) { win.closeModal(); }
		}
	});

	$($('.table')[1]).find('tbody tr').each(function(i, el) {
		$(el).find('td').each(function(j, td) {
			if (j == 0) {
				cols.push($(td).text());
			} else if (j == 4) {
				visits.push(parseInt($(td).text().replace(' visits', '')));
			}
		});
	});

	visits.unshift('Visits');

	// Create our data table.
	var data = new google.visualization.DataTable();
	var raw_data = [visits];
	
	data.addColumn('string', 'Time');
	for (var i = 0; i < raw_data.length; ++i) {
		data.addColumn('number', raw_data[i][0]);	
	}
	
	data.addRows(cols.length);
	
	for (var j = 0; j < cols.length; ++j) {	
		data.setValue(j, 0, cols[j]);	
	}

	for (var i = 0; i < raw_data.length; ++i) {
		for (var j = 1; j < raw_data[i].length; ++j) {
			data.setValue(j-1, i+1, raw_data[i][j]);	
		}
	}
	
	// Create and draw the visualization.
	googleChart = new google.visualization.ChartWrapper();

	googleChart.setContainerId('chart_div');
	googleChart.setChartType('LineChart');
	//googleChart.setChartType('ColumnChart');
	googleChart.setDataTable(data);
	googleChart.setOptions({
		title: 'Program Visits',
		width: w-50,
		height: 330,
		legend: 'right',
		yAxis: {title: '(thousands)'}
	});
	googleChart.draw();
	
	// Message
	notify('Chart updated');
}

function toUTC(date) {
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours()+2, date.getUTCMinutes(), date.getUTCSeconds()); 
}

function showId(id, ts) {
	var tr = document.getElementById('data-'+ id +'-0');
	if (tr) {
		for (var i = 0; i < 1000; i++) {
			var tr = document.getElementById('data-'+ id +'-'+ i);
			if (tr)
				tr.remove();
			else
				break;
		}
		return;
	}
	const http = new XMLHttpRequest();
	const url = 'showId.php?id='+ id +'&ts='+ ts;

	http.open("GET", url);
	http.send();
	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var res = JSON.parse(http.responseText);
			console.log(res);

			if (!res) {
				alert('json failed');
				return;
			} else if (res.error) {
				alert(res.error);
				return;
			} else {
				var el = document.getElementById('id-'+ id);

				for (var i = 0;i < res.length; i++) {
					var o = res[i];
					var node = document.createElement("tr"); 
					var d = new Date(o.ts * 1000);
					var dt = d.getDate() + ' '+ months[d.getMonth()] +' '+ d.getHours() +':'+ d.getMinutes() +':'+ d.getSeconds();

					node.innerHTML = '<td></td><td></td><td></td><td>'+ dt +'</td><td>'+ (o.duration > 0 ? getDuration(o.duration) : '0') +'</td><td></td>';
					node.id = 'data-'+ id +'-'+ i;
					node.className = 'sub';
					insertAfter(node, el);
					el = node;
				}
			}
		}
	}
	return false;
}

function load() {
	if (pgMode == 'rnf')
		return;
	var timer = setInterval(relo, 5000);
	relo();
}
function tm(d) {
	return (d.getHours() < 10 ? '0':'') + d.getHours() +':'+ (d.getMinutes() < 10 ? '0':'') + d.getMinutes() +':'+ (d.getSeconds() < 10 ? '0':'')+ d.getSeconds();
}
function redrawCntsGraph() {
	if (cntChart == null)
		return;
	// Create our data table.
	var dt = new Date(lastCnts.ts * 1000);
	var dt2 = new Date(lastCnts.ts2 * 1000);
	var dt3 = new Date(lastCnts.ts3 * 1000);
	var data = new google.visualization.DataTable();
	var raw_data = [['Visits total', lastCnts.cnt, lastCnts.cnt2, lastCnts.cnt3],
			['Visits: same IDs', 0, lastCnts.b_cnt, lastCnts.c_cnt],
			['Visits: IDs left', 0, lastCnts.cnt - lastCnts.b_cnt, lastCnts.cnt - lastCnts.c_cnt]];
	
	var cols = [tm(dt3), tm(dt2), tm(dt)];
	
	data.addColumn('string', 'Time');
	for (var i = 0; i < raw_data.length; ++i)
	{
		data.addColumn('number', raw_data[i][0]);	
	}
	
	data.addRows(cols.length);
	
	for (var j = 0; j < cols.length; ++j)
	{	
		data.setValue(j, 0, cols[j]);	
	}
	for (var i = 0; i < raw_data.length; ++i)
	{
		for (var j = 1; j < raw_data[i].length; ++j)
		{
			data.setValue(j-1, i+1, raw_data[i][j]);	
		}
	}
	cntChart.setDataTable(data);
	cntChart.draw();
}
function openCntsGraph() {
	var i = 0, w = $(window).width();
	console.log(lastCnts);
	//return;
	$.modal({
		content: '<div id="cnt_chart" style="height: 330px;"></div>',
		title: 'Latest counts',
		width: w - 700,
		buttons: {
			'Close': function(win) {
				win.closeModal();
				cntChart = null;
			}
		}
	});

	// Create our data table.
	var dt = new Date(lastCnts.ts * 1000);
	var dt2 = new Date(lastCnts.ts2 * 1000);
	var dt3 = new Date(lastCnts.ts3 * 1000);
	var data = new google.visualization.DataTable();
	var raw_data = [['Visits total', lastCnts.cnt, lastCnts.cnt2, lastCnts.cnt3],
			['Visits: same IPs', 0, lastCnts.b_cnt, lastCnts.c_cnt],
			['Visits: IPs left', 0, lastCnts.cnt - lastCnts.b_cnt, lastCnts.cnt - lastCnts.c_cnt]];
	
	var cols = [tm(dt3), tm(dt2), tm(dt)];
	
	data.addColumn('string', 'Time');
	for (var i = 0; i < raw_data.length; ++i)
	{
		data.addColumn('number', raw_data[i][0]);	
	}
	
	data.addRows(cols.length);
	
	for (var j = 0; j < cols.length; ++j)
	{	
		data.setValue(j, 0, cols[j]);	
	}
	for (var i = 0; i < raw_data.length; ++i)
	{
		for (var j = 1; j < raw_data[i].length; ++j)
		{
			data.setValue(j-1, i+1, raw_data[i][j]);	
		}
	}

	// Create and draw the visualization.
	cntChart = new google.visualization.ChartWrapper();

	cntChart.setContainerId('cnt_chart');
	cntChart.setChartType('ColumnChart');
	cntChart.setDataTable(data);
	cntChart.setOptions({
		title: 'Latest Visits',
		width: w-880,
		height: 330,
		legend: 'right',
		yAxis: {title: '(thousands)'},
		colors: ['#4374e0', 'green', '#e2431e']
	});
	cntChart.draw();
}
function relo() {
	var el = document.getElementById('latest-visits');
	if (!el)
		return;
	const http = new XMLHttpRequest();
	const url = 'latest-cnts.php';

	http.open("GET", url);
	http.send();
	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var res = JSON.parse(http.responseText);

			if (!res) {
				alert('json failed');
				return;
			} else if (res.error) {
				alert(res.error);
				return;
			} else {
				var dt = new Date(res['ts'] * 1000);
				var dt2 = new Date(res['ts2'] * 1000);
				var dt3 = new Date(res['ts3'] * 1000);
				var s = '';
				lastCnts = $.extend({}, res);
				redrawCntsGraph();

				s += '<table class="latest-cnts"><tbody><tr><td>1 min</td><td>2 min</td><td>3 min</td></tr>';
				s += '<tr><th>'+ res['mincnt'] +'</th><th>'+ res['mincnt2'] +'</th><th>'+ res['mincnt3'] +'</th></tr>';

				s += '<table class="latest-cnts" onclick="openCntsGraph()"><tbody><tr><td>'+ tm(dt3) +'</td><td>'+ tm(dt2) +'</td><td>'+ tm(dt) +'</td></tr>';
				s += '<tr><th>'+ res['cnt'] +'</th><th>'+ res['cnt2'] +' <small>('+ res['b_cnt'] +')</small></th><th>'+ res['cnt3'] +' <small>('+ res['c_cnt'] +')</small></th></tr>';

				el.innerHTML = s;//res['cnt']+ ' (10 sec)';
			}
		}
	}
}

</script>
</head>
<body onload="load();">
	
	<!-- Header -->
	
	<!-- Server status -->
	<header><div class="container_12">
		
		<p id="skin-name"><small>Skai HbbTV<br> Dashboard<br> </small></p><center><small><a href="http://www.skaitv.gr/"><img src="images/skai.svg" style="margin-top:-20px" width="120" height="50"></a></small></center>
	</div></header>
	<!-- End server status -->
	
	<!-- Main nav -->
	<nav id="main-nav">
		<ul class="container_12">
<?php
function hasAccess($u, $page) {
	global $rights;
	if (isset($rights[$u])) {
		if (!in_array($page, $rights[$u]))
			return false;
	}
	return true;
}
foreach ($pages as $key => $val) {
	if (!hasAccess($userLoggedName, $key))
		continue;
	echo '<li class="'. $key .' '. ($key == $pgMode ? 'current' : '') .'"><a href="?pgMode='. $key .'" title="'. $val .'">'. $val .'</a>';
	if ($key == $pgMode)
		$curPageTitle = $val;
}
?>
		</ul>
	</nav>
	<!-- End main nav -->
<?php
if (ENABLE_LOGIN && !$userLoggedName) {
        require('login.php');
        exit;
}
?>

	<!-- Sub nav -->
	<div id="sub-nav"><div class="container_12">
		
		<form id="search-form" name="search-form" method="post" action="">
		<input name="sip" id="s" title="Search..."  type="text" value="<?php echo $_POST['sip']?>">
			<button type="submit">Search IP or program</button>
		</form>
	
	</div></div>
<?php
if ($_POST['sip'] && filter_var($_POST['sip'], FILTER_VALIDATE_IP))
	echo '<p>'. $_POST['sip'] .' not found</p>';
?>
	<!-- End sub nav -->
	
	<!-- Status bar -->
	<div id="status-bar"><div class="container_12">
	
		<ul id="status-infos">
 			<li class="spaced">Logged as: <strong><?php echo $userLoggedName;?></strong></li>
			<li><a href="?action=logout" class="button red" title="Logout"><span class="smaller">LOGOUT</span></a></li>

		</ul>
		
		<!-- v1.5: you can now add class red to the breadcrumb -->
		<ul id="breadcrumb">
			<li><a href="/" title="Home">Home</a></li>
<?php
echo '<li>'. $curPageTitle .'</li>';
//<a href="?" title="Dashboard">Dashboard</a></li>
?>
		</ul>
	
	</div></div>
	<!-- End status bar -->
<?php
if ($pgMode == 'matomo') {
	echo '<div id="header-shadow"></div>';
	echo '<iframe id="iframe" src="http://skaiad.smart-tv-data.com/pi/" style="width:100%;height:3000px" scrolling="no"></iframe>';
	echo '<div class="clear"></div>';
	echo '<footer>';
		echo '<div class="float-right">';
			echo '<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>';
		echo '</div>';
	echo '</footer></body></html>';
	return;
} else if ($pgMode == 'ad') {
	echo '<div id="header-shadow"></div>';
	echo '<iframe id="iframe" src="http://skaiad.smart-tv-data.com/rv/" style="width:100%;height:3000px" scrolling="no"></iframe>';
	echo '<div class="clear"></div>';
	echo '<footer>';
	echo '<div class="float-right">';
	echo '<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>';
	echo '</div>';
	echo '</footer></body></html>';
	return;
}
?>
	
	<article class="container_12">

		<section class="grid_12">
			<div class="block-border"><div class="block-content">

<?php
if ($pgMode == 'home' || $pgMode == 'users') {
	echo '<h1>'. $curPageTitle .'</h1> <div> <div class="block-controls"> <ul class="controls-buttons"><li><a href="?pgMode=program">Program</a></li>';
} else if ($pgMode == 'program') {
	echo '<h1>'. $curPageTitle .'</h1> <div> <div class="block-controls">';
	echo '<form method="get" class="form">';
	echo '<input type="hidden" name="pgMode" value="'. $pgMode .'">';
	echo '<input type="hidden" name="visitsTime" value="'. $visitsTime .'">';
	//echo '<label for="selectdt">Date</label> <select name="curDt" id="selectdt" onchange="location=\'?pgMode=program&curDt=\'+this.value">';
	echo '<label class="inline" for="selectdt">Date</label> <select name="curDt" id="selectdt" onchange="this.form.submit()">';

	foreach ($programDts as $d) {
		$ts = strtotime($d);
		echo '<option value="'. $d .'"'. ($curDt == $d ? ' selected="selected"':'') .'>'. date('d M Y', $ts) .'</option>'. "\n";
	}

	if (isset($customdt) && !in_array($customdt, $programDts))
		echo '<option value="'. $customdt .'" selected="selected">'. date('d M Y', strtotime($customdt)) .'</option>'. "\n";

	echo '</select>';
	echo '<label class="inline" for="custom-dt"> Other date </label>';
	echo '<span class="input-type-text"><input name="custom-dt" id="custom-dt" class="datepicker" type="text" autocomplete="off" value=""><img src="images/calendar-month.png" width="16" height="16"></span>';

	echo '</form>';

	echo '<span style="float: right; margin-top: 12px;" id="get-visits">';
	echo 'Visits for dates: ';
        echo '<span class="input-type-text"><input name="visits_start_dt" id="visits_start_dt" class="datepicker" type="text" autocomplete="off" value=""></span>';

        echo ' - <span class="input-type-text"><input name="visits_end_dt" id="visits_end_dt" class="datepicker" type="text" autocomplete="off" value=""></span>';

	echo ' <div class="custom-dts"><select name="visits_start_time" id="visits_start_time">';
	$visits_start_time = '12:00';
	for ($i = 0; $i < 24; $i++) {
		for ($j = 0; $j < 60; $j+=15) {
			$v = sprintf('%02d:%02d', $i, $j, $i, $j);
			printf('<option value="'. $v .'"'. ($visits_start_time == $v ? ' selected="selected"':'') .'>'. $v .'</label>');
		}
	}
	echo '</select>';
	echo '<input style="width: 4em" type="text" id="visits_start_time_txt" name="visits_start_time_txt">';
	echo '</div>';

	echo ' - <div class="custom-dts"><select name="visits_end_time" id="visits_end_time">';
	$visits_end_time = '12:30';
	for ($i = 0; $i < 24; $i++) {
		for ($j = 0; $j < 60; $j+=15) {
			$v = sprintf('%02d:%02d', $i, $j);
			printf('<option value="'. $v .'"'. ($visits_end_time == $v ? ' selected="selected"':'') .'>'. $v .'</label>');
		}
	}
	echo '</select>';
	echo '<input style="width: 4em" type="text" id="visits_end_time_txt" name="visits_end_time_txt">';
	echo '</div>';

	echo ' <label for="visits_duration">Duration:</label> <select name="visits_duration" id="visits_duration">';
	for ($i = 1; $i < 151; $i++) {
		$d = 4 * $i;
		echo '<option value="'. $d .'">'. getDuration($d) .'</option>';
	}
	echo '</select>';
	echo ' <button style="font-size: 14px;" id="get_visits_range">Get visits</button>';

	echo '<div id="visits_result"></div>';

	echo '</span>';
} else if ($pgMode == 'feeds') {
	echo '<h1>'. $curPageTitle .'</h1> <div> <div class="block-controls">';
} else if ($pgMode == 'sponsors') {
	echo '<h1>'. $curPageTitle .'</h1> <div> <div class="block-controls">';
} else if ($pgMode == 'users') {
	echo '<h1>Popular shows</h1> <div> <div class="block-controls">';
} else if ($pgMode == 'stats')
	echo '<h1>'. $curPageTitle .'</h1><div class="block-controls"> <ul class="controls-buttons"></ul>';
else if ($pgMode == 'search')
	echo '<h1>'. $curPageTitle .'</h1><div class="block-controls"> <ul class="controls-buttons"></ul>';

if ($pgMode == 'home' || $pgMode == 'users') {
	if ($pg > 1) {
		echo('<li><a href="?pg='. ($pg-1) .'" title="Previous">PREV ');
		echo('<img src="images/navigation-180.png" height="16" width="16"></a></li>');
	}
	$start = ($pg - 4 > 0 ? $pg - 4 : 1);
	$end = ($pg + 4 < $total ? $pg + 5 : $total);

	for ($i = $start ; $i < $end; ++$i) {
		echo('<li><a '. ($i == $pg ? ' class="current"':'') .' href="?pgMode='. $pgMode .'&pg='. $i .'" title="'. $i .'">'. $i .'</a></li>');
	}

	if (0 && $lastPg) {
		//echo('...');
		echo('<li><a href="?pg='. $lastPg .'" title="'. $lastPg .'">...'. $lastPg .'</a></li>');
	}

	if ($pg+1 < $total) {
		echo('<li><a href="?pg='. ($pg+1) .'" title="Next">Next ');
		echo('<img src="images/navigation.png" height="16" width="16"></a></li>');
	}
	echo '</ul>';
}

?>
					</div>
					<div class="infos clearfix">
						<h2 class="bigger">
<?php
if ($pgMode == 'home')
	echo 'Latest visits with duration';
else if ($pgMode == 'program')
	echo 'Program '. date('d M Y', strtotime($curDt));
else if ($pgMode == 'feeds')
	echo 'Feed / show manager';
else if ($pgMode == 'sponsors')
	echo 'All sponsors visits';
else if ($pgMode == 'sponsors')
	echo 'Popular shows';
else
	echo $pageTitle;
?>
<?php if ($pgMode == 'program') echo '<a href="javascript:void(0)" style="margin-left: 100px;" onclick="showGraph()"><img src="images/Line-Chart.png" width="48" height="48" title="Lines Chart" alt="Lines-Chart" style="vertical-align:middle"></a>';?>
<?php if ($pgMode != 'feeds') echo '<span style="float: right;" id="latest-visits"></span>';?>
</h2>
					</div>

<?php
if ($pgMode == 'program') {
echo '<div style="float: right;">';
echo '<button style="margin-left: 10px;" title="Only shows > 5 minutes" onclick="location=\'?pgMode=program&curDt='. $curDt .'&visitsTime='. $visitsTime .'&showAll='. ($showAll ? '0':'1') .'\'">'. ($showAll ? 'Hide short':'Show All') .'</button>';
echo '</div>';
?>
					<table id="stats-table" class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell"></th>
							<th scope="col">Start</th>
							<th scope="col">Title</th>
							<th scope="col">End</th>
							<th scope="col">Duration</th>
							<th scope="col">Visits</th>
							<th scope="col">Visits start</th>
							<th scope="col">Visits end</th>
							<th scope="col">Viewers &gt;1 minute</th>
							<th scope="col">Avg duration</th>
						</tr>
					</thead>
					<tbody>
<?php
$k=0;
$b1 = microtime(true);
foreach ($program as $row) {
	$cnt = $row['cnt'];

	echo ("<tr id=\"ts-". $row['start'] ."\">\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo ("<td>". date('H:i:s', $row['start']) ."</td>\n");

	echo ("<td>". $row['title']);

	if ($row['inf'])
		echo " ". $row['inf'];

	if ($row['customer'])
		echo " ". $row['customer'];
	$ctype = 0;
	if (preg_match('#Reppa#si', $row['customer'])) {
		$ctype = 2;
	} else if (preg_match('#Genius#si', $row['customer']))
		$ctype = 1;

	echo ("</td>\n");

	echo ("<td>". date('H:i:s', $row['end']) ."</td>\n");
	echo ("<td>". getDuration($row['duration']) ."</td>\n");
	$more = '';
	if ($row['duration'] > 100)
		$more = " - <a class=\"button\" href=\"showCols.php?from=". $row['start']. '&to='. $row['end']. "\" target=\"show-cols\">Stats</a>";
	if ($row['duration'] > 5 * 60 - 1)
		$more .= " - <a class=\"button red\" href=\"?pgMode=stats&start=". $row['start']. "\">Compare</a>";

	//if ($ctype && ($visitsReppa[$row['start']] || $visitsGenius[$row['start']])) {
	if ($ctype && $row['visited']) {
		//$n = ($ctype == 1 ? count($visitsGenius[$row['start']]) : count($visitsReppa[$row['start']]));
		$n = $row['visited'];
		if ($_GET['testips']) {
		if ($row['start'] == 1571777125) {
			print_r($visitsGenius[1571777125]);
		}
		}
		$ctype == 1 ? $geniusPageVisits += $n : $reppaPageVisits += $n;
		$more .= " - <a class=\"button\" href=\"matchIps.php?from=". $row['start']. '&to='. $row['end']. "&visitsTime=". $visitsTime ."\" target=\"show-ips\" style=\"background: #bbffbb;\">". $n ."</a>";
	}

	echo ("<td>". ($cnt > 1 ? "<a id=\"a-". $row['start'] ."\" onclick=\"showTm(". $row['start'] .", ". $row['end'] .", ". $ctype .", ". $visitsTime .") \" class=\"button\" href=\"javascript:void(0)\">". fm($cnt) ." visits</a>". $more : '-'). "</td>\n");
	echo ("<td>". $row['count_start'] ."</td>\n");
	echo ("<td>". $row['count_end'] ."</td>\n");
	echo ("<td>". ($row['vgt1'] ? $row['vgt1'] .'&nbsp;&nbsp;'. percent($row['vgt1'], $row['cnt']) .'%' : '') ."</td>\n");
	echo ("<td>". ($row['vgt1'] ? getDuration($row['avg_duration']) : '') ."</td>\n");
	echo ("</tr>\n");
	if ($row['vgt1'])
		$otherPercent += percent($row['vgt1'], $row['cnt']);
	++$k;
}
$log .= '<br>Time for program: '. timer_diff($b1);
?>
	</tbody>
	</table>
<?php //echo number_format($otherPercent / ($k+1), 2)?>

<?php } else if ($pgMode == 'sponsors') {
 ?>
					<table class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell" rowspan="2"></th>
							<th scope="col" rowspan="2">Date</th>
							<th scope="col" colspan="5">Reppa</th>
							<th scope="col" colspan="5">Genius</th>
						</tr>
						<tr>
							<th scope="col">Visits start</th>
							<th scope="col">Visits end</th>
							<th scope="col">Page visits</th>
							<th scope="col">Site Unique IPs</th>
							<th scope="col">Site Total IPs</th>
							<th scope="col">Visits start</th>
							<th scope="col">Visits end</th>
							<th scope="col">Page visits</th>
							<th scope="col">Site Unique IPs</th>
							<th scope="col">Site Total IPs</th>
						</tr>
					</thead>
					<tbody>
<?php
$k=0; $reppaStart = 0; $reppaEnd = 0; $reppaIps = 0; $geniusStart = 0; $geniusEnd = 0; $geniusIps = 0;
$reppaUni = 0; $reppaTot = 0; $genUni = 0; $genTot = 0;
$jsStart = "[['Sponsor',{'label': 'Reppa', type: 'number'}, {'label': 'Genius', type: 'number'}],";
$jsEnd = "[['Sponsor',{'label': 'Reppa', type: 'number'}, {'label': 'Genius', type: 'number'}],";
$jsIps = "[['Sponsor',{'label': 'Reppa', type: 'number'}, {'label': 'Genius', type: 'number'}],";

foreach ($sponsors as $dt=>$row) {
	echo ("<tr>\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo ("<td>". dt(strtotime($dt)) ."</td>\n");

	echo ("<td>". fm($row['reppa']['start']) .'</td>');
	echo ("<td>". fm($row['reppa']['end']) .'</td>');
	echo ("<td>". fm($row['reppa']['ips']) .' / '. fm($row['reppa']['ipst']) .'</td>');
	echo ("<td>". fm($row['reppa']['ipsuni']) .'</td>');
	echo ("<td>". fm($row['reppa']['ipstot']) .'</td>');
	echo ("<td>". fm($row['genius']['start']) .'</td>');
	echo ("<td>". fm($row['genius']['end']) .'</td>');
	echo ("<td>". fm($row['genius']['ips']) .' / '. fm($row['genius']['ipst']) .'</td>');
	echo ("<td>". fm($row['genius']['ipsuni']) .'</td>');
	echo ("<td>". fm($row['genius']['ipstot']) .'</td>');

	$reppaStart += $row['reppa']['start'];
	$reppaEnd += $row['reppa']['end'];
	$reppaIps += $row['reppa']['ips'];
	$reppaUni += $row['reppa']['ipsuni'];
	$reppaTot += $row['reppa']['ipstot'];
	$geniusStart += $row['genius']['start'];
	$geniusEnd += $row['genius']['end'];
	$geniusIps += $row['genius']['ips'];
	$genUni += $row['genius']['ipsuni'];
	$genTot += $row['genius']['ipstot'];

	$jsStart .= "['". dt(strtotime($dt)) ."',". $row['reppa']['start'] .','. $row['genius']['start'] ."],\n";
	$jsEnd .= "['". dt(strtotime($dt)) ."',". $row['reppa']['end'] .','. $row['genius']['end'] ."],\n";
	if ($row['reppa']['ips'])
		$jsIps .= "['". dt(strtotime($dt)) ."',". $row['reppa']['ips'] .','. $row['genius']['ips'] ."],\n";

	echo ("</tr>\n");
	++$k;
}
$jsStart .=']'; $jsEnd .=']'; $jsIps .=']';

echo '<tr><td></td><td>Total</td><td>'. fm($reppaStart) .'</td><td>'. fm($reppaEnd) .'</td><td>'. fm($reppaIps) .'</td>';
echo '<td>'. fm($reppaUni) .'</td><td>'. fm($reppaTot) .'</td>';
echo '<td>'. fm($genUni) .'</td><td>'. fm($genTot) .'</td>';
echo '<td>'. fm($geniusStart) .'</td><td>'. fm($geniusEnd).'</td><td>'. fm($geniusIps) .'</td></tr>';
?>
	</tbody>
	</table>
	<ul class="message no-margin">
	<li>Tracked visits -+ <?php echo ($visitsTime / 3600)?> hours</li>
	</ul>
		<div id="chart_start" style="height:530px;"></div>
		<div id="chart_end" style="height:530px;"></div>
		<div id="chart_ips" style="height:530px;"></div>

<?php } else if ($pgMode == 'users') {
 ?>
					<table class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell"></th>
							<th scope="col">Profile</th>
							<th scope="col">Show</th>
							<th scope="col">Customer</th>
							<th scope="col">Time</th>
							<th scope="col">Duration</th>
							<th scope="col">Views</th>
						</tr>
					</thead>
					<tbody>
<?php

$k = ($pg - 1) * $perPage;
foreach ($items as $row) {
	$show = $shows[$row['ts']];
	echo ("<tr>\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo '<td><a href="show-id.php?id='. $row['id'] .'" target="_blank">'. $row['id'] .'</a></td>';

	echo ("<td><span title=". $row['hash'] .">". ($show ? $show['title'] : $row['ts']) .'</span></td>');
	echo ("<td>". $show['customer'] .'</td>');
	echo ("<td>". date('H:i:s', $show['start']) .' - '. date('H:i:s', $show['end']) .'</td>');
	echo ("<td>". getDuration($show['duration']) .'</td>');
	echo ("<td>". $row['cnt'] .'</td>');

	echo ("</tr>\n");
	$k++;
}
?>
	</tbody>
	</table>

<?php } else if ($pgMode == 'home') {
 ?>
					<table class="table" width="100%" cellspacing="0">
					<thead>
						<tr>
							<th scope="black-cell"></th>
							<th scope="col">ID</th>
							<th scope="col">Ip</th>
							<th scope="col">
								<span class="column-sort">
								<a href="<?php echo $sortDtUp?>" title="Sort up" class="sort-up"></a>
								<a href="<?php echo $sortDtDown?>" title="Sort down" class="sort-down"></a>
								</span>
								Date
							</th>
							<th scope="col">
								<span class="column-sort">
								<a href="<?php echo $sortDrUp?>" title="Sort up" class="sort-up"></a>
								<a href="<?php echo $sortDrDown?>" title="Sort down" class="sort-down"></a>
								</span>
							Duration
							</th>
							<th scope="col">
								<span class="column-sort">
								<a href="<?php echo $sortViUp?>" title="Sort up" class="sort-up"></a>
								<a href="<?php echo $sortViDown?>" title="Sort down" class="sort-down"></a>
								</span>
							Visits
							</th>
						</tr>
					</thead>
					<tbody>
<?php
$k = ($pg - 1) * $perPage;
while ($row = $res->fetch_assoc()) {
	$dur = $row['end'] - $row['ts'];
	$time = '';
	if ($dur)
		$time = getDuration($dur);

	echo ("<tr id=\"id-". $row['id'] ."\">\n");

	echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
	echo ("<td>". $row['id'] ."</td>\n");
	echo ("<td>". long2ip($row['ip']) ."</td>\n");
	echo ("<td>". date("d M H:i:s", $row['ts']) ."</td>\n");
	echo ("<td>". $time ."</td>\n");
	echo ("<td>". ($row['cnt'] > 1 ? "<a onclick=\"showId(". $row['id'] .", ". $row['ts'] .") \" href=\"javascript:void(0)\">". $row['cnt'] ." visits</a>" : '-'). "</td>\n");
	echo ("</tr>\n");
	++$k;
}
} else if ($pgMode == 'feeds') {
	echo '<p><a href="?pgMode='. $pgMode .'&showFeeds=3">All Shows</a> | <a href="?pgMode='. $pgMode .'&showFeeds=1">Active Shows</a> |<a href="?pgMode='. $pgMode .'&showFeeds=2">Inactive Shows</a></p>';
	if (!$showFeeds) {
		// values for cats in DB are: home=100, news=0, psuchagogia=1, seires=2
		$cats = ['Αρχική','Ενημέρωση','Ψυχαγωγία','Σειρές','Cinema','Αθλητικά'];

		echo '<form id="cats" method="post" action="">';
		echo '<table class="table" width="100%" cellspacing="0">';
		echo '<tbody>';

		foreach ($cats as $k=>$cat) {
			$k--;
			if ($k < 0)
				$k = 100;
			$selIdsArray = explode(",", $selIds[$k]);
			echo '<tr><th><label for="show'. $k .'">'. $cat .'</label></th><td><select name="shows[]" id="show'. $k .'">';
			if (isset($shows[$k]))
			foreach ($shows[$k] as $show)
				echo '<option value="'. $show['id'] .'" '. ($selShows[$k] == $show['id'] ? ' selected="selected"':'') .'>'. htmlspecialchars($show['title']) .'</option>';
			echo '</select><input type="hidden" name="cats[]" value="'. $k .'">';
			echo '</td><td style="width:50%"><a class="button show" data-target="'.$k.'">Εμφάνιση Επιλογών show</a><div id="cont'. $k .'" style="display:none"><a class="button hide" data-target="'.$k.'">Απόκρυψη επιλογών</a><div class="row style-select">
  <div class="col-md-12">
    <div class="subject-info-box-1">
      <label>Όλα τα shows</label>
      <ul class="form-control" data-k="'.$k.'" id="lstBox_all_'.$k.'">';
if (isset($shows[$k]))
      foreach ($shows[$k] as $show){
      		if(in_array($show['id'], $selIdsArray)) continue;
		echo '<li data-value="'. $show['id'] .'">'. htmlspecialchars($show['title']) .'</li>';
	}
	echo '</ul>
    </div>

    

    <div class="subject-info-box-2">
      <label>Επιλεγμένα shows</label>
      <ul multiple class="form-control" data-k="'.$k.'" id="lstBox_added_'.$k.'">';
	foreach ($selIdsArray as $show){
		$title = "";
		if (isset($shows[$k]))
		foreach ($shows[$k] as $test){
			if($test['id'] == $show){
				$title = $test['title'];
				break;
			}
		}
		echo '<li data-value="'. $show .'">'. htmlspecialchars($title) .'</li>';
	}
	echo '</ul>
    </div>

    <div class="clearfix"></div>
  </div>
</div><input type="hidden" name="ids[]" id="ids'. $k .'" value="'. htmlspecialchars($selIds[$k]) .'"></div></td>';
			echo '</td></tr>';
		}
		echo '<tr><th style="text-align: center;" colspan="3"><button>Save</button></th></tr>';
		echo '</tbody>';
		echo '</table>';
		echo '<input type="hidden" name="savecats" value="1">';
		echo '</form><br>';

		echo '<form id="cats2" method="post" action="">';
		echo '<h2>Κατηγορίες</h2>';
		echo '<table class="table" width="100%" cellspacing="0">';
		echo '<tbody>';

		foreach ($cats as $k=>$cat) {
			$k--;
			if ($k < 0)
				$k = 100;
			echo '<tr><th><label for="ct'. $k .'">'. $cat .'</labe></th><td><input id="ct'. $k .'" style="width: 28em;" type="text" name="titles[]" value="'. htmlspecialchars($ctitles[$k]) .'">';
			echo '<input type="hidden" name="ids[]" value="'. $k .'">';
			echo '</td></tr>';
		}
		echo '<tr><th style="text-align: center;" colspan="4"><button>Save</button></th></tr>';
		echo '</tbody>';
		echo '</table>';
		echo '<input type="hidden" name="savetitles" value="1">';
		echo '</form><br>';

		echo '<form class="block-content form" id="cats" method="post" action="">';
		echo '<fieldset class="grey-bg">';
		echo '<legend>Προσθήκη inactive εκπομπής χωρίς επεισόδια</legend>';
		echo '<p>';
		$json = json_decode(file_get_contents('https://www.skaitv.gr/hbbtv/shows.json'));
		if ($msg == 'add-inactive')
			echo '<div><b>Το ID προστέθηκε. Στο επόμενο feed parsing θα προστεθεί η εκπομπή.</b></div>';
		echo '<select id="inactive" name="inactive">';
		foreach ($json as $section) {
			foreach ($section as $shows) {
				foreach ($shows as $show) {
					echo '<option value="'. $show->id .'">'. htmlspecialchars($show->title .' | '. $show->id .' | '. $show->subtitle) .'</option>';
				}
			}
		}
		echo '</select>';
		echo '<input type="hidden" name="saveinactive" value="1">';
		echo '<button>Save</button>';
		echo '</p>';
		echo '</fieldset>';
		echo '</form><br>';
	}

	if ($showFeeds) {
		echo '<table class="table" width="100%" cellspacing="0"';
		echo '<thead><tr><th scope="black-cell"></th>';
		echo '<th scope="col">ID</th>';
		echo '<th scope="col">Show</th>';
		echo '<th scope="col">Info</th>';
		echo '<th scope="col">Feed</th>';
		echo '<th scope="col">Category</th>';
		echo '<th scope="col">Episodes</th>';
		echo '<th scope="col">Updated</th>';
		echo '<th scope="col">Active</th>';
		echo '</tr></thead>';
		echo '<tbody>';

		$sections = ['Ενημέρωση','Ψυχαγωγία','Σειρές','Cinema','Αθλητικά'];
		foreach ($feeds as $k=>$f) {
			if ($showFeeds!= 3 && ($showFeeds == 1 && !$f['active']) || ($showFeeds == 2 && $f['active']))
				continue;
			echo '<tr'. ($f['active'] ? '':' style="text-decoration: line-through;"') .'>';
			echo '<th scope="row" class="table-check-cell">'. ($k+1). '</th>';
			echo '<td>'. $f['id'] .'</td>';
			echo '<td>'. htmlspecialchars($f['title']) .'</td>';
			echo '<td>'. htmlspecialchars($f['subtitle']) .'</td>';
			echo '<td><a target="_blank" href="'. $f['link'] .'"><img width="20" alt="rss" src="images/rss.png"></a> ';
			if (!in_array($f['id'], $runFeeds))
				echo '<a href="?action=runfeed&id='. $f['id'] .'"><img width="26" alt="feed" src="images/play.png"></a>';
			echo '</td>';
			echo '<td>'. $sections[$f['cat_id']] .'</td>';
			echo '<td>'. $epNum[$f['id']] .'</td>';
			echo '<td>'. ($f['updated'] ? date('d/m/Y H:i', $f['updated']) : '-') .'</td>';
			echo '<td id="data-feed-'. $k .'">';
			echo '<a href="javascript:void(0)" onclick="toggleFeed(\''. htmlspecialchars(str_replace("'", "\\'", $f['title'])) .'\', '. $f['id'] .', '. $k .')">';
			echo ($f['active'] ? 'active': 'inactive');
			echo '</a>';

			if ($f['active'])
				echo ' - <a href="javascript:void(0)" onclick="openUploader(\''. htmlspecialchars(str_replace("'", "\\'", $f['title'])) .'\', '. $f['id'] .', '. $k .')">menu icon</a>';
			if ($f['menu_icon'])
				echo ' - <a href="'. $f['menu_icon'] .'" target="_blank"><img style="border: 1px solid blue" width="30" src="'. $f['menu_icon'] .'"></a>';

			if ($f['active'])
				echo ' - <a href="javascript:void(0)" onclick="openUploaderBg(\''. htmlspecialchars(str_replace("'", "\\'", $f['title'])) .'\', '. $f['id'] .', '. $k .')">bg image</a>';

			if ($f['bg_icon'])
				echo ' - <a href="http://skai.smart-tv-data.com/img/bg/'. $f['id'] .'.jpg" target="_blank"><img style="border: 1px solid blue" width="30" src="http://skai.smart-tv-data.com/img/bg/'. $f['id'] .'.jpg"></a>';

			echo '</td>';
			echo '</tr>';
		}
		echo '</tbody>';
		echo '</table>';
	}
}

if ($pgMode == 'home' || $pgMode == 'program')
	echo '</tbody></table>';

if ($pgMode == 'stats') {
	echo '<form class="form" id="tab-stats" method="post" action="" style="margin-bottom: 24px;">';
	echo '<fieldset class="grey-bg">';
	echo '<legend><a href="#">Options</a></legend>';
	echo '<div class="float-left gutter-right">';
	echo '<label for="stats-start">Start</label>';
	echo '<span class="input-type-text"><input name="stats-start" id="stats-start" class="datepicker" type="text" value="'. $start .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="stats-end">End</label>';
	echo '<span class="input-type-text"><input name="stats-end" id="stats-end" class="datepicker" type="text" value="'. $end .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="tvshow">TV Show</label>';
	echo '<select name="tvshow" id="tvshow">';
	foreach ($programCompare as $ts=>$show)
		echo '<option value="'. $ts .'"'. ($programStart == $ts ? ' selected="selected"':'') .'>'. date('H:i:s', $ts) .' - ' .date('H:i:s', $show['end']) .' '. htmlspecialchars($show['title']) .'</option>'."\n";
	echo '</select>';
	echo '</div>';

	echo '<input style="margin-top: 1%;" type="submit" class="button" value="Results">';
	echo '</fieldset>';
	echo '</form>';

	if (count($compares)) {
		$timeel = 60; $duration = 1800;

		$jsCompare = "[['Day',";
		foreach ($compares as $v) {
			$jsCompare .= "{label: '". dt($v['ts']) ."', type: 'number'},";
		}
		$jsCompare .= "],\n";

		$ts = $programStart; $n = 0;

		if (0 && $_GET['test']) {
			// find min time
			$minTs = $compares[0]['ts'];

			foreach ($compares as $v) {
				$minTs = min($minTs, $v['ts']);
			}

			// adjust values by time
			$m = date('His', $minTs);

			foreach ($compares as $k=>$v) {
				$t = date('His', $v['ts']);

				while ($t > $m) {
					array_unshift($compares[$k]['a'], 'null');

					$t -= 60;
				}
			}
			$ts = $minTs;
		}

		// find max count for compares
		foreach ($compares as $v) {
			if ($_GET['test'])
				echo "n $n count ". count($v['a']) ."\n";
			$n = max($n, $v['n']);
		}

		if ($_GET['test'])
		{echo "n $n\n"; print_r($compares); }
		$tot = count($compares);

		for ($i = 0; $i < $n;$i++) {
			$jsCompare .= "['". date('H:i', $ts + $i * 60) ."',";

			foreach ($compares as $k=>$v) {
				//if (isset($v['a'][$i]))
				$num = (int)$v['a'][$i];
				if (!$num) $num = "null";
				$jsCompare .= $num. ($k+1 < $tot ? ',':'');
			}

			$jsCompare.= "],\n";
		}
		$jsCompare .= "]";
		//$jsCompare .= "\n//$n,$tot";

		/*echo('<table class="table" id="visits"  cellspacing="0">'."\n");

		echo '<thead>';
		foreach ($counts as $r) {
			echo "<th scope=\"col\">". dt($r['ts']) ."</th>\n";
		}
		echo "</thead><tbody><tr>\n";
		foreach ($counts as $v) {
			echo '<td>'. $v['total'] .'</td>';
		}
		echo "</tbody></tr>\n";

		echo("</table>\n");
		 */
		echo '<div id="chart_div" style="height:530px;"></div>';

	}
} else if ($pgMode == 'search') {
	echo '<form class="form" id="tab-search" method="post" action="" style="margin-bottom: 24px;">';
	echo '<fieldset class="grey-bg">';
	echo '<legend><a href="#">Options</a></legend>';
	echo '<div class="float-left gutter-right">';
	echo '<label for="search-start">Start</label>';
	echo '<span class="input-type-text"><input name="search-start" id="search-start" autocomplete="off" class="datepicker" type="text" value="'. $start .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="search-end">End</label>';
	echo '<span class="input-type-text"><input name="search-end" id="search-end" autocomplete="off" class="datepicker" type="text" value="'. $end .'"><img src="images/calendar-month.png" width="16" height="16"></span>';
	echo '</div>';

	echo '<div class="float-left gutter-right">';
	echo '<label for="tvshow">TV Show</label>';
	echo '<input style="margin-top: 0.8%; width: 35em;" name="tvshow" id="tvshow" value="'. htmlspecialchars($tvshow) .'">';
	echo '</div>';

	echo '<input style="margin-top: 0.8%;" type="submit" class="button" value="Search">';
	echo '</fieldset>';
	echo '</form>';

	if (isset($items) && count($items)) {
?>
	<table class="table" width="100%" cellspacing="0">
	<thead>
		<tr>
			<th scope="col">Title</th>
			<th scope="col">Duration</th>
			<th scope="col">Visits</th>
			<th scope="col">Visits start</th>
			<th scope="col">Visits end</th>
			<th scope="col">Viewers &gt; minute</th>
		</tr>
	</thead>
	<tbody>
<?php
	$totals = [];
	$totals['tit'] = '';
	$totals['dur'] = 0;
	$totals['vis'] = 0;
	$totals['stv'] = 0;
	$totals['env'] = 0;
	$totals['vie'] = 0;
	foreach ($items as $item) {
		$totals['tit'] = $item['title'];
		$totals['dur'] += $item['end']-$item['start'];
		$totals['vis'] += $item['cnt'];
		$totals['stv'] += $item['count_start'];
		$totals['env'] += $item['count_end'];
		$totals['vie'] += $item['vgt1'];
	}
	echo '<tr><td>'. $totals['tit'] .'</td><td>'. getDuration($totals['dur']) .'</td><td>'. fm($totals['vis']) .'</td><td>'. fm($totals['stv']) .'</td><td>'. fm($totals['env']) .'</td><td>'. fm($totals['vie']) .'</td></tr>';
?>
	</tbody>
	</table>

	<table id="stats-table" class="table" width="100%" cellspacing="0">
	<thead>
		<tr>
			<th scope="black-cell"></th>
			<th scope="col">Start</th>
			<th scope="col">Title</th>
			<th scope="col">End</th>
			<th scope="col">Duration</th>
			<th scope="col">Visits</th>
			<th scope="col">Visits start</th>
			<th scope="col">Visits end</th>
			<th scope="col">Viewers &gt;1 minute</th>
			<th scope="col">Avg duration</th>
		</tr>
	</thead>
	<tbody>
<?php
	$k=0;
	foreach ($items as $row) {
		$cnt = $row['cnt'];

		echo ("<tr id=\"ts-". $row['start'] ."\">\n");

		echo ('<th scope="row" class="table-check-cell">'. ($k+1). '</th>');
		echo ("<td>". date('d/m/Y H:i:s', $row['start']) ."</td>\n");

		echo ("<td>". $row['title']);

		if ($row['inf'])
			echo " ". $row['inf'];

		if ($row['customer'])
			echo " ". $row['customer'];
		$ctype = 0;
		if (preg_match('#Reppa#si', $row['customer'])) {
			$ctype = 2;
		} else if (preg_match('#Genius#si', $row['customer']))
			$ctype = 1;

		echo ("</td>\n");

		echo ("<td>". date('H:i:s', $row['end']) ."</td>\n");
		echo ("<td>". getDuration($row['duration']) ."</td>\n");
		$more = '';
		if ($row['duration'] > 100)
			$more = " - <a class=\"button\" href=\"showCols.php?from=". $row['start']. '&to='. $row['end']. "\" target=\"show-cols\">Stats</a>";
		if ($row['duration'] > 5 * 60 - 1)
			$more .= " - <a class=\"button red\" href=\"?pgMode=stats&start=". $row['start']. "\">Compare</a>";

		//if ($ctype && ($visitsReppa[$row['start']] || $visitsGenius[$row['start']])) {
		if ($ctype && $row['visited']) {
			//$n = ($ctype == 1 ? count($visitsGenius[$row['start']]) : count($visitsReppa[$row['start']]));
			$n = $row['visited'];
			if ($_GET['testips']) {
				if ($row['start'] == 1571777125) {
					print_r($visitsGenius[1571777125]);
				}
			}
			$ctype == 1 ? $geniusPageVisits += $n : $reppaPageVisits += $n;
			$more .= " - <a class=\"button\" href=\"matchIps.php?from=". $row['start']. '&to='. $row['end']. "&visitsTime=". $visitsTime ."\" target=\"show-ips\" style=\"background: #bbffbb;\">". $n ."</a>";
		}

		echo ("<td>". ($cnt > 1 ? "<a id=\"a-". $row['start'] ."\" onclick=\"showTm(". $row['start'] .", ". $row['end'] .", ". $ctype .", ". $visitsTime .") \" class=\"button\" href=\"javascript:void(0)\">". fm($cnt) ." visits</a>". $more : '-'). "</td>\n");
		echo ("<td>". $row['count_start'] ."</td>\n");
		echo ("<td>". $row['count_end'] ."</td>\n");
		echo ("<td>". ($row['vgt1'] ? $row['vgt1'] .'&nbsp;&nbsp;'. percent($row['vgt1'], $row['cnt']) .'%' : '') ."</td>\n");
		echo ("<td>". ($row['vgt1'] ? getDuration($row['avg_duration']) : '') ."</td>\n");
		echo ("</tr>\n");
		++$k;
	}
	echo '</table>';
}
}
?>
				</div>

			</div></div>
		</section>
	</article>
	<div class="clear"></div>

	<script>
		jQuery.browser = {};
		(function () {
			    jQuery.browser.msie = false;
			    jQuery.browser.version = 0;
			    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
				    jQuery.browser.msie = true;
				    jQuery.browser.version = RegExp.$1;
			    }
		})();

$(document).ready(function() {
	$('#get_visits_range').click(function() {
		var sdt = $('#visits_start_dt').val(),
		 edt = $('#visits_end_dt').val(),
		 st = $('#visits_start_time').val(),
		 du = $('#visits_duration').val(),
		 cst = $('#visits_start_time_txt').val(),
		 cet = $('#visits_end_time_txt').val(),
		 et = $('#visits_end_time').val();

		if (!sdt || !edt) {
			alert('Please select dates');
			return;
		}

		const http = new XMLHttpRequest();
		const url = 'getVisits.php?sdt='+ sdt +'&edt='+ edt +'&st='+ encodeURI(st) +'&et='+ encodeURI(et) +'&du='+ du +'&cst='+ cst +'&cet='+ cet;

		$('#get_visits_range').addClass('loading');

		http.open("GET", url);
		http.send();
		http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var res = JSON.parse(http.responseText);
				$('#get_visits_range').removeClass('loading');

				if (!res) {
					alert('json failed');
					return;
				} else if (res.error) {
					alert(res.error);
					return;
				} else {
					console.log(res);
					var t = parseInt(res.total), s = '';
					if (t > 999) {
						t = t / 1000;
						s = t.toFixed(3);
					} else
						s = t;

					$('#visits_result').html('<b>'+ s + "</b> visits found");
				}
			}
		}
	});
	/*
	 * Datepicker
	 * Thanks to sbkyle! http://themeforest.net/user/sbkyle
	 */
	$('.datepicker').datepick({
<?php
if ($customdt)
	echo "defaultDate: '". date('d-m-Y', strtotime($customdt)) ."',\n";
?>
        	dateFormat: 'dd-mm-yyyy',
		alignment: 'bottom',
		showOtherMonths: true,
		selectOtherMonths: true,
		onSelect: function () {
			if (this.name == "custom-dt") {
				this.form.submit();
			}
		},
		renderer: {
			picker: '<div class="datepick block-border clearfix form"><div class="mini-calendar clearfix">' +
					'{months}</div></div>',
			monthRow: '{months}', 
			month: '<div class="calendar-controls" style="white-space: nowrap">' +
						'{monthHeader:M yyyy}' +
					'</div>' +
					'<table cellspacing="0">' +
						'<thead>{weekHeader}</thead>' +
						'<tbody>{weeks}</tbody></table>', 
			weekHeader: '<tr>{days}</tr>', 
			dayHeader: '<th>{day}</th>', 
			week: '<tr>{days}</tr>', 
			day: '<td>{day}</td>', 
			monthSelector: '.month', 
			daySelector: 'td', 
			rtlClass: 'rtl', 
			multiClass: 'multi', 
			defaultClass: 'default', 
			selectedClass: 'selected', 
			highlightedClass: 'highlight', 
			todayClass: 'today', 
			otherMonthClass: 'other-month', 
			weekendClass: 'week-end', 
			commandClass: 'calendar', 
			commandLinkClass: 'button',
			disabledClass: 'unavailable'
		}
	});

<?php
if (isset($jsCompare))
	echo "showCompare();\n";

if (isset($jsStart))
	echo "showSponsorGraphs();\n";
?>
$( "[id^=lstBox_added_]" ).each(function(){
	var cWith = "#lstBox_all_"+$(this).data("k");
	$(this).sortable({
		connectWith: cWith,
		update:function(event, ui) {
			console.log(event.target);
			var k = $(event.target).data("k");
			var arr = [];
    			$("#lstBox_added_"+k+" li").each(function(){
    				arr.push($(this).data("value"));
    			});
    			$('form#cats #ids'+k).val(arr.join(","));
		}
	});
});
$( "[id^=lstBox_all_]" ).each(function(){
	var cWith = "#lstBox_added_"+$(this).data("k");
	$(this).sortable({
  		connectWith: cWith
  	});
});
$('form#cats a.button.show').on("click", function(e){
	$("#cont"+$(this).data("target")).show();
	$(this).hide();
});
$('form#cats a.button.hide').on("click", function(e){
	$("#cont"+$(this).data("target")).hide();
	$("#cont"+$(this).data("target")).prev().show();
})

});

function showSponsorGraphs() {
	var w = $(window).width() - 200, h = $(window).height() / 2;

	var dataStart = new google.visualization.arrayToDataTable(<?php echo $jsStart?>);
	var dataEnd = new google.visualization.arrayToDataTable(<?php echo $jsEnd?>);
	var dataIps = new google.visualization.arrayToDataTable(<?php echo $jsIps?>);

	ch1 = new google.visualization.ChartWrapper();
	ch2 = new google.visualization.ChartWrapper();
	ch3 = new google.visualization.ChartWrapper();

	ch1.setContainerId('chart_start');
	ch1.setChartType('LineChart');
	ch1.setDataTable(dataStart);
	ch1.setOptions({
		title: 'Visits start',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	ch1.draw();

	ch2.setContainerId('chart_end');
	ch2.setChartType('LineChart');
	ch2.setDataTable(dataEnd);
	ch2.setOptions({
		title: 'Visits end',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	ch2.draw();

	ch3.setContainerId('chart_ips');
	ch3.setChartType('LineChart');
	ch3.setDataTable(dataIps);
	ch3.setOptions({
		title: 'Page Visits',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	ch3.draw();
}

function showCompare() {
	var w = $(window).width() - 200, h = $(window).height() / 2;

	var data = new google.visualization.arrayToDataTable(<?php echo $jsCompare?>);

	googleChart = new google.visualization.ChartWrapper();

	googleChart.setContainerId('chart_div');
	googleChart.setChartType('LineChart');
	googleChart.setDataTable(data);
	googleChart.setOptions({
		title: 'TV Show viewers comparisation per day',
		pointSize: 5,
		width: w,
		height: h,
		legend: 'right',
		yAxis: {title: '(total)'}
	});
	googleChart.draw();
}

	</script>

	<script src="js/jquery_006.js"></script>
	<!-- Template libs -->
	<script src="js/jquery_003.js"></script>
	<!--<script src="js/searchField.js"></script>-->
	<script src="js/common.js"></script>
	<script src="js/standard.js"></script>

	<script src="js/jquery_002.js"></script>
	<script src="js/jquery_004.js"></script>
	<script src="js/jquery.js"></script>
	<script src="js/jquery-ui.min.js"></script>
	<!-- Custom styles lib -->
	<script src="js/list.js"></script>
	
	<!-- Plugins -->
	<script src="js/jquery_007.js"></script>
	<script src="js/jquery_005.js"></script>
	
	<!-- Charts library -->
	<!--Load the AJAX API-->
	<script src="js/jsapi.js"></script>
<script>
// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages':['corechart']});
</script>

	<footer>
		<div class="float-right">
			<a href="#top" class="button"><img src="images/navigation-090.png" width="16" height="16"> Page top</a>
		</div>
		
	</footer>
<?php
if ($_GET['log'])
	echo $log;
?>
</body>
</html>
