<?php

function getApplicationProfile(){		
	$profiles = json_decode( file_get_contents( "videoplayer/profiles.json" ), true );

	$userAgent = $_SERVER['HTTP_USER_AGENT'];
	$mode = null;

	$hbbtvRe = '/HbbTV\/\d\.(?P<version>\d)\.\d/';
	$matches = null;
	preg_match( $hbbtvRe, $userAgent, $matches );

	$profile = null;

	if( $matches == null ){
		$profile = $profiles['EME'];
	}
	else if( (int)$matches['version'] == 2 ){
		$profile = $profiles['HbbTV1.5'];
	}
	else if( (int)$matches['version'] >= 3 ){ // 1.4.1 is hbbtv 2.0.1 / 1.3.1 = 2.0.0 and newer versions are all accepted HbbTV2.0 profile
		$profile = $profiles['HbbTV2.0'];
	}
	else if( (int)$matches['version'] == 1 ){
		$profile = $profiles['HbbTV1.0'];

	}
	else{
		$profile = $profiles['unknown'];

	}
	if (preg_match("#LGE; OLED#si", $userAgent) || preg_match("#Vestel#si", $userAgent))
		$profile = $profiles['HbbTV1.5']; //oipf


	$profile['userAgent'] = $userAgent;
	return $profile;
}



?>
