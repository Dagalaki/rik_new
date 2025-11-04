<?php
require_once('config.php');

$id = (int)$_POST['id'];

if (!$id)
	return;
$dest = '/var/www/html/skai/img/bg/'. $id;

if (isset($_FILES['img'])) {
	$img = $_FILES['img'];
	if ($img['type'] == 'image/jpeg') {
		$dest .= '.jpg';
	} else
		die('Unexpected file format');

	//echo " from ". $img['tmp_name'] ." to $dest\n";
	if (move_uploaded_file($img['tmp_name'], $dest)) {
		$mysqli->query("UPDATE shows SET bg_icon = 1 WHERE id = ". $id);
		//if ($mysqli->error)
			//die($mysqli->error);

		header('location: index.php?pgMode=feeds&upl=1');
		exit;
	} else
		die('Failed to upload file');
}
