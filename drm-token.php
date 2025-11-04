<?php
$response=[];
$smil = (isset($_GET['smil']) ? $_GET['smil'] : '');

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if (!strlen($smil)) {
	$response['success'] = false;
	$response['error'] = 'No smil found';
	echo json_encode($response);
	exit;
}

function buildSecureLink($baseUrl, $smil, $ttl, $secret) {
	$expires = time() + $ttl;
	$md5 = md5("$smil". " && " ."$expires" . " && "."$secret", true);
	$md5 = base64_encode($md5);
	$md5 = strtr($md5, '+/', '-_');
	$md5 = str_replace('=', '', $md5);
	return $baseUrl . 'token=' . $md5 . '&smil='.$smil .'&expires=' . $expires;
}

// example usage
$secret = 'ac0d474360eada1e'; //you can’t change it this is exchanged with the server secret
$baseUrl = 'https://playready.ezdrm.com/cency/preauth.aspx?pX=2B3DA1&';
//$smil = '2153746'; //you take this from your playback link
$ttl = 3600; //no of seconds this link is active
$expires = time() + $ttl;

$response['success'] = true;
$response['url'] = buildSecureLink($baseUrl, $smil, $ttl, $secret);
echo json_encode($response);
