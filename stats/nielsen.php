<?php
$ms = [];
$json = file_get_contents("/var/www/html/json/nilsen.json");
$data = json_decode($json, TRUE);
//echo "<pre>";
//print_r($data);
//echo "</pre>";

$cnts = [];
if (preg_match("#(\d{1,2}\/\d{1,2}\/\d{4})#si", $data[0][0], $m)) {
	$grdt = str_replace('/','-', $m[1]);
	$dt = date('Y-m-d', strtotime($grdt));
} else die('preg failed');
$hbbtv = [];

$fileCnt = '/var/www/html/json/nielsen/nilsen-cnts-'. $dt .'.json';
if (file_exists($fileCnt)) {
	$cnts = json_decode(file_get_contents($fileCnt), true);
}
$str = "<br/><br/><h2 class='bigger'>Ημερήσιο τηλεβαρόμετρο - Top 10<h2>";
$str .= "<h2>".$data[0][0]."</h2>";
$str .= '<table class="table" width="100%" cellspacing="0"><thead> <tr>';
for($i=0 ;$i<=9; $i++){
	$str .= '<th scope="col">'.$data[1][$i].'</th>';
}
//if (count($cnts)) $str .= '<th scope="col">HbbTV (000)</th>';

$str .= '</tr></thead><tbody>';

for($i=2; $i<=11; $i++){
	$str.= "<tr>";
	for($j=0; $j<=9; $j++){
		if ($j == 1) {
			$r = [];
			$r['title'] = $data[$i][$j];
			$r['ch'] = $data[$i][$j+2];
			if (count($cnts))
				$r['cnt'] = $cnts[$i];
			$hbbtv[] = $r;
		}
		$str .= "<td>".$data[$i][$j]."</td>";
	}
	//if (count($cnts)) $str .= '<td>'. number_format($cnts[$i]/1000) .'</td>';
	$str .= "</tr>";
}

$str .= "</tbody></tbable>";
$str .= "<div style=\"clear:left;\">";
for($i=12 ; $i<= 18; $i++){
	$str .= "<b style='margin:5px;'>".$data[$i][0]."</b></br>";
}
$str .= "</div>";


usort($hbbtv, 'sortbycnt');

$str .= '<table class="table" width="100%" cellspacing="0">';
$str .= '<tbody>';
foreach ($hbbtv as $k=>$r) {
	$str.= '<tr>';
	$str.= '<td>'. ($k+1) .'</td>';
	$str.= '<td>'. $r['title'] .'</td>';
	$str.= '<td>'. $r['ch'] .'</td>';
	$str.= '<td>'. number_format($r['cnt'], 0, ',','.') .'</td>';
	$str.= '</tr>';
}
$str .= "</tbody></tbable>";
$str .= '<hr><br/><br/><h2>HbbTV counts</h2>';


echo $str;

function sortbycnt($a, $b) {
	if ($a['cnt'] == $b['cnt']) {
		return 0;
	}
	return ($a['cnt'] > $b['cnt']) ? -1 : 1;
}
?>
