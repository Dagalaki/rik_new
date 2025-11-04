<?php
define('DEB', false);
define('DESCR', false);
define('DB', true);
$path = '/var/www/html/skai_new/json/';
$text = mb_strtolower($_GET['keyword']);
//print_r($_GET); echo $text; exit;
if (DB)
	include('/var/www/html/skai/admin/config.php');

$origLen = mb_strlen($text);
if (!DB) {
	$grFix = ['α','η','ο','ε','ω','ι','υ'];
	$grFixRep = ['[άα]','[ήη]','[όο]','[έε]','[ωώ]','[ιί]','[υύ]'];
	$text = trim(preg_quote($text, '#'));
	$origLen = mb_strlen($text);
	$text = str_replace($grFix, $grFixRep, $text);
}

$ret = [];
if (mb_strlen($text) > 0 && $origLen > 0) {
	if (DEB)
		echo "SEarchng [$text] in ". count($feed->elems) ." elems\n";

	if (DB) {
		$show2ind = []; $add = '';
		if (DESCR)
			$add = " OR descr LIKE '%". mysqli_escape_string($mysqli, $text) ."%'";

		if (DEB) echo("SELECT * FROM shows WHERE title LIKE '%". mysqli_escape_string($mysqli, $text) ."%' LIMIT 10\n");
		$res = $mysqli->query("SELECT * FROM shows WHERE active=1 AND title LIKE '%". mysqli_escape_string($mysqli, $text) ."%' ". $add ." LIMIT 10");
		while ($row = $res->fetch_assoc()) {
			// link show id to ret index
			$show2ind[$row['id']] = count($ret);
			$ret[] = $row;
		}

		if (DESCR)
			$add = " OR short_descr LIKE '%". mysqli_escape_string($mysqli, $text) ."%'";

		if (DEB) echo("SELECT * FROM episodes WHERE title LIKE '%". mysqli_escape_string($mysqli, $text) ."%' ". $add ." LIMIT 10\n");
		$res = $mysqli->query("SELECT * FROM episodes WHERE title LIKE '%". mysqli_escape_string($mysqli, $text) ."%' ". $add ." LIMIT 10");
		while ($row = $res->fetch_assoc()) {
			// is there a show already?
			if (isset($show2ind[$row['show_id']])) {
				$ind = $show2ind[$row['show_id']];

				if (!isset($ret[$ind]['episodes']))
					$ret[$ind]['episodes'] = [];
				$ret[$ind]['episodes'][] = $row;
			} else {
				// new show, get it
				$res2 = $mysqli->query("SELECT * FROM shows WHERE id = ". $row['show_id']);
				if ($sh = $res2->fetch_assoc()) {
					$sh['episodes'] = [];
					$sh['episodes'][] = $row;
					$ret[] = $sh;
				}
			}
		}
	} else {
		if (DEB)
			$feed = json_decode(file_get_contents('all.json'));
		else
			$feed = json_decode(file_get_contents($path.'all.json'));

		foreach ($feed->elems as $j=>$elem) {
			foreach ($elem->shows as $k=>$show) {
				if (DEB)
					echo "looping in ". mb_strtolower($show->show) .", in ". count($show->episodes) ." episodes\n";

				$epRet = [];
				foreach ($show->episodes as $ep) {
					if (DEB && $j == 0 && $k == 0) {
						echo $text;
						echo '- '.mb_ereg($text, mb_strtolower($ep->title));
						echo '- '.mb_ereg($text, mb_strtolower($ep->descr));
						exit;
					}

					//if (preg_match("#". $text .'#si', mb_strtolower($ep->title)) || preg_match("#". $text .'#si', mb_strtolower($ep->descr))) {
					if (mb_ereg($text, mb_strtolower($ep->title)) || mb_ereg($text, mb_strtolower($ep->short_descr))) {
						$epRet[] = $ep;
					}
				}

				if (DEB && $j == 0 && $k == 0) {
					echo $text;
					echo '- '.mb_ereg($text, mb_strtolower($show->show));
					echo '- '.mb_ereg($text, mb_strtolower($show->descr));
					echo '- '.count($epRet);
					exit;
				}

				//if (preg_match("#". $text .'#si', mb_strtolower($show->show)) || preg_match("#". $text .'#si', mb_strtolower($show->descr)) || count($epRet)) {
				if (mb_ereg($text, mb_strtolower($show->show)) || mb_ereg($text, mb_strtolower($show->descr)) || count($epRet)) {
					unset($show->episodes);

					if (count($epRet))
						$show->episodes = array_slice($epRet, 0, 10);
					$ret[] = $show;
				}
			}
		}
	}

	if (DEB) {
		print_r($ret);
		exit;
	}
}
$o = [];
$o['elems'] = $ret;
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode($o);
