<?php
//print_r($_SERVER);
$url = "http://skailb.smart-tv-data.com/smarttv/lbanner_js.php/sd/". $_GET['s'] ."/tg/media/area/". urlencode($_GET['serie']);
echo file_get_contents($url);
?>
