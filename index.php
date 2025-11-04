<?php
include_once("videoplayer/helper.php");

//header('Content-Type: application/vnd.hbbtv.xhtml+xml; charset=utf-8');

$ip    = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']:"127.0.0.1";
$toto=array(1,3,5,7,9);
$lastnr=substr($ip,-1);
$server=in_array($lastnr, $toto) ? "195.226.218.164":"195.226.218.160"; 
$menu = isset($_GET['menu']) ? $_GET["menu"] : "sidebar";
$stream = isset($_GET['stream']) ? $_GET["stream"] : "";
$hbbplayer = isset($_GET['hbbplayer']) ? $_GET["hbbplayer"] : "";
$today=Date("Y-m-d");
//if($today >='2020-03-10' && $today<='2020-04-11') $action="bigbrother";
$action = isset($_GET['action']) ? $_GET["action"] : "";

//Integration of reference player 
$mode= isset($_GET["mode"]) ? $_GET["mode"] : "";
$drm= isset($_GET["drm"]) ? $_GET["drm"] : "";
$profile = getApplicationProfile();
if( $profile['supported'] == false ){
		header( "Location: unsupported.html" );
		die();
}
if (isset($action) && $action == '4k')
	$mode = 'ref';
$mode = 'ref';
//header( "Content-Type: ". $profile['contentType'] .";charset=utf-8" );	
header('Access-Control-Allow-Origin: *');
date_default_timezone_set('Europe/Athens');

$hbbtvVer = '1.1.1';
if (isset($_SERVER['HTTP_USER_AGENT'])) {
	if (preg_match("#hbbtv\/(\d\.\d\.\d)#si", $_SERVER['HTTP_USER_AGENT'], $ret))
		$hbbtvVer = $ret[1];
}
$sender = isset($_GET['s']) ? $_GET['s'] : 'riksd';

$smarttv_id=0;
 $smart_co      = "set_".$sender;
 $sety          = isset($_COOKIE[$smart_co]) ? $_COOKIE[$smart_co]: '';
 $res           = explode(".", $sety);
 $smarttv_id    = intval(isset( $res[0] ) ? $res[0] : 0);


/*echo "\n<!DOCTYPE html PUBLIC \"-//HbbTV//" . $hbbtvVer . "//EN\" \"http://www.hbbtv.org/dtd/HbbTV-" . $hbbtvVer . ".dtd\">\n";
*/
// XML Header to start document
	$val = $profile['xmlHeader'];
	if($val!="") echo $val ."\n";

	// <!DOCTYPE>
	echo $profile['doctype'] ."\n";


?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
	<meta http-equiv="Content-Type" content="application/vnd.hbbtv.xhtml+xml; utf-8" />
	<title>RIK HbbTV</title>
<script type="text/javascript">
	
	/***
		Settings
	***/
	var profile = { hbbtv : "<?php echo $profile['hbbtv']; ?>", video : "<?php echo $profile['video']; ?>", version : "<?php echo $profile['version']; ?>"};
		
	</script>
	<script type="text/javascript">
                var ui='<?php echo isset($_GET['ui'])?$_GET['ui']:1;?>', aktueller_sender='<?php echo($sender);?>',smarttv_id=<?php echo($smarttv_id);?>,piwikTracker=0,action='<?php echo($action);?>'; function getWinOwnerAppId(){};

		//<![CDATA[
		window.onload = function() {
			GLOBALS.HbbPlayer = "<?php echo ($hbbplayer); ?>";
			GLOBALS.menu = "<?php echo ($menu); ?>";
			GLOBALS.stream = "<?php echo ($stream); ?>";
			GLOBALS.action = "<?php echo ($action); ?>";
			GLOBALS.channelId = "<?php echo ($sender); ?>";
		GLOBALS.streamserver='<?php echo($server);?>'; 
			initApp();
		};
		window.piwikAsyncInit = function () {
			piwikTracker = Piwik.getTracker("http://rikad.smart-tv-data.com/pi/teletext-hbbtv.1.2.php", 2);
		}
		//]]>
	</script>
	<script>var ON_Channel="<?php echo($sender);?>";</script>
	<script type="text/javascript" src="js/jquery-1.11.3.min.js?r=<?php echo rand();?>"></script>
	<script type="text/javascript" src="js/common.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/preroll.js?r=<?php echo(rand()); ?>"></script>

	<script type="text/javascript" src="js/rik.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/user.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/search.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/keycodes.js"></script>
	<script type="text/javascript" src="js/controlsRik.js?r=<?php echo(rand()); ?>"></script>
	<script type="text/javascript" src="js/messenger.js"></script>
	<script type="text/javascript" src="http://rikad.smart-tv-data.com/pi/piwik.js"></script>

	<?php 
	//Ref.player 3
	if($mode == "ref"){
		if($drm == "enabled"){?>
			<script>
				GLOBALS.useDrm = true;
			</script>
		<?php }

		?>
		<script>
			
		GLOBALS.useRef = true;

		</script>
		<script type="text/javascript" src="videoplayer/videoplayer_basic.js?r=<?php echo rand();?>"></script>
		<script type="text/javascript" src="videoplayer/helper.js?r=<?php echo rand();?>"></script>
		<script type="text/javascript" src="videoplayer/subtitles.js?r=<?php echo rand();?>"></script>
		<script type="text/javascript" src="videoplayer/monitor/monitor-base.js?r=<?php echo rand();?>"></script>
		<script type="text/javascript" src="videoplayer/dialog.js?r=<?php echo rand();?>"></script>
	<?php 
		$profileResources = $profile['version'];
		include_once("videoplayer/resources.php"); 
	} ?>
<link rel="stylesheet" href="videoplayer/dialog.css?r=<?php echo rand();?>" />
<link rel="stylesheet" href="videoplayer/vplayer.css?r=<?php echo rand();?>" />
	<link rel="stylesheet" href="css/base.css?r=<?php echo(rand()); ?>" />
	<link rel="stylesheet" href="css/rik.css?r=<?php echo(rand()); ?>" />
	<link rel="stylesheet" href="720p.css" />
</head>

<body>
	<!--img src="http://rikad.smart-tv-data.com/pi/teletext.php?idsite=2&amp;rec=1&amp;action_name=Start_APP" width="0" height="0" alt=""/-->

	<div id="hiddenList" style="visibility:hidden"></div>
	<div id="tvbild" class="tvbild">

		<object id="mybroadcast" type="video/broadcast"></object>

	</div>
	<div id="broadcast_ad" style="visibility:hidden"></div>
	<div id="ondev">ON DEV</div>
	<div id="subs-container" class="subs-container fullscreen" style="display:none;"><span></span></div>
	<div id="log-message" style="display:block;z-index:100"></div>

	<div id="player-bg-container" style="display:none; z-index:100; background-color:black!important">
		<div id="wait2" style="position: absolute; top: 40%; left: 45%; display: block; z-index: 101;">
			<div class="loader"></div>
			<p id="mediaload" style="position:relative; font-size:25px; color:#eeeeee; text-align:center">Loading ...</p>
		</div>

	</div>
	<div id="player-container" style="display:none"></div>
	<div id="videotimer2" class="full-videotimer" style="display:none">
		<div id="player_control2">
			<img src="img/buttons/Control_0_Btn.png" alt="" />
			<img src="img/buttons/Control_Play_Btn.png" alt="" />
			<img src="img/buttons/Control_2_Btn.png" alt="" />
			<img src="img/buttons/Control_3_Btn.png" alt="" />
			<img src="img/buttons/Control_4_Btn.png" alt="" />
		</div>
		<div id="timeline2" class="full-timeline">
			<div id="duration"></div>
		</div>
		<div id="time2">00:00:00 / 00:00:00</div>
	</div>
	<div id="stop-img" style="display:none"></div>
	<div id="privacy-text" style="display:none">
		<p>Η πολιτική ιδιωτικότητας είναι σύμφωνη με τη Νομοθεσία της Ε.Ε. και του ελληνικού κράτους.</p>
	</div>
	<object id="appmgr" type="application/oipfApplicationManager" style="position: absolute; left: 0px; top: 0px; width: 1px; height: 1px"></object>
	<object id="oipfcfg" type="application/oipfConfiguration" style="position: absolute; left: 0px; top: 0px; width: 1px; height: 1px"></object>
	<div id="videodiv"></div>
	<div id="popup" class="hidden"></div>
	<div id="bbstate" class=""></div>
	<div id="lbanner" class="lbanner"></div>
	<div id="appscreen" style="left: 0px; top: 0px; width: 1280px; height: 720px; visibility: inherit; display: block;">

		<div id="radiostream" style="display:none;visibility:hidden;z-index:0;width:345px;height:194px">
			<object id="myradio" type="audio/mpeg"></object>
		</div>
	</div>
</body>

</html>
