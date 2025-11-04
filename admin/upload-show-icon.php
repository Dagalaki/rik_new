<?php
require_once('config.php');

$id = (int)$_POST['id'];

if (!$id)
	return;
$dest = '/var/www/html/skai/img/shows/'. $id;

if (isset($_FILES['img'])) {
	$img = $_FILES['img']; $f = 'http://skai.smart-tv-data.com/img/shows/'. $id;
	if ($img['type'] == 'image/png') {
		$dest .= '.png';
		$f .= '.png';
	} else if ($img['type'] == 'image/jpeg') {
		$dest .= '.jpg';
		$f .= '.jpg';
	} else
		die('Unexpected file format');

	//echo " from ". $img['tmp_name'] ." to $dest\n";
	if (move_uploaded_file($img['tmp_name'], $dest)) {
		$mysqli->query("UPDATE shows SET menu_icon = '". $f ."' WHERE id = ". $id);
		if ($mysqli->error)
			die($mysqli->error);

		header('location: index.php?pgMode=feeds&upl=1');
		exit;
	} else
		die('Failed to upload file');
}
