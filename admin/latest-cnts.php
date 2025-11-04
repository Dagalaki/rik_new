<?php
$out=[];
echo json_encode($out);
return;
// load nginx's log the last N lines and find some counts for latest visits
define('LINES', 8000);
$deb = 0;
$a = []; $b = []; $checka = []; $checkb = []; $ips = [];
$ips2 = []; $ips3 = []; $ipsm1 = []; $ipsm2 = []; $ipsm3 = [];
$ts = time()-11;
$ts2 = time()-21;
$ts3a = time()-22;
$ts3b = time()-32;

$mints = time()-61;
$mints2 = time()-121;
$mints3a = time()-122;
$mints3b = time()-182;


function tail($filename, $lines = 10, $buffer = 4096) {
    // Open the file
    $f = fopen($filename, "rb");

    // Jump to last character
    fseek($f, -1, SEEK_END);

    // Read it and adjust line number if necessary
    // (Otherwise the result would be wrong if file doesn't end with a blank line)
    if(fread($f, 1) != "\n") $lines -= 1;

    // Start reading
    $output = '';
    $chunk = '';

    // While we would like more
    while(ftell($f) > 0 && $lines >= 0) {
        // Figure out how far back we should jump
        $seek = min(ftell($f), $buffer);

        // Do the jump (backwards, relative to where we are)
        fseek($f, -$seek, SEEK_CUR);

        // Read a chunk and prepend it to our output
        $output = ($chunk = fread($f, $seek)).$output;

        // Jump back to where we started reading
        fseek($f, -mb_strlen($chunk, '8bit'), SEEK_CUR);

        // Decrease our line counter
        $lines -= substr_count($chunk, "\n");
    }

    // While we have too many lines
    // (Because of buffer size we might have read too many)
    while($lines++ < 0) {
        // Find first newline and remove all text before that
        $output = substr($output, strpos($output, "\n") + 1);
    }

    // Close file and return
    fclose($f);
    return $output;
}
$lines = array_reverse(explode("\n", tail('/var/log/nginx/access.log', LINES)));
if ($deb) {
	echo "got ", count($lines). " lines\n";
	echo "cnt from ". date('r', time()). "\n";
	//echo "from ". date('r', $mints3a). " to ". date('r', $mints3b). "\n";
}

$cnt2 = $cnt3 = 0; $ccnt= 0;
$mincnt = $mincnt2 = 0; $mincnt3 = 0;
$maxTs = 0; $minTs = time();
foreach ($lines as $s) {
	$m = explode('@', $s);
	if ($m && count($m) > 1) {
		if (strpos($m[2], 'GET /save.php') === false)
			continue;

		$ip = ip2long($m[0]);

		$vts = strtotime($m[1]);
		$maxTs = max($maxTs, $vts);
		$minTs = min($minTs, $vts);
		if ($deb && 1) {
			echo "ip $ip date ". date('r', $vts). "\n";
			if (in_array($ip, $ips))
				echo "found\n";
		}

		if ($vts >= $ts && !in_array($ip, $ips)) {
			$ips[] = $ip;
			$a[] = $ip;
		}

		if ($vts >= $ts2 && $vts <= $ts && !in_array($ip, $ips2)) {
			$cnt2++;
			$checka[] = $ip;
			$ips2[] = $ip;
		}

		if ($vts >= $ts3b && $vts <= $ts3a && !in_array($ip, $ips3)) {
			$cnt3++;
			$checkb[] = $ip;
			$ips3[] = $ip;
		}

		if ($vts >= $mints && !in_array($ip, $ipsm1)) {
			$mincnt++;
			$ipsm1[] = $ip;
		}

		if ($vts >= $mints2 && $vts <= $mints && !in_array($ip, $ipsm2)) {
			$mincnt2++;
			$ipsm2[] = $ip;
		}

		if ($vts >= $mints3b && $vts <= $mints3a && !in_array($ip, $ipsm3)) {
			$mincnt3++;
			$ipsm3[] = $ip;
		}
	}
}
if (count($a))
	$b = array_intersect($a, $checka);

if (count($b)) {
	$tmp = array_intersect($b, $checkb);
	$ccnt = count($tmp);
}

$out["cnt2"] = $cnt2;
$out["cnt3"] = $cnt3;
$out["c_cnt"] = $ccnt;

$out["mincnt"] = $mincnt;
$out["mincnt2"] = $mincnt2;
$out["mincnt3"] = $mincnt3;

$out["cnt"] = count($a);
$out["b_cnt"] = count($b);
$out["ts"] = $ts;
$out["ts2"] = $ts2;
$out["ts3"] = $ts3b+1;

if ($deb) {
	echo "max ". date('r', $maxTs). " min ". date('r', $minTs). "\n";
	print_r($out);
	exit;
}

echo json_encode($out);
?>
