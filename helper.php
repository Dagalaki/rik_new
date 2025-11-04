<?php
$myfile = fopen("debug.txt", "a") or die("Unable to open file!");
$txt = $_GET["msg"]."\n";
fwrite($myfile, $txt);
fclose($myfile);
?>