<?php

header('Access-Control-Allow-Origin: *');
//ini_set( 'date.timezone', 'Europe/Athens' );


$logfile=date("Y_m_d")."_query.log";
$query=$_SERVER['QUERY_STRING'];
//error_log(date('d.m.Y H:i:s')."|timediff.php|".$query."\n", 3, $logfile);


$jahr=getvalue('y',2014)."-".(getvalue('m',0)+1)."-".getvalue('d',0);
$zeit=getvalue('h','0').":".getvalue('i','0').":".getvalue('s','0');

$ltime=strtotime($jahr.' '.$zeit);
$utime=getvalue('t',0);

echo (time()-$ltime).":".(time()-$utime);



function getvalue($valname,$valdefault){
	if(isset($_POST[$valname])){
		$v=$_POST[$valname];
	}elseif(isset($_GET[$valname])){
		$v=$_GET[$valname];
	}else{
		$v=$valdefault;
	}
	return $v;
}

?>
