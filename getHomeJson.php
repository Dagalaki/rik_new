<?php
$json= null;
if(isset($_GET['cat'])){
	if($_GET['cat'] == 'live'){
		$json = file_get_contents('./rikliveJson.json');
	}else{

		$json = file_get_contents('http://rik.smart-tv-data.com/json/new/'.$_GET['cat'].'.json');
	}
}else{
	$json = file_get_contents('http://rik.smart-tv-data.com/json/new/home.json');
}


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
//echo json_encode($json);
echo $json;
?>