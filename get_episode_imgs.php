<?php
$path = '/var/www/html/skai/episodes/';
include('/var/www/html/skai/admin/config.php');

$res = $mysqli->query("SELECT id, img, show_id FROM episodes WHERE local_img = ''");
while ($row = $res->fetch_assoc()) {
	//$fname = basename($row['img']);
	$ext = pathinfo($row['img'], PATHINFO_EXTENSION);
	$fname = $row['id'] .'.'. $ext;
	$data = file_get_contents(preg_replace("# #si", "%20", $row['img']));

	if (!$data)
		die("Failed\n");
	file_put_contents("/var/www/html/skai/img/episodes/". $fname, $data);
	$mysqli->query("UPDATE episodes SET local_img = '". $fname ."' WHERE id = ". $row['id']);
	echo "Saving to $fname for ". $row['id'] ."\n";
}

