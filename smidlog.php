<?php
// Log video and playstate change for a smart id
if ($_SERVER['HTTP_HOST'] == 'smarttv.anixa.tv' || $_SERVER['HTTP_HOST'] == '127.0.0.1')
	exit;
$servername = '127.0.0.1';
$username = 'stats';
$password = 'dklfgR.h542';

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8");
mysqli_select_db($conn, "skai");
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$ip = 0;
if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && $_SERVER['HTTP_X_FORWARDED_FOR']) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
        $ip = $_SERVER['REMOTE_ADDR'];
}
$j = file_get_contents('php://input');
$o = json_decode($j, true);

$url = trim(@$o['url']);
$title = @html_entity_decode($o['title']);
$episode = @html_entity_decode($o['episode']);
$category = @html_entity_decode($o['category']);
$ua = @$o['ua'];
$smid = (int)@$o['smid'];
$state = (int)@$o['state'];
$error = (int)@$o['error'];
$lastid = (int)@$o['lastid'];

$response = [];
if (!$smid)
	$response['error'] = 'Missing smart ID';
else if ($url == 'speed') {
	$speed = (double)@$o['speed'];
	$ua = mysqli_real_escape_string($conn, $ua);

	$q = "INSERT INTO smids SET id = ". $smid .", ip = INET_ATON('". $ip ."'), speed = ". $speed .", ua = '". $ua ."' ON DUPLICATE KEY UPDATE speed = ". $speed;
	$res = $conn->query($q);
	errcheck();
} else if (!$url)
	$response['error'] = 'Missing video URL';
else {
	$vid = 0; $tid = 0; $eid = 0; $cid = 0;
	$url = mysqli_real_escape_string($conn, $url);
	$ua = mysqli_real_escape_string($conn, $ua);
	$url = preg_replace("#195\.226\.218\.\d{1,3}#si", 'cdn.smart-tv-data.com', $url);
	$url = preg_replace("#abr\.#si", 'cdn.', $url);
	$q = "SELECT id FROM videos WHERE url = '". $url ."'";
	$res = $conn->query($q);
	errcheck();

	if ($row = $res->fetch_row()) {
		$vid = (int)$row[0];
	}
	if (!$vid) {
		$title = mysqli_real_escape_string($conn, $title);
		$episode = mysqli_real_escape_string($conn, $episode);
		$category = mysqli_real_escape_string($conn, $category);

		$q = "SELECT id FROM st_categories WHERE title = '". $category ."'";
		$res = $conn->query($q);
		errcheck();

		if ($row = $res->fetch_row()) {
			$cid = (int)$row[0];
		}
		if (!$cid) {
			$q = "INSERT INTO st_categories SET title = '". $category ."'";
			$res = $conn->query($q);
			errcheck();
			$cid = (int)$conn->insert_id;
		}

		$q = "SELECT id FROM titles WHERE title = '". $title ."'";
		$res = $conn->query($q);
		errcheck();

		if ($row = $res->fetch_row()) {
			$tid = (int)$row[0];
		}
		if (!$tid) {
			$q = "INSERT INTO titles SET title = '". $title ."', category = '". $cid ."'";
			$res = $conn->query($q);
			errcheck();
			$tid = (int)$conn->insert_id;
		}
		$q = "SELECT id FROM st_episodes WHERE title = '". $episode ."'";
		$res = $conn->query($q);
		errcheck();

		if ($row = $res->fetch_row()) {
			$eid = (int)$row[0];
		}
		if (!$eid) {
			$q = "INSERT INTO st_episodes SET title = '". $episode ."', tid = ". $tid;
			$res = $conn->query($q);
			errcheck();
			$eid = (int)$conn->insert_id;
		}
		$q = "INSERT INTO videos SET url = '". $url ."', title = '". $tid ."', episode = '". $eid ."'";
		$res = $conn->query($q);
		errcheck();
		$vid = (int)$conn->insert_id;

		if (!$vid) {
			$response['error'] = 'Video id failure';
			goto ex;
		}

	}

	$q = "INSERT INTO vid_actions SET smid = ". $smid .", ts = UNIX_TIMESTAMP(), vid = ". $vid .", state = ". $state .", error = ". $error;
	if ($lastid)
		$q = "UPDATE vid_actions SET ts = UNIX_TIMESTAMP() WHERE id = ". $lastid;
	$res = $conn->query($q);
	if ($lastid)
		$id = $lastid;
	else
		@$id = (int)$conn->insert_id;
	errcheck();

	if (strlen($ua)) {
		$q = "INSERT IGNORE INTO smids SET id = ". $smid .", ip = INET_ATON('". $ip ."'), speed = 0, ua = '". $ua ."'";
		$res = $conn->query($q);
		errcheck();
	}

	$response['success'] = true;
	$response['id'] = $id;
}
ex:

echo json_encode($response);

function errcheck() {
	global $response, $conn;
	if ($conn->error) {
		$response['error'] = 'SQL error: '. $conn->error;
		echo json_encode($response);
		exit;
	}
}
