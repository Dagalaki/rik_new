<?php 

header("Access-Control-Allow-Origin: *");
header('Content-type: application/json');

ini_set("display_errors",1);
ini_set("display_startup_errors",1);
error_reporting(E_ALL);

//require_once 'vendor/autoload.php';

function clean_phone_number($phone_no){
    return substr( preg_replace('/^\+?1|\|1|\D/', '', $phone_no), -10);
}
function curlPOST($url, $args){
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($args));
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	//curl_setopt($ch, CURLOPT_HEADER, 1); 
	//curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0); 
	//curl_setopt($ch, CURLOPT_TIMEOUT, 10000); //timeout in seconds

	/*curl_setopt($ch,CURLOPT_HTTPHEADER,array (
		"Content-Type: application/json"
	));*/

	$result = curl_exec($ch);

	if (curl_errno($ch)) {
		if($_SERVER["HTTP_HOST"] == "127.0.0.1")	
		echo  'Error:' . curl_error($ch);
	}
	curl_close($ch);
	
	return $result;
}

if(isset($_GET["action"]) && $_GET["action"] == "GetDeviceIp"){
	if(isset($_SERVER['HTTP_X_FORWARDED_FOR']) && $_SERVER['HTTP_X_FORWARDED_FOR']){
		$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	}else if(isset($_SERVER['REMOTE_ADDR'])){
		$ip = isset($_SERVER["REMOTE_ADDR"]) ? $_SERVER["REMOTE_ADDR"] : '127.0.0.1';
	}
	if(isset($ip)){
		echo json_encode($ip);
	}
	exit();
}
$base_url = "https://ms-skai.smart-tv-data.com/";
$db_actions = array("GetCurrentUser","GetConversations","GetUserById","GetSettings","GetUserByNumber",'GetNewMessages','GetPinCode');

if(isset($_GET["new_action"]) && in_array($_GET["new_action"], $db_actions)) {

	switch ($_GET["new_action"]){
		case 'GetCurrentUser':
			$post = ['ip' =>$_GET['deviceIp']];
			$url = $base_url.'getHbbTVData/UserByIp';
			print_r(curlPOST($url, $post));
			exit();
			break;
		case 'GetConversations':
			$post = ['uid' =>$_GET['uid']];
			$url = $base_url.'getHbbTVData/Conversations';
			$result = json_decode(curlPOST($url, $post));
			$convArray = [];
			$convs = [];
			if(isset($_GET['last_check'])){
				$ts = $_GET['last_check'];
			}
			foreach($result as $row => $val){
				$convs[$row] = (array)$val;
				$convs[$row]['_id'];
				$key = strval($convs[$row]['_id']);
				if(isset($_GET['last_check'])){
					$url1 = $base_url.'getHbbTVData/NewMessages';
					$arg = ['convId'=>$convs[$row]['_id'], 'last_check'=>$ts];
				}else{
					$url1 = $base_url.'getHbbTVData/ConversationMessages';
					$arg = ['convId'=>$convs[$row]['_id']];
				}
				//echo $url1;
				$res = curlPOST($url1,$arg);
				
				$convArray[$key][0] = json_decode($res);
				//print_r($convArray);
				if(sizeof((array)$convArray[$key][0]) > 0){
					$size = sizeof((array)$convArray[$key][0])-1;
					$arr = (array)$convArray[$key][0][$size];
					$created = strtotime($arr['createdAt']);
					//echo $created."----";
					$convArray[$key][1] = (int)strval($created);
					$convArray[$key][2] = $arr['convId'];
				}	
				//$convArray[$key][1] = (int)strval($convArray[$key][0][sizeof((array)$convArray[$key][0])-1]['createdAt'])/1000;
			}

			if(sizeof((array)$convArray[$key][0]) > 0 && isset($convArray[$key][1])){
				usort($convArray, function ($a, $b) {
					if(!isset($b[1]) || !isset($a[1])) {
						return 0;
					}
					return $b[1] - $a[1];
				});

				$users = [];
				foreach($convArray as $key => $conv){
					if(!isset($conv[0]) || !isset($conv[0][0])) continue;
					$cArr = (array)$conv[0][0];
				//echo '$cArr[from]: '.$cArr['from'].'----';
					if($cArr['from'] == $_GET['uid']){
						$other_user_id = $cArr['to'];
					}else{
						$other_user_id = $cArr['from'];
					}

					$res2 = (array)json_decode(curlPOST($base_url."getHbbTVData/UserById",['uid'=>$other_user_id]));


					if(isset($res2)){
						if(!isset($res2['online_offline_status'])) {
							$stat = 0;
						}else{
							$stat = $res2['online_offline_status'];
						}
						$users[] = array('_id'=>strval($res2['_id']), 'Name'=>$res2['Name'],'online_offline_status'=>$stat,'profilepic'=>isset($res2['ProfilePic'])?$res2['ProfilePic']:"");
					}
				}
			}
			$obj = [];
			$obj['conversations'] = array_values(array_filter($convArray));
			if(isset($users))
				$obj['users'] = $users;
			echo json_encode($obj);
			exit();

			break;
		case 'GetUserByNumber':
			$number = clean_phone_number($_GET["no"]);
			$post = ['number' =>$number];
			$url = $base_url.'getHbbTVData/UserByPhoneNumber';
			//echo $url;
			$result = json_decode(curlPOST($url, $post));
			echo json_encode($result);
			break;
		case 'GetPinCode':
			$msisdn = $_GET["msisdn"];
			$code = $_GET["code"];
			$post = ['msisdn' => $msisdn, 'code'=>$code];
			$url = $base_url.'getHbbTVData/SendPinCode';

			$result = json_decode(curlPOST($url, $post));
			echo json_encode($result);
			break;
		case 'GetNewMessages':
			$post = ['uid' =>$_GET['uid']];
			$url = $base_url.'getHbbTVData/Conversations';
			//$post = ['convId' =>$_GET['convId'], 'last_check' => $_GET['last_check']];
			$url = $base_url.'getHbbTVData/NewMessages';
			$result = json_decode(curlPOST($url, $post));
			$convArray = []; $users = []; $convs = [];

			if ($result) {
				print_r($result);exit;
				foreach($result as $row => $val){
					$convs[$row] = (array)$val;
					$convs[$row]['_id'];
					$key = strval($convs[$row]['_id']);
					$url1 = $base_url.'getHbbTVData/ConversationMessages';
					$arg = ['convId'=>$convs[$row]['_id']];
					$res = curlPOST($url1,$arg);

					$convArray[$key][0] = json_decode($res);
					$size = sizeof((array)$convArray[$key][0])-1;
					$arr = (array)$convArray[$key][0][$size];
					$created = strtotime($arr['createdAt']);
					//echo $created."----";
					$convArray[$key][1] = (int)strval($created);	
					//$convArray[$key][1] = (int)strval($convArray[$key][0][sizeof((array)$convArray[$key][0])-1]['createdAt'])/1000;
				}
				usort($convArray, function ($a, $b) {
					return $b[1] - $a[1];
				});
				foreach($convArray as $key => $conv){
					$cArr = (array)$conv[0][0];
					//echo '$cArr[from]: '.$cArr['from'].'----';
					if($cArr['from'] == $_GET['uid']){
						$other_user_id = $cArr['to'];
					}else{
						$other_user_id = $cArr['from'];
					}

					$res2 = (array)json_decode(curlPOST($base_url."getHbbTVData/UserById",['uid'=>$other_user_id]));


					if(isset($res2)){
						$users[] = array('_id'=>strval($res2['_id']), 'Name'=>$res2['Name'],'online_offline_status'=>$res2['online_offline_status'],'profilepic'=>isset($res2['ProfilePic'])?$res2['ProfilePic']:"");
					}
				}
			}
			$obj = [];
			$obj['conversations'] = $convArray;
			$obj['users'] = $users;
			echo json_encode($obj);
			exit();

			break;
	}

}
if(isset($_GET["action"]) && in_array($_GET["action"], $db_actions)) {
	$mongo = new MongoDB\Client("mongodb://ms-skai.smart-tv-data.com:27017/");
	$db = $mongo->waanixetv;

	switch ($_GET["action"]) {
		case 'GetCurrentUser':
			/*'deviceIp'*/
			$users = $db->user;
			$result = $users->find(['last_known_ip'=>$_GET['deviceIp']],['_id'=>1, 'Name'=>1, 'online_offline_status'=>1, 'ProfilePic'=>1])->toArray();
			//$test = $users->find();
			//print_r($test);
			$user = [];
			if(isset($result[0])){
				$user['id'] = strval($result[0]['_id']);
				$user['name'] = $result[0]['Name'];
				$user['status'] = $result[0]['online_offline_status'];
				$user['profilepic'] = isset($result[0]['ProfilePic'])?$result[0]['ProfilePic']:"";
				$user['msisdn'] = $result[0]['msisdn'];
				$user['code'] = $result[0]['Code'];
			}
			echo json_encode($user);
			exit();
			break;
		case 'GetConversations':
			/*'uid'*/
			$messages = $db->message;
			$usersdb = $db->user;
			$conversations = $messages->aggregate(array(array('$match'=> array('$or'=>array( array("from"=>new MongoDB\BSON\ObjectId($_GET['uid'])),array("to"=>new MongoDB\BSON\ObjectId($_GET['uid']))))),array('$group'=>array('_id'=>'$convId'))))->toArray();
			$convArray = [];
			$convs = [];
			foreach($conversations as $row => $val){
				$convs[$row] = $val;
				$convs[$row]['_id'];
				$key = strval($convs[$row]['_id']);
				$convArray[$key][0] = $messages->find(["convId"=> new MongoDB\BSON\ObjectId(strval($convs[$row]['_id']))])->toArray();
				$convArray[$key][1] = (int)strval($convArray[$key][0][sizeof($convArray[$key][0])-1]['createdAt'])/1000;
			}
			usort($convArray, function ($a, $b) {
				return $b[1] - $a[1];
			});
			$users = [];
			foreach($convArray as $key => $conv){
				
				if($conv[0][0]['from']==new MongoDB\BSON\ObjectId($_GET['uid'])){
					$other_user_id = $conv[0][0]['to'];
				}else{
					$other_user_id = $conv[0][0]['from'];
				}
				
				$result = $usersdb->find(["_id"=>new MongoDB\BSON\ObjectId(strval($other_user_id))],['_id'=>1, 'Name'=>1, 'online_offline_status'=>1, 'ProfilePic'=>1])->toArray();
				if(isset($result[0])){
					$users[] = array('id'=>strval($result[0]['_id']),'name'=>$result[0]['Name'],'status'=>$result[0]['online_offline_status'],'profilepic'=>isset($result[0]['ProfilePic'])?$result[0]['ProfilePic']:"");					
				}
			}
			$obj = [];
			$obj['conversations'] = $convArray;
			$obj['users'] = $users;
			echo json_encode($obj);
			exit();
			break;

		case 'GetUserById':
			/*'uid'*/
			$users = $db->user;
			$result = $users->find(["_id"=>new MongoDB\BSON\ObjectId(strval($_GET['uid']))],['_id'=>1, 'Name'=>1, 'online_offline_status'=>1, 'ProfilePic'=>1])->toArray();
			$user = [];
			if(isset($result[0])){
				$user['id'] = strval($result[0]['_id']);
				$user['name'] = $result[0]['Name'];
				$user['status'] = $result[0]['online_offline_status'];
				$user['profilepic'] = isset($result[0]['ProfilePic'])?$result[0]['ProfilePic']:"";
			}
			echo json_encode($user);
			exit();
			break;
		case 'GetSettings':
			$settings = $db->settings;
			$res = $settings->find(["alias"=>"general"])->toArray();
			echo json_encode($res);
			break;
		default:
			// code...
			break;
	}



}
exit();
?>
