

var prerollVideo = function(serie){
	if (0) {
	var spot = 'http://mega.smart-tv-data.com/21.mp4';
				debug('Got ad, loading video '+spot);
				GLOBALS.videoplayer.ad = true;
				GLOBALS.videoplayer.setSource(spot);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);
	return;
	}
	serie=serie==null ? '':serie;
	var url="/get.php/sd/"+ON_Channel+"/tg/media/ty/pre/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
	if (GLOBALS.dev)
		url="http://skai.smart-tv-data.com/get.php/sd/"+ON_Channel+"/tg/media/ty/pre/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
	debug('Load ad '+ url);
	var preq=new XMLHttpRequest();
	preq.open("GET",url,true);
	preq.onreadystatechange=function(){
		if(preq.readyState==4 && preq.status==200){
			var p=preq.responseText;
			var ar=p.split('#');

			if ((ar.length>2 && ar[2].match(/http/i)) || (1&&GLOBALS.dev) ){
				var spot=(1&&GLOBALS.dev ? 'http://mega.smart-tv-data.com/21.mp4':ar[2]);
				debug('Got ad, loading video '+spot);
				console.log('Got ad, loading video '+spot);

				if(GLOBALS.useRef && GLOBALS.vplayer.profile.version=='oipf'){
					var ad = {};
					ad.title = 'Ad';
					ad.url = spot;
					ad.drm = false;
					ad.la_url = null;

					prepareVideoStart(ad);
					GLOBALS.vplayer.startVideo(false);
				} else {
					GLOBALS.videoplayer.ad = true;
					GLOBALS.videoplayer.setSource(spot);
					GLOBALS.videoplayer.start();
					GLOBALS.focusmgr.focusObject("videoplayer", true);
				}

				if (!GLOBALS.dev)
					for(var i=3;i < ar.length;i++){
						var xLog=new Image;
						xLog.src=ar[i];
					}
			} else {
				debug('Got ad result, no ad');
				if(GLOBALS.useRef && GLOBALS.vplayer.profile.version=='oipf'){
					GLOBALS.vplayer.onAdBreak=false;
					debug('set todo');
					prepareVideoStart(GLOBALS.vplayer.todo);
					var live = false;
					if (GLOBALS.vplayer.todo.url.indexOf('.2ts') > 0)
						live = true;
					setTimeout(function() {
						GLOBALS.vplayer.startVideo(live);
					}, 800); // give some time for subtitles to load
				} else {
					GLOBALS.videoplayer.ad = false;
					GLOBALS.videoplayer.setSource(GLOBALS.videoplayer.todo);
					GLOBALS.videoplayer.start();
					GLOBALS.focusmgr.focusObject("videoplayer", true);
				}
			}
		} else if (preq.status==404) {
			if(GLOBALS.useRef && GLOBALS.vplayer.profile.version=='oipf'){
				GLOBALS.vplayer.onAdBreak=false;
				prepareVideoStart(GLOBALS.vplayer.todo);
				var live = false;
				if (GLOBALS.vplayer.todo.url.indexOf('.2ts') > 0)
					live = true;
				setTimeout(function() {
					GLOBALS.vplayer.startVideo(live);
				}, 800); // give some time for subtitles to load
			} else {
				debug('Error on ad response');
				GLOBALS.videoplayer.ad = false;
				GLOBALS.videoplayer.setSource(GLOBALS.videoplayer.todo);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			}
		}
	}
	preq.send();
}


var middlerollVideo = function(serie){
	if (!GLOBALS.useRef) {
		var vid = document.getElementById("video"), mtime;

		if (GLOBALS.brtyp)
			GLOBALS.videoplayer.middleRollTime = Math.floor(vid.playPosition/1000);
		else
			GLOBALS.videoplayer.middleRollTime = vid.currentTime;
	}
	serie=serie==null ? '':serie;
	var url="/get.php/sd/"+ON_Channel+"/tg/media/ty/mid/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
	if (GLOBALS.dev)
		url="http://skai.smart-tv-data.com/get.php/sd/"+ON_Channel+"/tg/media/ty/mid/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
	debug('call middleRoll');
	var preq=new XMLHttpRequest();
	preq.open("GET",url,true);
	debug('open');
	preq.send();
	debug('send');
	preq.onerror=function(e){
		debug('onerror');
		debug(JSON.stringify(e));
	};

	preq.onreadystatechange=function(){
		debug('state '+ preq.readyState);
		if(preq.readyState==4 && preq.status==200) {
			var p=preq.responseText;
			var ar=p.split('#');

			if((ar.length>2 && ar[2].match(/http/i)) || (0&&GLOBALS.dev && GLOBALS.adsCnt < 3)){
				var spot=(1&&GLOBALS.dev ? 'http://megatv-ctv.com/21.mp4':ar[2]);

				debug('spot '+ spot);
				if(GLOBALS.useRef) {
					var ad = {};
					ad.title = 'Ad';
					ad.url = spot;
					ad.drm = false;
					ad.la_url = null;
					GLOBALS.vplayer.onAdBreak = true;
					GLOBALS.vplayer.middleRollTime = Math.floor(GLOBALS.vplayer.video.playPosition/1000);
					console.log('mtime '+ GLOBALS.vplayer.middleRollTime);
					debug("Starting AD now : "+spot);
					prepareVideoStart(ad);
					GLOBALS.vplayer.startVideo(false);
				} else {
					GLOBALS.videoplayer.ad = true;
					GLOBALS.videoplayer.setSource(spot);
					GLOBALS.videoplayer.start();
					GLOBALS.focusmgr.focusObject("videoplayer", true);
				}

				for(var i=3;i < ar.length;i++){
					var xLog=new Image;
					xLog.src=ar[i];
				}
			} else {
				debug('Got ad result, no ad');
				if(GLOBALS.useRef && GLOBALS.vplayer.profile.version=='oipf'){
					GLOBALS.vplayer.onAdBreak=false;
				} else {
					GLOBALS.videoplayer.ad = false;
					GLOBALS.videoplayer.setSource(GLOBALS.videoplayer.todo);
					GLOBALS.videoplayer.start();
					GLOBALS.focusmgr.focusObject("videoplayer", true);
				}
			}
		} else if (preq.status==404) {
			if(GLOBALS.useRef && GLOBALS.vplayer.profile.version=='oipf'){
				GLOBALS.vplayer.onAdBreak=false;
			} else {
				debug('Error on ad response');
				GLOBALS.videoplayer.ad = false;
				GLOBALS.videoplayer.setSource(GLOBALS.videoplayer.todo);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			}
		}
	};
}
var lbanner = function(serie){
	if (GLOBALS.adLoop)
		return;
	if (!GLOBALS.vplayer || !GLOBALS.vplayer.isPlaying()) {
		debug('no lbanner');
		return;
	}
	serie=serie==null ? '':serie;
	var url="http://skai.smart-tv-data.com/get.php/sd/"+ON_Channel+"/tg/media/ty/banner/sm/"+smarttv_id+"/area/"+ encodeURIComponent(serie);
	debug('adcall lbanner');
	debug(url);
	var preq=new XMLHttpRequest();
	preq.open("GET",url,true);
	preq.onreadystatechange=function(){
		if (preq.readyState==4 && preq.status==200) {
			var p=preq.responseText;
			var ar=p.split('#');
			console.log(p);
			
			if((ar.length && ar[0].match(/http/i)) || (1&&GLOBALS.dev)){
				var banner= (1&&GLOBALS.dev ? 'img/lb.png' : ar[0]);
				setLbanner(banner);

				if (!GLOBALS.dev)
				for (var i=3;i < ar.length;i++){
					var xLog=new Image;
					xLog.src=ar[i];
				}
			}

		}
	};
	preq.send();
}
function setLbanner(banner) {
	var ldiv = document.getElementsByClassName('lbanner')[0];
	var img = document.createElement("img");
	var cont = document.getElementById("videodiv");
	debug('show lbanner');

	img.id = 'lbanner-img';
	img.src = banner;
	ldiv.appendChild(img);

	//cont.removeClass('fullHD');
	cont.addClass('cont-lbanner');
	ldiv.style.visibility = 'visible';

	setTimeout(function () {
		var ldiv = document.getElementsByClassName('lbanner')[0];
		var cont = document.getElementById("videodiv");
		var img = document.getElementById("lbanner-img");

		debug('hide lbanner');
		cont.removeClass('cont-lbanner');
		//cont.addClass('fullHD');

		if (img)
			img.parentNode.removeChild(img);
		ldiv.style.visibility = 'hidden';
	}, 15*1000);
}
var postrollVideo = function(serie, cat, ep) {
	var vid = document.getElementById("video");
	serie=serie==null ? '':serie;
	debug('call postrollVideo');
	var url="http://skai.smart-tv-data.com/get.php/sd/"+ON_Channel+"/tg/media/ty/post/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
	var preq=new XMLHttpRequest();
	preq.open("GET",url,true);
	preq.onreadystatechange=function(){
		if(preq.readyState==4 && preq.status==200 && GLOBALS.videoplayer){
			var p=preq.responseText;
			var ar=p.split('#');
			
			if((ar.length && ar[0].match(/http/i)) || (1&&GLOBALS.dev)){
				var spot=(1&&GLOBALS.dev ? 'http://megatv-ctv.com/21.mp4':ar[2]);
				GLOBALS.videoplayer.ad = true;

				debug('spot '+ spot);
				GLOBALS.videoplayer.setSource(spot);
				GLOBALS.videoplayer.start();
				GLOBALS.focusmgr.focusObject("videoplayer", true);

				for(var i=3;i < ar.length;i++){
					var xLog=new Image;
					xLog.src=ar[i];
				}
			} else {
				var v = GLOBALS.videoplayer;
				GLOBALS.videoplayer.ad = false;
				try {
					vid.stop(0);
				} catch (e) {}
				try {
					vid.pause();
				} catch (e) {}

				v.isStopped = true;
				v.isPlaying = false;
				v.elem.style.display = "block";

				v.focusedId = 1;
				v.setFocused();

				if(!GLOBALS.focusmgr.getObject("show-detail") && !GLOBALS.focusmgr.getObject("live")){
					var o = GLOBALS.focusmgr.getObject("golden")
					if(o){
						o.setSponsoredVideo();
					}
				}

				if (v.oncase == ON_VOD) {
					v.close();
					GLOBALS.scenemgr.closeVideoPlayer();
				}
			}

		}
	};
	preq.send();
}
