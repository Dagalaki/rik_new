<?php
$path = '/var/www/html/skai/video/';
include('/var/www/html/skai/admin/config.php');
define('RUN_FEED', 1);
$doDelete = true;

$cleanup = false;
if (date('H:i') == '02:00')
	$cleanup = true;

$dbEpisodes = []; $foundEpIds = []; $dbClips=[];$foundClipIds=[];
$activeShows = []; $runFeeds = [];
$videos =[];
$mode = 0; // 1 = run a specific feed
if ($argc > 1) {
	$live=@file_get_contents('https://www.skai.gr/api/hbbtv');
	file_put_contents('/var/www/html/skai/json/live.json', $live);
	exec("nohup php /var/www/html/skai/smarttv/replay.php >/dev/null 2>&1 &");

	if ($argv[1] == 'run')
		$mode = RUN_FEED;
}

if (0 && $cleanup) {
	$mysqli->query("DELETE FROM shows WHERE active = 1");
	$mysqli->query("DELETE FROM episodes");
} else {
	if ($mode == RUN_FEED) {
		$res = $mysqli->query("SELECT id FROM run_feed WHERE done = 0 AND ts <= UNIX_TIMESTAMP()");
		while ($row = $res->fetch_row())
			$runFeeds[] = $row[0];

		if (!count($runFeeds))
			die("Nothing to do\n");
		$doDelete = false;
	}

	$res = $mysqli->query("SELECT id FROM shows WHERE active = 1");
	while ($row = $res->fetch_row())
		$activeShows[] = $row[0];

	$res = $mysqli->query("SELECT id, show_id, media_item_link FROM episodes WHERE show_id IN (". implode(',', $activeShows) .")");
	while ($row = $res->fetch_row()) {
		$k = $row[1].'-'.$row[0];
		$dbEpisodes[] = $k;
		$videos[$k] = $row[2];
	}
	$res = $mysqli->query("SELECT id, show_id, media_item_link FROM clips WHERE show_id IN (". implode(',', $activeShows) .")");
	while ($row = $res->fetch_row()) {
		$k = $row[1].'-'.$row[0];
		$dbClips[] = $k;
		$videos[$k] = $row[2];
	}
}

echo "Got from db episodes: ". count($dbEpisodes) ."\n";

$keys = ['enimerosi','psuchagogia','seires','cinema','athlitika','ntokimanter'];
$upd=0;
if ((int)date('i') == 0 || $mode == RUN_FEED)
	$upd=1;

$neps = 0; $nsh = 0; $youtube=0; $skips=0; $qeps=0;
foreach ($keys as $k=>$key) {

	if ($mode == RUN_FEED) {
		$res = $mysqli->query("SELECT id, title, link FROM shows WHERE cat_id = ". $k ." AND active = 1 AND id IN (". implode(',', $runFeeds) .")");
	} else
		$res = $mysqli->query("SELECT id, title, link FROM shows WHERE cat_id = ". $k ." AND active = 1");

	while ($row = $res->fetch_assoc()) {
		$feed = $row['link'];

		echo $row['title'] .' ---> '. $feed ."\n";

		if ($mode == RUN_FEED)
			$mysqli->query("UPDATE run_feed SET done = 1 WHERE id = ". $row['id']);

		$o = json_decode(file_get_contents($feed));
		if (!isset($o->episodes))
			continue;
		$clips = (1 && $row['id'] == 68373 && isset($o->extraClips) ? $o->extraClips : null);
		$eps = $o->episodes;
		$show = $o->show;

		if (!$eps || !count($eps)){
			continue;
		}
		$s = $eps[0];
		$gotEps = 0;

		$mysqli->query("UPDATE shows SET updated = UNIX_TIMESTAMP(), lastupd = ". strtotime($s->start) ." WHERE id = ". $row['id']);
		if ($mysqli->error)
			die($mysqli->error);

		foreach ($eps as $e) {
			if (preg_match("#youtube#si", $e->media_item_link)) {
				$youtube++;
				continue;
			}

			$str = $show->id.'-'.$e->id;
			$foundEpIds[] = $str;
			$updated = false;
			if ($videos[$str] !== $e->media_item_link)
				$updated = true;
			//if ($show->id == 1000000) $updated = true;//XXX

			if ($upd) {
				$mysqli->query("UPDATE episodes SET media_item_title = '". mysqli_escape_string($mysqli, $e->media_item_title3) ."', media_item_title3 = '". mysqli_escape_string($mysqli, $e->media_item_title3) ."', short_descr = '". mysqli_escape_string($mysqli, $e->short_descr) ."' WHERE id = ". $e->id);
				// save img
				if (1) {
					$ext = pathinfo($e->img, PATHINFO_EXTENSION);
					$fname = $e->id .'.'. $ext;
					$data = file_get_contents(preg_replace("# #si", "%20", $e->img));
					if (!$data)
						die("Failed for ". $e->img ."\n");

					file_put_contents("/var/www/html/skai/img/episodes/". $fname, $data);
					$mysqli->query("UPDATE episodes SET local_img = '". $fname ."?v1' WHERE id = ". $e->id);
				}
				continue;
			}
			if (0 && $e->id == 338982 && $e->subs && preg_match("#\.srt#si", $e->subs)) {
				$fname= '/var/www/html/skai/json/subs/'. $e->id .'.srt';
				if (!file_exists($fname)) {
					echo " > ". $e->subs ."\n";
					file_put_contents($fname, file_get_contents($e->subs));
				}
			}
			if ($updated || !in_array($show->id.'-'.$e->id, $dbEpisodes)) {
				echo 'will check for video url headers '. $e->media_item_link ."\n";
				$headers = get_headers($e->media_item_link);

				if (preg_match("#404#si", $headers[0])) {
					echo("Oups, header is ". $headers[0] .", skipping\n");
					$skips++;
					continue;
				}
				if ($updated)
					echo "episode is updated\n";

				$q = "REPLACE INTO episodes SET ";
				$q .= "id = ". $e->id .", ";
				$q .= "show_id = ". $show->id .", ";
				$q .= "episode_number = ". $e->episode_number .", ";
				$q .= "media_item_link_drm_flag = ". (isset($e->media_item_link_drm_flag) ? $e->media_item_link_drm_flag : 0) .", ";
				$q .= "media_item_link_drm_dash = '". (isset($e->media_item_link_drm_dash) ? $e->media_item_link_drm_dash : '') ."', ";
				$q .= "start = ". strtotime($e->start) .", ";
				$q .= "end = ". strtotime($e->end) .", ";
				$q .= "title = '". mysqli_escape_string($mysqli, $e->title) ."', ";
				$q .= "short_descr = '". mysqli_escape_string($mysqli, $e->short_descr) ."', ";
				$q .= "caption = '". (isset($e->caption) ? mysqli_escape_string($mysqli, $e->caption) :'') ."', ";
				$q .= "img = '". mysqli_escape_string($mysqli, $e->img) ."', ";
				$q .= "media_item_file = '". mysqli_escape_string($mysqli, $e->media_item_file) ."', ";
				$q .= "media_item_title = '". mysqli_escape_string($mysqli, $e->media_item_title3) ."', ";
				$q .= "media_item_title3 = '". mysqli_escape_string($mysqli, $e->media_item_title3) ."', ";
				$q .= "media_item_link = '". mysqli_escape_string($mysqli, $e->media_item_link) ."', ";
				$q .= "media_type_id = ". $e->media_type_id .", ";
				$q .= "link = '". (isset($e->link) ? mysqli_escape_string($mysqli, $e->link) :'') ."'";

				$mysqli->query($q);
				$neps++;
				if ($mysqli->error) {
					echo "[$q\n";
					echo $mysqli->error;
					exit;
				}

				// save img
				//$fname = basename($e->img);
				$ext = pathinfo($e->img, PATHINFO_EXTENSION);
				$fname = $e->id .'.'. $ext;
				$data = file_get_contents(preg_replace("# #si", "%20", $e->img));
				if (!$data)
					die("Failed for ". $e->img ."\n");

				file_put_contents("/var/www/html/skai/img/episodes/". $fname, $data);
				$mysqli->query("UPDATE episodes SET local_img = '". $fname ."' WHERE id = ". $e->id);
				$gotEps++;
				//echo "run auto thumb...\n";
				//echo file_get_contents('https://speech3.anixa.tv/autoThumbnail?sd=skai&url='.$e->media_item_link)."\n";
			}
		}
		if ($clips && count($clips)) {
			foreach ($clips as $clipa) {
				echo count($clipa->items)." clips - ". $clipa->title ."\n";
				foreach ($clipa->items as $e) {
					$str = $show->id.'-'.$e->id;
					echo "[$str]\n";
					$foundClipIds[] = $str;
					$updated = false;
					if (isset($videos[$str]) && $videos[$str] !== $e->media_item_link)
						$updated = true;

					if ($updated || !in_array($show->id.'-'.$e->id, $dbClips)) {
					/*
					echo 'will check for video url headers '. $e->media_item_link ."\n";
					$headers = get_headers($e->media_item_link);

					if (preg_match("#404#si", $headers[0])) {
						echo("Oups, header is ". $headers[0] .", skipping\n");
						$skips++;
						continue;
					}
					 */
						if ($updated)
							echo "episode is updated\n";

						$q = "REPLACE INTO clips SET ";
						$q .= "id = ". $e->id .", ";
						$q .= "show_id = ". $show->id .", ";
						$q .= "title = '". mysqli_escape_string($mysqli, $e->title) ."', ";
						$q .= "media_item_title = '". mysqli_escape_string($mysqli, $e->title) ."', ";
						$q .= "cat = '". mysqli_escape_string($mysqli, $e->cctitle) ."', ";
						$q .= "img = '". mysqli_escape_string($mysqli, $e->img) ."', ";
						$q .= "media_item_link = '". mysqli_escape_string($mysqli, $e->media_item_link) ."'";
						//$q .= "media_item_link = 'http://skaitvhybrid1.skai.gr/GrCyTargeting/Gr/Galliko/lion-sentetien20241110.mp4'";

						$mysqli->query($q);
						$qeps++;
						if ($mysqli->error) {
							echo "[$q\n";
							echo $mysqli->error;
							exit;
						}

						// save img
						//$fname = basename($e->img);
						$ext = pathinfo($e->img, PATHINFO_EXTENSION);
						$fname = $e->id .'.'. $ext;
						$data = file_get_contents(preg_replace("# #si", "%20", $e->img));
						if (!$data)
							die("Failed for ". $e->img ."\n");

						file_put_contents("/var/www/html/skai/img/clips/". $fname, $data);
						$mysqli->query("UPDATE clips SET local_img = '". $fname ."' WHERE id = ". $e->id ." AND show_id = ". $show->id);
						$gotEps++;
						//echo "run auto thumb...\n";
						//echo file_get_contents('https://speech3.anixa.tv/autoThumbnail?sd=skai&url='.$e->media_item_link)."\n";
					} else if ($upd) {
						$mysqli->query("UPDATE clips SET media_item_title = '". mysqli_escape_string($mysqli, $e->title) ."' WHERE id = ". $e->id);
						// save img
						if (1) {
							$ext = pathinfo($e->img, PATHINFO_EXTENSION);
							$fname = $e->id .'.'. $ext;
							$data = file_get_contents(preg_replace("# #si", "%20", $e->img));
							if (!$data)
								die("Failed for ". $e->img ."\n");

							file_put_contents("/var/www/html/skai/img/clips/". $fname, $data);
							$mysqli->query("UPDATE clips SET local_img = '". $fname ."' WHERE id = ". $e->id ." AND show_id = ". $show->id);
						}
					}
				}
			}
		}
	}
}
if ($upd)exit;
if (count($foundEpIds) != count($dbEpisodes) && $doDelete) {
	echo 'json: '. count($foundEpIds).', DB: '. count($dbEpisodes)."\n";
	echo " ---- episodes ids not present in JSON\n";
	$diff = array_diff($dbEpisodes, $foundEpIds);
	print_r($diff);

	foreach ($diff as $d) {
		list($showId, $epId) = explode('-', $d);
		echo("DELETE FROM episodes WHERE show_id = $showId AND id = $epId\n");
		$mysqli->query("DELETE FROM episodes WHERE show_id = $showId AND id = $epId");
	}
}
if (count($foundClipIds) != count($dbClips) && $doDelete) {
	echo 'json: '. count($foundClipIds).', DB: '. count($dbClips)."\n";
	echo " ---- episodes ids not present in JSON\n";
	$diff = array_diff($dbClips, $foundClipIds);
	print_r($diff);

	foreach ($diff as $d) {
		list($showId, $epId) = explode('-', $d);
		echo("DELETE FROM clips WHERE show_id = $showId AND id = $epId\n");
		$mysqli->query("DELETE FROM clips WHERE show_id = $showId AND id = $epId");
	}
}
echo " ----- new shows: ". $nsh ." in db\n";
echo " ----- new episodes: ". $neps ." in db\n";
echo " ----- new clips: ". $qeps ." in db\n";
echo " ----- youtube found: ". $youtube ." in db\n";
echo " ----- skipped: ". $skips ." in db\n";
