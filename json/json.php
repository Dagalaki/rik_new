<?php
include('/var/www/html/skai/admin/config.php');
$cat = 'home-cont';
$json = [];
$id = 0; $dev = 0;
if (isset($_GET['cat']))
	$cat = $_GET['cat'];
else if (isset($_GET['id']))
	$id = (int)$_GET['id'];
if ($_SERVER['HTTP_HOST'] == 'smarttv.anixa.tv' || $_SERVER['HTTP_HOST'] == '127.0.0.1')
	$dev = 1;
else if (preg_match("#smarttv.anixa.tv#si", $_SERVER['HTTP_REFERER']) || preg_match("#127.0.0.1#si", $_SERVER['HTTP_REFERER']))
	$dev = 1;
$addw = 'AND media_item_link_drm_flag = 0';
if ($dev)
	$addw = '';
$thumbs = json_decode(file_get_contents('/var/www/html/skai/json/thumbs.json'), true);

$cats = ['news','shows','series','cinema','sports','ntokimanter',100=>'home'];
$varcats = ['newIds','entIds','serIds','cinemaIds','sportIds','ntokimanterIds', 100=>'homeIds'];
$homeIds = [];
$newIds = [67363, 67362, 67367];
$entIds = [67368, 67374];
$serIds = [67369];
$cinemaIds = [1000000];
$sportIds = [68371, 68372];
$ntokimanterIds = [68395, 68341];
$ctitles=[];
// get ids
foreach ($cats as $k=>$c) {
	$res = $mysqli->query("SELECT ids, title FROM categories WHERE id = ". $k);
	if (!$res->num_rows)
		continue;
	if ($row = $res->fetch_row()) {
		${$varcats[$k]} = explode(',', $row[0]);
		$ctitles[$k] = $row[1];
	}
}

$allIds = array_merge($newIds, $entIds, $serIds, $homeIds);
define('BB', 67280);

if ($cat == 'bigbrother')
	$id = BB;

// get selected shows
$selShows = []; $HOME_SHOW = 67260; $show2cat=[];
$res = $mysqli->query("SELECT id, show_id, ids, title FROM categories");

while ($row = $res->fetch_assoc()) {
	if ($row['id'] == 100) {
		$HOME_SHOW = $row['show_id'];
	} else
		$selShows[$row['id']] = $row['show_id'];
	$a = explode(',', $row['ids']);
	foreach($a as $n)
		$show2cat[$n] = $row['title'];
}

if ($id) {
	$subs=[];
	$dir = '/var/www/html/skai/json/subs';
	$opendir = opendir($dir);
	while (($file = readdir($opendir)) !== false) {
		if($file!="." && $file!=".."){
			$a = explode('.', $file);
			$subs[$a[0]] = str_replace('.srt', '', $a[1]);
		}
	}

		$res = $mysqli->query("SELECT title, img, logo, descr, short_descr, menu_icon, bg_icon, show_logo_hbbtv, show_bg_image_hbbtv, show_mini_img_hbbtv, cat_id FROM shows WHERE id = ". $id);
		if ($row = $res->fetch_assoc()) {
			$row['cat'] = $ctitles[$row['cat_id']];
			$json['show'] = $row;
		}

		if ($row['bg_icon'])
			$json['show']['bg'] = 'http://skai.smart-tv-data.com/img/bg/'. $id .'.jpg';
		$res = $mysqli->query("SELECT id, title, img, short_descr, media_item_title, media_item_title3, media_item_link, start, end, episode_number, local_img, media_item_link_drm_flag, media_item_link_drm_dash FROM episodes WHERE show_id = ". $id ." $addw ORDER BY start DESC ");

		$e = [];
		while ($row = $res->fetch_assoc()) {
			$row['img'] = 'http://skai.smart-tv-data.com/img/episodes/'. $row['local_img'];
			unset($row['local_img']);
			if (isset($show2cat[$id]))
				$row['category'] = $show2cat[$id];
			if (isset($subs[$row['id']]))
				$row['sub'] = '/json/subs/'. $row['id'] .'.srt';

			$a = pathinfo($row['media_item_link']);
			$key = preg_replace("#\.mp4#si", '', $a['filename']);
			if (in_array($key.'.jpg', $thumbs))
				$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';
			$e[] = $row;
		}
		$json['episodes'] = $e;
		if ($id == 68373) { // league
			$res = $mysqli->query("SELECT id, title, img, media_item_title, media_item_link, local_img FROM clips WHERE show_id = ". $id ." ORDER BY id DESC ");
			echo $mysqli->error;

			$e = [];
			while ($row = $res->fetch_assoc()) {
				$row['img'] = 'http://skai.smart-tv-data.com/img/clips/'. $row['local_img'];
				unset($row['local_img']);
				if (isset($show2cat[$id]))
					$row['category'] = $show2cat[$id];
				if (isset($subs[$row['id']]))
					$row['sub'] = '/json/subs/'. $row['id'] .'.srt';

				$a = pathinfo($row['media_item_link']);
				$key = preg_replace("#\.mp4#si", '', $a['filename']);
				if (in_array($key.'.jpg', $thumbs))
					$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';
				$e[] = $row;
			}
			$json['clips'] = $e;
		}
} else {
	if ($cat == 'home-cont') {
		/// my style rocks
		/*
		$res = $mysqli->query("SELECT id, title, img, logo, descr, short_descr, menu_icon, bg_icon FROM shows WHERE id = ". $HOME_SHOW);
		echo $mysqli->error;
		if ($row = $res->fetch_assoc()) {
			if (isset($show2cat[$row['id']]))
				$row['category'] = $show2cat[$row['id']];
			$json['show'] = $row;
		}
		$json['cat'] = $ctitles[100];

		if ($row['bg_icon'])
			$json['show']['bg'] = 'http://skai.smart-tv-data.com/img/bg/'. $HOME_SHOW .'.jpg';

		$res = $mysqli->query("SELECT media_item_link, media_item_title FROM episodes WHERE show_id = ". $HOME_SHOW ." ORDER BY start DESC LIMIT 1");
		if ($row = $res->fetch_assoc())
			$json['show'] = array_merge($json['show'], $row);
		 */
		$actIds = [];
		$res = $mysqli->query("SELECT id FROM shows WHERE active = 1");
		while ($row = $res->fetch_assoc())
			$actIds[] = $row['id'];

		$bg = '/var/www/html/skai/img/home/0.jpg';
		if (file_exists($bg)) {
			$mt = filemtime($bg);
			$json['home-bg'] = 'http://skai.smart-tv-data.com/img/home/0.jpg?'.$mt;
		}

		$res = $mysqli->query("SELECT * FROM catlists WHERE hide=0 AND cat = 'homepage' ORDER BY pos");
		$lists=[];
		while ($row = $res->fetch_assoc()) {
			$list = []; $e=[];
			$list['title'] = $row['title'];
			$list['only_shows'] = $row['only_shows'];
			$list['radio'] = $row['radio'];
			$ids = $row['ids'];

			$sel = json_decode($row['sel_eps'], true);
			if ((int)$list['only_shows']) {
				$q = "SELECT id, title, img, logo, descr, short_descr, subtitle, menu_icon, bg_icon, bg_upd, show_logo_hbbtv, show_bg_image_hbbtv, show_mini_img_hbbtv FROM shows WHERE active=1 AND id IN (". $ids .") ORDER BY FIELD(id, ". $ids .")";
				$rr = $mysqli->query($q);
				if ($mysqli->error) {
					echo $cat;
					print_r($row);
					echo "[$q]";
					echo $mysqli->error;
					exit;
				}
				$s = [];
				while ($row = $rr->fetch_assoc()) {
					if ($row['bg_icon'])
						$row['bg'] = 'http://skai.smart-tv-data.com/img/bg/'. $row['id'] .'.jpg?'. $row['bg_icon'];
					$r2 = $mysqli->query("SELECT media_item_link, media_item_link_drm_flag, media_item_link_drm_dash FROM episodes WHERE show_id = ". $row['id'] ." $addw ORDER BY episode_number DESC LIMIT 1");
					if ($nrow = $r2->fetch_assoc())
						$row = array_merge($row, $nrow);
					if (isset($row['media_item_link'])) {
						$a = pathinfo($row['media_item_link']);
						$key = preg_replace("#\.mp4#si", '', $a['filename']);
						if (in_array($key.'.jpg', $thumbs))
							$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';
					}
					$s[] = $row;
				}

				//$list['q'] = $q;
				$list['shows'] = $s;
			} else {
				$a = explode(',', $row['ids']);
				//print_r($sel); print_r($a);
				foreach ($a as $id) {
					if (!$id) continue;
					$fs = 'episodes.title, episodes.img, episodes.short_descr, media_item_title, media_item_title3, media_item_link, start, end, episode_number, local_img, show_id, shows.title AS show_title, bg_icon, shows.show_bg_image_hbbtv, shows.show_logo_hbbtv, cat_id, media_item_link_drm_flag, media_item_link_drm_dash';
					if ($id == 1000000)
						$fs = 'episodes.title, episodes.img, episodes.short_descr, media_item_title, media_item_title3, media_item_link, start, end, episode_number, local_img, show_id, shows.title AS show_title, bg_icon, episodes.show_bg_image_hbbtv, episodes.show_logo_hbbtv, cat_id, media_item_link_drm_flag, media_item_link_drm_dash';
					$q = "SELECT $fs FROM episodes LEFT JOIN shows ON show_id = shows.id WHERE show_id = ". $id ." $addw ORDER BY start DESC LIMIT ".($id == 1000000 ? 20:1);
					if (isset($sel[$id]) && $sel[$id])
						$q = "SELECT $fs FROM episodes LEFT JOIN shows ON show_id = shows.id WHERE show_id = ". $id ." AND episodes.id = ". $sel[$id] .' '.$addw;
					$rr = $mysqli->query($q);
					if( $mysqli->error) {
						echo $mysqli->error."\n";
						echo $q;
						exit;
					}

					while ($row = $rr->fetch_assoc()) {
						$a = pathinfo($row['media_item_link']);
						$key = preg_replace("#\.mp4#si", '', $a['filename']);
						if (in_array($key.'.jpg', $thumbs))
							$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';

						$row['img'] = 'http://skai.smart-tv-data.com/img/episodes/'. $row['local_img'];
						unset($row['local_img']);
						$row['category'] = $ctitles[$row['cat_id']];
						if ($row['bg_icon'])
							$row['bg'] = 'http://skai.smart-tv-data.com/img/bg/'. $row['show_id'] .'.jpg';
						unset($row['bg_icon']);
						$e[] = $row;
					}
				}
				$list['episodes'] = $e;
			}
			$lists[] = $list;
		}
		// latest episodes. in last week
		/*$foundShowIds = [];
		$res = $mysqli->query("SELECT title, img, short_descr, media_item_title, media_item_link, start, end, episode_number, show_id, local_img FROM episodes WHERE DATE(FROM_UNIXTIME(start)) >= DATE(NOW()) - INTERVAL 7 DAY ORDER BY start DESC");
		echo $mysqli->error;

		while ($row = $res->fetch_assoc()) {
			if (in_array($row['show_id'], $homeIds) || !in_array($row['show_id'], $actIds) || in_array($row['show_id'], $foundShowIds))
				continue;
			$a = pathinfo($row['media_item_link']);
			$key = preg_replace("#\.mp4#si", '', $a['filename']);
			if (in_array($key.'.jpg', $thumbs))
				$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';

			$row['img'] = 'http://skai.smart-tv-data.com/img/episodes/'. $row['local_img'];
			unset($row['local_img']);

			$e[] = $row;
			$foundShowIds[] = $row['show_id'];
		}*/
		$json['lists'] = $lists;
		$json['ref'] = $_SERVER['HTTP_REFERER'];
	} else if ($cat == 'epg') {
		$days = ['ΚΥΡ', 'ΔΕΥ', 'ΤΡΙ', 'ΤΕΤ', 'ΠΕΜ', 'ΠΑΡ', 'ΣΑΒ'];
		$day = date('j')-date('w')+1;
		$ts = mktime(0,0,0,date('n'),$day);

		for ($i = 0; $i < 7; $i++) {
			$end = strtotime(date('Y-m-d 23:59:59', $ts));
			$dt = $days[date('w', $ts)].' '. date('d/m', $ts);
			$ar = [];
			$ar['section'] = 'EPG';
			$ar['date'] = $dt;
			$ar['shows'] = [];

			$res = $mysqli->query("SELECT start AS ts, img, title, short_descr AS descr, rating, duration, yp FROM program WHERE dt BETWEEN ". date('Ymd', $ts) ." AND ". date('Ymd', $end));
			echo $mysqli->error;

			$e = [];
			while ($row = $res->fetch_assoc()) {
				$row['hour'] = date('H:i', $row['ts']);
				$ar['shows'][] = $row;
			}
			$ts += 86400;
			$json[] = $ar;
		}
	} else {
		$catId = array_search($cat, $cats);
		if ($catId === false)
			die('error cat');
		$json['cat'] = $ctitles[$catId];

		$res = $mysqli->query("SELECT * FROM catlists WHERE hide=0 AND cat = '$cat' ORDER BY pos");
		$lists=[];
		while ($row = $res->fetch_assoc()) {
			$list = []; $e=[];
			$list['title'] = $row['title'];
			$list['only_shows'] = $row['only_shows'];
			$list['radio'] = $row['radio'];
			$ids = $row['ids'];

			$sel = json_decode($row['sel_eps'], true);
			if ((int)$list['only_shows']) {
				$q = "SELECT id, title, img, logo, descr, short_descr, subtitle, menu_icon, bg_icon, bg_upd, show_logo_hbbtv, show_bg_image_hbbtv, show_mini_img_hbbtv FROM shows WHERE active=1 AND id IN (". $ids .") ORDER BY FIELD(id, ". $ids .")";
				$rr = $mysqli->query($q);
				if ($mysqli->error) {
					echo $cat;
					print_r($row);
					echo "[$q]";
					echo $mysqli->error;
					exit;
				}
				$s = [];
				while ($row = $rr->fetch_assoc()) {
					if ($row['bg_icon'])
						$row['bg'] = 'http://skai.smart-tv-data.com/img/bg/'. $row['id'] .'.jpg?'. $row['bg_icon'];
					$r2 = $mysqli->query("SELECT media_item_link, media_item_link_drm_flag, media_item_link_drm_dash FROM episodes WHERE show_id = ". $row['id'] ." $addw ORDER BY episode_number DESC LIMIT 1");
					if ($nrow = $r2->fetch_assoc())
						$row = array_merge($row, $nrow);
					if (isset($row['media_item_link'])) {
						$a = pathinfo($row['media_item_link']);
						$key = preg_replace("#\.mp4#si", '', $a['filename']);
						if (in_array($key.'.jpg', $thumbs))
							$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';
					}
					$s[] = $row;
				}

				//$list['q'] = $q;
				$list['shows'] = $s;
			} else {
				$a = explode(',', $row['ids']);
				//print_r($sel); print_r($a);
				foreach ($a as $id) {
					if (!$id) continue;
					$fs = 'episodes.title, episodes.img, episodes.short_descr, media_item_title, media_item_title3, media_item_link, start, end, episode_number, local_img, show_id, shows.title AS show_title, bg_icon, shows.show_bg_image_hbbtv, shows.show_logo_hbbtv, cat_id, media_item_link_drm_flag, media_item_link_drm_dash';
					if ($id == 1000000)
						$fs = 'episodes.title, episodes.img, episodes.short_descr, media_item_title, media_item_title3, media_item_link, start, end, episode_number, local_img, show_id, shows.title AS show_title, bg_icon, episodes.show_bg_image_hbbtv, episodes.show_logo_hbbtv, cat_id, media_item_link_drm_flag, media_item_link_drm_dash';

					$q = "SELECT $fs FROM episodes LEFT JOIN shows ON show_id = shows.id WHERE show_id = ". $id ." $addw  ORDER BY start DESC LIMIT ".($cat == 'cinema'? 20:1);
					if (isset($sel[$id]) && $sel[$id])
						$q = "SELECT $fs FROM episodes LEFT JOIN shows ON show_id = shows.id WHERE show_id = ". $id ." $addw AND episodes.id = ". $sel[$id];
					//echo $q;exit;
					$rr = $mysqli->query($q);
					if( $mysqli->error) {
						echo $mysqli->error."\n";
						echo $q;
						exit;
					}

					while ($row = $rr->fetch_assoc()) {
						$a = pathinfo($row['media_item_link']);
						$key = preg_replace("#\.mp4#si", '', $a['filename']);
						if (in_array($key.'.jpg', $thumbs))
							$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';

						$row['img'] = 'http://skai.smart-tv-data.com/img/episodes/'. $row['local_img'];
						unset($row['local_img']);
						$row['category'] = $ctitles[$row['cat_id']];
						if ($row['bg_icon'])
							$row['bg'] = 'http://skai.smart-tv-data.com/img/bg/'. $row['show_id'] .'.jpg';
						unset($row['bg_icon']);
						$e[] = $row;
					}
				}
				$list['episodes'] = $e;
			}
			$lists[] = $list;
		}
		if ($cat == 'sports') {
			$id = 68373; $cats = ['HIGHLIGHTS','ΑΦΙΕΡΩΜΑΤΑ'];
			foreach ($cats as $cat) {
				$list = []; $e=[];
				$list['title'] = $cat;
				$list['only_shows'] = false;
				$q = "SELECT local_img, clips.title, clips.img, media_item_title, media_item_link, show_id, shows.title AS show_title, bg_icon, show_bg_image_hbbtv, show_logo_hbbtv FROM clips LEFT JOIN shows ON show_id = shows.id WHERE show_id = ". $id ." AND cat = '$cat' ORDER BY clips.id DESC";

				$list['episodes'] = $e;
				$lists[] = $list;
				$rr = $mysqli->query($q);
				if( $mysqli->error) {
					echo $mysqli->error."\n";
					echo $q;
					exit;
				}

				while ($row = $rr->fetch_assoc()) {
					$a = pathinfo($row['media_item_link']);
					$key = preg_replace("#\.mp4#si", '', $a['filename']);
					if (in_array($key.'.jpg', $thumbs))
						$row['thumb'] = 'http://cdn2.smart-tv-data.com/thum/skai/'. $key .'.jpg';

					$row['img'] = 'http://skai.smart-tv-data.com/img/clips/'. $row['local_img'];
					unset($row['local_img']);
					if (isset($show2cat[$row['show_id']]))
						$row['category'] = $show2cat[$row['show_id']];
					if ($row['bg_icon'])
						$row['bg'] = 'http://skai.smart-tv-data.com/img/bg/'. $row['show_id'] .'.jpg';
					unset($row['bg_icon']);
					$e[] = $row;
				}
				$list['episodes'] = $e;
				$lists[] = $list;
			}
		} else if ($cat == 'live') {
			$id = 67507; //XXX BB live
			/*
			$ts = time();
			$schedule = json_decode(file_get_contents('/var/www/html/skai/img/live/schedule.json'), true); // first show live then scheduled
			$list = []; $e=[];
			$list['title'] = 'Live';
			$list['only_shows'] = false;
			$list['radio'] = false;
			foreach ($scheduled as $j=>$sc) {
				if ($sc['start'] <= $ts && $sc['end'] > $ts) {
					$row = [];
					$row['id'] = $j+1;
					$row['title'] = $sc['title'];
					$row['live'] = 1;
					$row['category'] = 'Αθλητικά';
					$row['episode'] = $sc['title'];
					$row['descr'] = $sc['descr'];
					$row['media_item_title'] = $sc['title'];
					$row['show_title'] = $sc['title'];
					$row['img'] = $sc['menu_icon'];
					$row['bg'] = $sc['bg_icon'];
					$row['show_bg_image_hbbtv'] = $sc['bg_icon'];
					$row['ads'] = $sc['ads'];

					$row['media_item_link'] = $sc['stream-url'];
					$row['url'] = $row['media_item_link'];
					$e[]=$row;
				}
			}
			foreach ($scheduled as $sc) {
				if ($sc['start'] > $ts && $sc['end'] > $ts) {
					$row = [];
					$row['id'] = $j+1;
					$row['title'] = $sc['title'];
					$row['scheduled'] = 1;
					$row['category'] = 'Αθλητικά';
					$row['episode'] = $sc['title'];
					$row['descr'] = $sc['descr'];
					$row['media_item_title'] = $sc['title'];
					$row['show_title'] = $sc['title'];
					$row['img'] = $sc['menu_icon'];
					$row['bg'] = $sc['bg_icon'];
					$row['show_bg_image_hbbtv'] = $sc['bg_icon'];
					$row['ads'] = $sc['ads'];
					$e[]=$row;
				}
			}
			$list['episodes'] = $e;
			$lists[] = $list;
			 */

			$list = []; $e=[];
			$list['title'] = 'Radio';
			$list['only_shows'] = false;
			$list['radio'] = true;
		}
		$json['lists'] = $lists;
	}
}
$o = [];
$o['type'] = 'SKAI';
$o['elems'] = $json;
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode($o);
