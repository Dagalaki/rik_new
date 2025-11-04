<?php
require_once '/var/www/html/stats-nginx/config.php';
require_once '/var/www/html/stats-nginx/device-detector/autoload.php';
require_once '/var/www/html/stats-nginx/spyc/Spyc.php';
require '/var/www/html/stats-nginx/GeoIP2-php/geoip2.phar';
use DeviceDetector\DeviceDetector;
use DeviceDetector\Parser\Device\DeviceParserAbstract;
use GeoIp2\Database\Reader;

$reader = new Reader('/var/www/html/stats-nginx/GeoIP2-php/maxmind-db/GeoLite2-City.mmdb');

/*
$s = '156.67.141.174 - - [15/Jun/2019:10:08:11 +0200] "GET /matomo.php?ping=1&idsite=1&rec=1&r=929409&h=10&m=8&s=9&url=http%3A%2F%2F46.137.186.97%2Fpub%2Fanixehd%2Fticker%2Findex.html%3Fr%3D130&_id=0a0eb2e9175a04ab&_idts=1560585939&_idvc=1&_idn=0&_refts=0&_viewts=1560585939&send_image=1&java=1&cookie=1&res=1280x720&gt_ms=212&pv_id=4fglKu HTTP/1.1" 200 54 "http://46.137.186.97/pub/anixehd/ticker/index.html?r=130" "HbbTV/1.1.1 (;Samsung;SmartTV2015;T-HKMFDEUC-1530.1;;) WebKit"';
$s = '217.238.162.116 - - [15/Jun/2019:10:08:18 +0200] "GET /matomo.php?ping=1&idsite=1&rec=1&r=510850&h=10&m=8&s=16&url=http%3A%2F%2F46.137.186.97%2Fpub%2Fanixehd%2Fticker%2Findex.html%3Fr%3D130&_id=59ab2f4f2aed1e64&_idts=1560507222&_idvc=4&_idn=0&_refts=0&_viewts=1560585916&send_image=1&java=1&cookie=1&res=1280x720&pv_id=O2GnIs HTTP/1.1" 200 54 "http://46.137.186.97/pub/anixehd/ticker/index.html?r=130" "HbbTV/1.2.1 (;Panasonic;VIERA 2013;3.885;2101-0003 0008-0000;)"';
$s = '91.50.224.88 - - [15/Jun/2019:10:08:18 +0200] "GET /matomo.php?ping=1&idsite=1&rec=1&r=536365&h=10&m=8&s=16&url=http%3A%2F%2F46.137.186.97%2Fpub%2Fanixehd%2Fticker%2Findex.html%3Fr%3D130&_id=364d6b933577f964&_idts=1560578138&_idvc=1&_idn=0&_refts=0&_viewts=1560578138&send_image=1&pdf=0&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=1920x1080&gt_ms=629&pv_id=p3SgQm HTTP/1.1" 200 54 "http://46.137.186.97/pub/anixehd/ticker/index.html?r=130" "HbbTV/1.2.1 (+DRM;Samsung;SmartTV2018;T-KTM2DEUC-1251.0;KantM2;) Tizen/4.0 (+TVPLUS+SmartHubLink+360avc) Chrome/56 VID/1"';
$i = 0;

if (preg_match("#([\d\.]*) - - \[(.*?)\] \"GET \/matomo\.php(.*?)\" \d* \d* \"(.*?)\" \"(.*?)\"#si", $s, $m)) {
	print_r($m);
	$vars = explode('&', $m[3]);
	$brand = ''; $model = ''; $os = ''; $os_version = '';

	$ip = $m[1];
	$agent = $m[5];
	$ts = strtotime($m[2]);
	$id = $vars[9];
	$res = $vars[17];

	//echo "agent ". $agent ."\n";

	$dd = new DeviceDetector($agent);
	$dd->parse();
	$brand = $dd->getBrandName();
	$model = $dd->getModel();
	$device = $dd->getDeviceName();
	$os = $dd->getOs();
	$client = $dd->getClient();

	$ipr = $reader->city($ip);

	print_r($device);
	print_r($client);

	echo "ip ". $ip ." date ". date('r', $ts). " brand ". $brand ." model ". $model ." os ". $os['name'] ." os ver ". $os['version'] ." device ". $device ." client ". $client ."\n";
	echo "country ". $ipr->country->name ." city ". $ipr->city->name ." region ". $ipr->mostSpecificSubdivision->name ."\n";
	$i++;

	//print_r($vars);
} else
	echo "failed\n";
exit;
 */

//$fh = fopen('/var/log/nginx/access.log', 'r');

echo "About to open nginx log, size: ". filesize('/var/log/nginx/access.log.1') ."\n";
$fh = fopen('/var/log/nginx/access.log.1', 'r');
//$fh = fopen('/var/log/nginx/access.log', 'r');

$i = 0;
while (($s = fgets($fh, 4096)) !== false) {
	//149.233.170.222@19/Jun/2019:13:40:06 +0200@"GET /save.php?ping=1&idsite=1&rec=1&r=326307&h=13&m=40&s=4&url=http%3A%2F%2F46.137.186.97%2Fpub%2Fanixehd%2Fticker%2Findex.html%3Fr%3D130&_id=7da0fa194685a0c0&_idts=1560446389&_idvc=2&_idn=0&_refts=0&_viewts=1560943022&send_image=1&java=1&cookie=1&res=1920x1080&gt_ms=74&pv_id=JooTjH HTTP/1.1"@200@HbbTV/1.1.1 (;Samsung;SmartTV2015;T-HKMDEUC-1530.1;;) WebKit

	if ($i % 1000 == 0)
		echo "$i $s\n";
	$m = explode('@', $s);
	if (count($m)) {
		if (strpos($m[2], 'GET /save.php') === false)
			continue;
		$vars = explode('&', $m[2]);

		$ip = $m[0];
		$agent = $m[4];
		$ts = strtotime($m[1]);

		// from vars get piwik id and resolution
		foreach ($vars as $v) {
			$e = explode('=', $v);

			if ($e[0] == '_id')
				$id = $e[1];

			if ($e[0] == 'res') {
				$res = $e[1];
				break;
			}
		}

		if (!$id) {
			echo "id not found:\n". $m[2];
			print_r($vars);
			continue;
		}

		$dd = new DeviceDetector($agent);
		$dd->parse();
		$brand = $dd->getBrandName();
		$model = $dd->getModel();
		$device = $dd->getDeviceName();
		$os = $dd->getOs();
		$client = $dd->getClient();

		$ipr = $reader->city($ip);

		//echo "ip ". $ip ." date ". date('r', $ts). " country ". $ipr->country->isoCode ." city ". $ipr->city->name ." brand ". $brand ." model ". $model ."\n";
		$a['ip'] 	= $ip;
		$a['lon'] 	= $ipr->location->longitude;
		$a['lat'] 	= $ipr->location->latitude;
		$a['country'] 	= $ipr->country->name;
		$a['city'] 	= $ipr->city->name;
		if ($res)
			$a['res'] 	= $res;
		if ($client) {
			$a['br'] 	= $client['name'];
			if ($client['version'])
				$a['br_v'] 	= $client['version'];
			if ($client['engine'])
				$a['br_e'] 	= $client['engine'];
		}
		$a['brand'] 	= $brand;
		$a['model'] 	= $model;
		$a['device'] 	= $device;
		if ($os) {
			$a['os'] 	= $os['name'];
			if ($os['version'])
				$a['os_v'] 	= $os['version'];
		}
		$json = json_encode($a);
		//echo strlen($json);

		if (strlen($json) > 512)
			die('json failed');
		//print_r($a);
		//echo("INSERT INTO hits SET pid = '". $id ."', ts = ". $ts .", info = '". $mysqli->real_escape_string($json) ."', ip = ". ip2long($ip) ."\n");
		//if ($ip == "139.91.252.65") {
		if (1) {
			$mysqli->query("INSERT INTO hits SET pid = '". $id ."', ts = ". $ts .", info = '". $mysqli->real_escape_string($json) ."', ip = ". ip2long($ip));

			if ($mysqli->error) {
				echo "Error: ". $mysqli->error."\n";
				exit;
			}
		}

		$i++;

		//print_r($vars);
	} else
		echo "failed\n";
}
fclose($fh);
echo "total ". $i."\n";
?>
