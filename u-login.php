<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$out = [];
//$out['user_id'] =1222; $out['success'] =true; echo json_encode($out);exit;

$servername = "127.0.0.1";
$username = "stats";
$password = "dklfgR.h542";
$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8");
mysqli_select_db($conn, "skai");

$action = (isset($_GET['action']) ? $_GET['action'] : $actions[0]);
$out = [];

$out['success'] = true;
if ($action == 'signup') {
	$email = (isset($_GET['email']) ? $_GET['email'] : '');
	$smid = (isset($_GET['smid']) ? $_GET['smid'] : 0);
	$email = mysqli_real_escape_string($conn, $email);
	$title = mysqli_real_escape_string($conn, $title);
	if (!strlen($email)) {
		$out['success'] = false;
	} else {
		$q = "INSERT IGNORE INTO login SET email = '". $email ."', smid = ". $smid .", ts = UNIX_TIMESTAMP(), valid=0";
		$res = $conn->query($q);
		errcheck(); $userId=0;

		$res = $conn->query("SELECT id FROM login WHERE email = '$email'");
		if ($row = $res->fetch_row())
			$userId=$row[0];
		while (true) {
			$code = rand(100000, 999999);
			$res = $conn->query("SELECT id FROM otp WHERE code = $code");

			if (!$res->num_rows) {
				$q = "INSERT INTO otp SET user_id = '". $userId ."', ts = UNIX_TIMESTAMP(), code=$code";
				$res = $conn->query($q);
				errcheck();

				$body = file_get_contents('img/email.html');
				$body = str_replace('CODE', $code, $body);

				$header  = "MIME-Version: 1.0\r\n" 	  
					."Content-Type: text/html; format=fixed; charset=\"utf-8\"\r\nContent-Transfer-Encoding: 8bit\r\n" ;	
				$header .= "X-Mailer: PHP ". phpversion()."\r\n"."From: SKAITV <noreply@skai.smart-tv-data.com>\r\n";

				$_SENDEREMAIL = "noreply@skai.smart-tv-data.com";
				$out['success'] = mail($email, 'SKAI - HYBRID', $body,  $header, '-f'.$_SENDEREMAIL);
				break;
			}
			$out['code'] = $code;
		}
	}
} else if ($action == 'auth') {
	$email = (isset($_GET['email']) ? $_GET['email'] : '');
	$code = (isset($_GET['code']) ? $_GET['code'] : '');
	$email = mysqli_real_escape_string($conn, $email);
	$code = mysqli_real_escape_string($conn, $code);

	$res = $conn->query("SELECT id FROM login WHERE email = '$email'");
	if ($row = $res->fetch_row()) {
		$userId=$row[0];
		$code=(int)$code;

		$res = $conn->query("SELECT ts FROM otp WHERE user_id = $userId AND code=$code");
		errcheck();
		if ($res->num_rows) {
			$q = "UPDATE login SET valid = 1 WHERE id = ". $userId;
			$res = $conn->query($q);
			errcheck();
			$out['user_id'] = $userId;
		} else {
			$out['success'] = false;
			$out['desc'] = 'User not found';
		}
	} else {
		$out['success'] = false;
		$out['desc'] = 'User not found';
	}
}

echo json_encode($out);
function errcheck() {
	global $response, $conn;
	if ($conn->error) {
		$out['error'] = 'SQL error: '. $conn->error;
		echo json_encode($out);
		exit;
	}
}
