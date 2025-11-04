<?php
require_once('config.php');

$id = (int)$_GET['id'];
$s = $_GET['s'];

$set = preg_match("#inactive#si", $s);

if (!$id)
	die('0');
if (!$set) {
	$res = $mysqli->query("SELECT id FROM categories WHERE show_id = ". $id);
	if ($res->num_rows)
		die('0');
}
$mysqli->query("UPDATE shows SET active = ". ($set ? 1 : 0) ." WHERE id = ". $id);
echo '1';
