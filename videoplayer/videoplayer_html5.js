/**
 * HTML5 video player impelmentation for HbbTV 2.0.1 capable devices
 * 
 * @class VideoPlayerHTML5
 * @constructor
 * @uses VideoPlayerBasic
 */
 

function VideoPlayerHTML5(element_id, profile, width, height){
	debug("VideoPlayerHTML5 - Constructor");
	
	// Call super class constructor
	VideoPlayerBasic.call(this, element_id, profile, width, height);
	debug("Initialized " + this.element_id);
}

VideoPlayerHTML5.prototype.loadSubtitles = function (){
	debug("load subtitles "+this.srtFile);
	var self = this, url = "videoplayer/parseSrt.php?srt_file="+escape(this.srtFile);
	if (GLOBALS.dev)
		url = "http://rik.smart-tv-data.com/videoplayer/parseSrt.php?srt_file="+escape(this.srtFile);
	llog("[loadSubtitles] " + url);
	this.req = createHttpRequest(url, function(ret) {
		self.req = null;
		self.createInternalSubtitlesStructure(ret);
		self.bucketId = 0;
		GLOBALS.upperlimit = 0;
	});
}

VideoPlayerHTML5.prototype.enableSubtitles = function( next ) {
	debug("enableSubtitles("+ next +")");
	try{
		if( next ){
			debug("current track: " + this.subtitleTrack  );
			if(!this.subtitleTrack || this.subtitleTrack == undefined || this.subtitleTrack == NaN){
				this.subtitleTrack = 0;
			} else {
				this.subtitleTrack++;
			}			
			debug("switched track: " + this.subtitleTrack  );
		}

				var avSubtitleComponent = this.video.getComponents( 2 );
				if( this.subtitleTrack >= avSubtitleComponent.length){
					this.subtitleTrack = 0;
				}
				debug("Video has " + avSubtitleComponent.length + " subtitle tracks. selected track is: " + this.subtitleTrack );
				for (var i=0; i<avSubtitleComponent.length; i++){
					if ( this.subtitleTrack == i ) {
						showInfo("select subtitleTrack " + i);
						debug("select subtitleTrack " + i);
						this.video.selectComponent(avSubtitleComponent[i]);
						debug("READY");
					} else {
						debug("unselect subtitleTrack " + i);
						this.video.unselectComponent(avSubtitleComponent[i]);
						debug("READY");
					}
				}
				
			
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};

VideoPlayerHTML5.prototype.syncdata = function (ms, bucketId){
	debug("Call syncdata with bucketId : "+ bucketId);
	llog("Call syncdata with bucketId : "+ bucketId);
	if(!this.buckets[bucketId]){
		llog("no data for this bucket id ");
		return;
	}
	var start = new Date().getTime(), t = msToTime(ms), list = this.buckets[bucketId].list;

	document.getElementById("subs-container").style.display = "block";
	document.getElementById("subs-container").innerHTML = "";
	document.getElementById("subs-container").style.visibility = "hidden";
	llog("list length: " + list.length);
	for(var k = GLOBALS.upperLimit ; k < list.length; k++){

		if(timeStringToSeconds(list[k].startTime) <= ms && timeStringToSeconds(list[k].stopTime) > ms){
			llog(list[k].text);
			document.getElementById("subs-container").innerHTML = "<span>"+list[k].text+"</span>";
			document.getElementById("subs-container").style.visibility = "visible";
			GLOBALS.upperLimit = k;
			break;
		}else if(timeStringToSeconds(list[k].stopTime) < ms){
			document.getElementById("subs-container").innerHTML = "";
		}
		if(k == list.length-1) GLOBALS.upperLimit = 0;
	}
}

VideoPlayerHTML5.prototype.changeAVcomponent = function( component ) {
	debug("changeAVcomponent("+ component +")");
	var self = this;
	if(typeof this.subsmenu == "undefined") return ;
	if (component == self.AVCOMPONENTS.SUBTITLE) {
		this.subsmenu.focusedId++;
		if (this.subsmenu.focusedId > this.subtitles.length-1)
			this.subsmenu.focusedId = 0;
		this.subsmenu.handleKeyPress(VK_ENTER);
		return;
	}
	try{
		var track = ( component == self.AVCOMPONENTS.AUDIO? self.audioTrack : self.subtitleTrack );
		debug("current track: " + track  );
		if( track == undefined || track == NaN || track === false ){
			debug("Change to 0"  );
			track = 0;
		}
		track++;
		debug("switched track: " + track );
		
				var avComponent = this.video.getComponents( component );
				if( track >= avComponent.length){
					track = 0;
				}
				
				if( component == self.AVCOMPONENTS.AUDIO ){
					self.audioTrack = track;
					debug("Updated audioTrack value to: " + self.audioTrack);
				}
				else{
					self.subtitleTrack = track;
					debug("Updated subtitleTrack value to: " + self.subtitleTrack);
				}
				
				debug("Video has " + avComponent.length + " "+ ["video","audio","subtitle"][component] +" tracks. selected track is: " + track );
				
				// unselect all
				for (var i=0; i<avComponent.length; i++){
					debug( "track " + i + ": " + avComponent[i].language );
					this.video.unselectComponent(avComponent[i]);
				}
				
				showInfo("select track " + track + "("+avComponent[track].language+")");
				debug("select track " + track);
				this.video.selectComponent(avComponent[track]);
				debug("READY");
				debug( avComponent[track].language, avComponent[track].label || "label undefined" );
				
			
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};


VideoPlayerHTML5.prototype.createInternalSubtitlesStructure = function (ret){
	try{
		this.buckets = JSON.parse(ret);
	}catch(e){}

	if(this.buckets.length > 0) {
		this.bucketId = 0;
		$("#subtitleButton").show();
	}else{
		debug("Subtitles BUCKET EMPTY");
	}
	
	//GLOBALS.focusmgr.focusObject("videoplayer");

}
VideoPlayerHTML5.prototype.setSubtitles = function(subtitles){
var self=this;
	if (!subtitles || !subtitles.length)
		return;
	if(subtitles){
	 $("#extra-btns").append('<div class="piconbg extra-btn" id="extra2"><div class="picon" id="extra-btn2"></div></div>');
		self.extras = 3;
	}
	
	if(typeof Subtitles !== "undefined"){
		this.subsmenu = new Subtitles("subsmenu");
		this.subsmenu.focusedId = -1;
		this.subsmenu.init(this.element, "", "");
		$("#subtitleButtonText").html( "Subtitles: "+subtitles[0].lang);
	}
	self.subsmenu.setFiles(subtitles);

	if (subtitles.length > 0) {
		self.subsmenu.elem.style.display = "block";
		self.srtFile = subtitles[0].file;
		self.loadSubtitles();
	} else {
		self.subsmenu.elem.style.display = "none!important";
		self.subsmenu.enabled = false;
	}
	self.subtitles= subtitles;
};

VideoPlayerHTML5.prototype.createPlayer = function(){
	var self = this;

	if( !$("#player")[0] ){
		$("body").append( '<div id="player" class="hide">'
			+'<div id="playposition"></div>'
			+'<div id="playtime"></div>'
			+'<div id="progress_currentTime" style="left:130px"><img class="thumbnail"/></div>'
            +'<div id="progressbarbg"></div><div id="progressSeekable" style="transition03all"></div><div id="progressbar" style="transition03all"></div>'
			+'<div id="prew"></div>'
			+'<div id="ppauseplay" class="pause"><div class="vcrbtn"></div><span id="pauseplay"></span></div> '
			+'<div id="pff"></div>'
			+'<div id="extra-btns">'
			+'<div class="extra-btn" id="back-btn"><span>Back</span><div class="picon"></div></div>'
			+'<div class="piconbg extra-btn" id="extra3"><div class="picon" id="extra-btn3"></div></div>'
			+'</div>'
			+'<div id="subtitleButton"><div id="subtitleButtonText">Subtitles</div></div>'
			+'<div id="audioButton"><div id="audioButtonText">Audio</div></div>'
			+'<div id="playText"></div>'
			+'</div>');
		debug("Add player component");
	}

	try{
		// removed type attribute
		//this.video = $("<video id='video' type='application/dash+xml' class='fullscreen'></video>")[0];
		this.video = $("<video id='video2' class='fullscreen'></video>")[0];
		this.element.appendChild( this.video );
		debug("html5 video object created");
	} catch( e ){
		debug("Error creating dashjs video object ", e.description );
	}

	var player = this.video; // HTML5 Video element
	//this.createSkip();
	player.addEventListener('loadstart', function() {
		self.state = STATE_BUFFERING;
		self.checkState();
	});
	player.addEventListener('waiting', function() {
		self.state = STATE_BUFFERING;
		self.checkState();
	});
	player.addEventListener('ended', function() {
		self.state = STATE_FINISHED;
		self.checkState();
	});
	addEventListeners( player, 'ended abort', function(e){
		self.stop();
	} );
	
	player.addEventListener('error', function(e){
		self.setLoading(false);
		if( !self.video ){
			return;
		}
		self.state = STATE_ERROR;
		self.checkState();
		
		debug(e.type);		
		try{
			var errorMessage = "undefined";
			switch( self.video.error.code ){
				case 1: /* MEDIA_ERR_ABORTED */ 
					errorMessage = "fetching process aborted by user";
					break;
				case 2: /* MEDIA_ERR_NETWORK */
					errorMessage = "error occurred when downloading";
					break;
				case 3: /* = MEDIA_ERR_DECODE */ 
					errorMessage = "error occurred when decoding";
					break;
				case 4: /* MEDIA_ERR_SRC_NOT_SUPPORTED */ 
					errorMessage = "audio/video not supported";
					break;
			}
			showInfo( "MediaError: " + errorMessage );
			Monitor.videoError( errorMessage );
		} catch(e){
			debug("error reading video error code " + e.description);
		}
	} );
	
	player.addEventListener('play', function(){ 
		//debug("video play event triggered");
	} );
	
	player.seektimer = null;
	player.addEventListener('seeked', function(){
		debug("seeked");
	});	
	
	var canplay = false;
	player.addEventListener('canplay', function(){
		canplay = true;
	} );
	
	player.addEventListener('loadedmetadata', function(){
		//debug("loadedmetadata");
	} );
		
	addEventListeners( player, "loadstart waiting", function(e){ 
		self.setLoading(true);
	} );
	
	addEventListeners( player, 'emptied', function(e){
		self.setLoading(false);		
	} );	
	
	//player.addEventListener('progress', function( e ){
	//	//no-op
	//} );
	
	player.addEventListener('pause', function(){
		debug("pause");
		Monitor.videoPaused(); 
		self.setLoading(false);
		$("#ppauseplay").removeClass("pause").addClass("play");
		self.state = STATE_PAUSE;
		self.checkState();
	} );
	
	if( player.textTracks ){
		player.textTracks.addEventListener('addtrack', function(evt){
			
			// set up inband cue events listeners for new tracks
			var track = evt.track;
			
			// TODO: First check if same language code exist, do not add duplicates. 
			// (may occur if subtitles are served both inband and out-of-band)
			try{
				/*
				$.each( $(player).find("track"), function(olderTrack){
					if( olderTrack.label == track.language ){
						debug("Language " + track.language + " text track already exists. Skip");
						$(player)
						return;
					}
				} );
				*/
				/*
				var found = false;
				$.each( player.textTracks, function(olderTrack){
					if( olderTrack.label == track.language ){
						debug("Language " + track.language + " text track already exists. Skip");
						delete track;
						found = true;
						return false;
					}
				} );
				if(found){
					return;
				}
				*/
			} catch( e ){
				debug( "error checking tracks: " + e.description );
			}
			
			track.onerror = track.onload = function(){
				debug( arguments );
			}
			
			//debug("at addtrack nth track: " + this.length + " : set up cuechange listeners", track);			
			
			// show subtitle button label if there is a track that is not metadata 
			if( track.kind != "metadata" ){
				$("#subtitleButton").show();
			}
			
			/*
			// the first track is set showing
			if( self.subtitleTrack === false ){
				track.mode = "showing";
				self.subtitleTrack = 0;
				debug("set showing track ", track.language, track.label);
				$("#subtitleButtonText").html("Subtitles: " + track.language );
			}
			else{
				track.mode = "hidden";
			}
			*/
			
			track.label = track.language;
			//debug("text track " + track);
			track.oncuechange = function(evt) {				
				if( this.kind == "metadata" ){
					//showInfo("cuechange! kind=" + this.kind);
					try{
						var cuelist = this.activeCues; // TextTrackCueList
						if ( cuelist && cuelist.length > 0) {
							//debug("cue keys: ",  Object.keys( cuelist[0] ) ); 
							var info= "";
							var dur = 0; // seconds
							$.each( cuelist, function(c, cue){								
								// try read text attribute
								if( cue.text ){
									showInfo( cue.text );
								}

								dur=cue.endTime-cue.startTime;
								var cueValue = arrayBufferToString( cue.data );
								debug( "EVENT.START time: " + cue.startTime + ", ends: " + cue.endTime + " cueValue: " + cueValue );
								info +=  "'" + cueValue + "' start: " + cue.startTime + ", ends: " + cue.endTime + "<br/>";
							} );													
							showInfo( info, dur>1?dur:1 ); // show overlay info
						} else {
							showInfo("", -1); // Metadata cue exit
						}
					} catch(e){
						debug("error Reading cues", e.message );
					}					
				}
				else{
					//debug("cue event " + this.kind + " received");
					if( this.activeCues.length ){
						//debug("cue keys " + Object.keys( this.activeCues[0] ) + " received");
					}
				}
			};
			//debug( "oncuechange function set" );
		} );
	}
	
	player.addEventListener('playing', function(){
		debug("playing");
		self.setLoading(false);
		self.state = STATE_PLAYING;
		self.checkState();

		if(!self.onAdBreak){
			//self.skipContainer.style.display = 'none';
			//self.skipTimer2.style.display = 'none';
		}

		if(dialog && dialog.open) {
			player.pause(); // resume_play dialog still open
			return;
		}
		
		if( self.firstPlay ){
			self.firstPlay = false;
			self.displayPlayer( 5 );
			var metadataTracks = [];
			// TODO: Set the first subtitle track active if any exists.
			if( self.video.textTracks && self.video.textTracks.length ){
				var defaultSub = -1;
				$.each( self.video.textTracks, function(i, track){
					if( defaultSub < 0 && track.kind != "metadata" ) {
						track.mode = "showing";
						defaultSub = i;
						$("#subtitleButtonText").html("Subtitles: " + track.language );
					} else if( track.kind != "metadata" ){
						track.mode = "hidden";
					}
					else if( track.kind == "metadata" ){
						metadataTracks.push(i);
					}
				} );
				if( defaultSub >= 0 ){
					debug("Found default subtitle track: " + defaultSub);
					self.subtitleTrack = defaultSub;
					//debug( self.video.textTracks[ defaultSub ] );
				}
				$("#subtitleButton").show();
			}
			else{
				$("#subtitleButton").hide();
			}
			
			if( self.getAudioTracks() ){
				$("#audioButton").show();
			}else{
				$("#audioButton").hide();
			}
			
			// audio tracks
			if( self.video.audioTracks && self.video.audioTracks.length ){
				var defaultAudio = -1;
				$.each( self.video.audioTracks, function(i, track){
					//debug("audiotrack " + i);
					//debug( track );
					if( defaultAudio < 0 && track.kind != "metadata" ) {
						track.mode = "showing";
						defaultAudio = i;
						$("#audioButtonText").html("Audio: " + track.language );
						$("#audioButton").show();
					} else if( track.kind != "metadata" ){
						track.mode = "hidden";
					}
				} );
				if( defaultAudio >= 0 ){
					debug("Found default audio track: " + defaultAudio);
					self.audioTrack = defaultAudio;
					//debug( self.video.audioTracks[ defaultAudio ] );
				}
			}
			
		}
		Monitor.videoPlaying();
		self.setLoading(false);
		$("#ppauseplay").removeClass("play").addClass("pause");		
	} );
	
	
	player.addEventListener('timeupdate', function(){
		self.watched.set( player.currentTime, player.duration, self.videoid );
		if( self.seekTimer == null ){
			self.updateProgressBar();
			self.checkAds();
		}
		if(!self.video) {
			document.getElementById("subs-container").style.visibility = "hidden";
			return;
		}
		var bucketNotFound = true, x = Math.floor(self.video.currentTime * 1000);
		
		if (self.subtitles && self.subtitlesEnabled) {
			document.getElementById("subs-container").style.visibility = "visible";

			if (self.buckets != null) {
				while(bucketNotFound){
					if(self.buckets[self.bucketId] && x > timeStringToSeconds(self.buckets[self.bucketId].to)) {
						self.bucketId++; GLOBALS.upperLimit= 0;
					} else if (self.buckets[self.bucketId] && x < timeStringToSeconds(self.buckets[self.bucketId].from)) {
						self.bucketId--; GLOBALS.upperLimit= 0;
					} else bucketNotFound = false;
				}
				if(self.bucketId < 0 ) self.bucketId = 0;
				if(self.bucketId > self.buckets.length-1) self.bucketId = 0;
				self.syncdata(x, self.bucketId);
			}
		}
	} );
	function roundNearest(positionInSeconds) {
		var roundedPosition = Math.round(positionInSeconds / 10) * 10;
		return roundedPosition;
	}
	player.seek = function( sec, absolute ){
		try{
			var target = ( absolute? sec : player.currentTime + sec);
			
			if( target < 0 )
				target = 0;
			else if( target > player.duration )
				return;
			target = roundNearest(target);
			debug("position: " + player.currentTime + "s. seek "+sec+"s to " + target);
			player.currentTime = target; // set position
		} catch(e){
			debug("error seeking: " + e.description);
		}
	};
	
	return true;
}

VideoPlayerHTML5.prototype.setURL = function(url){
	if (GLOBALS.focusmgr.currentFocus)
		GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
	GLOBALS.focusmgr.focusObject(null);
	url = url.replace("${GUID}", uuidv4());
	debug("setURL("+url+")");	

	var type = "application/dash+xml";
	if( url.match(/mp4$/) ){
		this.video.type = "video/mp4";
	} else if( url.match(/\.2ts$/) ){
		this.video.type = 'video/mpeg';
	} else{
		this.video.type = type;
	}

	try{
		this.url = url;  // see sendLicenseRequest()


		if (!this.ad) {
			var server='195.226.218.165';
			this.url = this.url.replace('cdn5.smart-tv-data.com', server);
		} else  {
			var srv=['195.226.218.10','195.226.218.160','195.226.218.163'];
			var server=srv[ Math.floor(Math.random() * 3) ];

			this.url = this.url.replace('cdn.smart-tv-data.com', server);
		}

		this.video.src = this.url;
	} catch( e ){
		debug( e.message );
	}
	
	// create id for video url
	this.videoid = url.hashCode();
	
	return;
};

VideoPlayerHTML5.prototype.checkAds = function(){
	var self = this, ldiv = document.getElementsByClassName('lbanner')[0];
	if(self.onAdBreak) return;
	if (ldiv.style.visibility == 'visible') return;

	if( self.adBreaks ){
		if( self.video == null ){
			// video has stopped just before new ad checking. exit player
			self.clearVideo();
			return;
		}
		
		var position =  Math.floor( self.video.currentTime );
		$.each( self.adBreaks, function(n, adBreak){
			if( !adBreak.played && adBreak.position == position ){
				$("#player").addClass("hide");
				debug("found ad break at position " + position);
				adBreak.played = true;
				self.getAds( adBreak ); // play ads on current second
				return false;
			}
		} );
	}
};

VideoPlayerHTML5.prototype.prepareAdPlayers = function(){
	// if ad players are prepared do nothing
	if( $("#ad1")[0] && $("#ad2")[0] ){
		debug("ready to play ads");
		return;
	}
	var self = this;
	// create new adPlayers
	self.adPlayer = [ $("<video id='ad1' type='video/mp4' preload='auto'></video>")[0], $("<video id='ad2' type='video/mp4' preload='auto'></video>")[0] ];
	self.element.appendChild( self.adPlayer[0] );
	self.element.appendChild( self.adPlayer[1] );
	self.element.appendChild( $("<div id='adInfo'></div>")[0] );
	
	debug("html5 ad-video objects created");
	
	var adEnd = function(e){
		self.setLoading(false);
		
		debug("ad ended. adCount="+ self.adCount + " adBuffer length: " + self.adBuffer.length );
		if(e) debug("421: "  + e.type );
		var player = $(this);
		if( self.adCount < self.adBuffer.length ){
			player.addClass("hide");			
			self.playAds();			
		} else{
			// no more ads, continue content
			debug("No more ads, continue content video");
			self.onAdBreak = false;
			debug("Hide adv " + player[0].id);
			player.addClass("hide"); // hide ad video
			player[0].pause();

			$("#adInfo").removeClass("show");
			
			if( self.video == null ){
				debug("(adEnd) video has stopped during ads. exit");
				self.clearVideo();
				return;
			}
			
			if( self.firstPlay ){
				debug("(adEnd)  start video firstPlay is set + " + JSON.stringify(self.firstPlay));
				self.startVideo( self.live );
			}
			else{
				debug("(adEnd) else continue paused video");
				self.video.play();
			}
			debug("(adEnd)  show content video");
			$(self.video).removeClass("hide"); // show content video
		}
		
	};
	
	var onAdPlay = function(){
		debug("ad playing");
		var me = self;
		llog("on ad break: " + self.onAdBreak);
		if (me.onAdBreak) {
			$("#player").removeClass("show");
			$("#player").addClass("hide");
			llog("enable skip timer, adCount "  +me.adCount);
				var activeAdPlayer = me.adPlayer[0];
				llog(activeAdPlayer);
			if (0)
				me.enableSkipTimer = setInterval(function(){
					position = Math.floor( activeAdPlayer.currentTime );
					duration = Math.floor(activeAdPlayer.duration );
					var whenToSkip = 30;
					if(1 && GLOBALS.dev && duration < 30) whenToSkip = 5;
					if (position == whenToSkip){
						me.showSkip();
						me.enableSkipButton = true;
					}
					if (duration > whenToSkip && position < whenToSkip) {
						me.skipTimer.style.display = 'block';
						me.skipTimer2.style.display = 'block';
						me.skipTimer2.innerHTML = (whenToSkip-position)+'s';
					}
			}, 1000);
		}
		self.setLoading(false);
		
	};
	
	var onAdProgress = function(e){};
	
	var onAdTimeupdate = function(){
		
		var timeLeft = Math.floor( this.duration - this.currentTime )
		if( timeLeft != NaN ){
			$("#adInfo").addClass("show");
			if(self.adBuffer) $("#adInfo").html("Ad " + self.adCount + "/" + self.adBuffer.length + " (" + timeLeft + "s)" );
		}
	};
	
	$.each( self.adPlayer, function(i, player){
		addEventListeners( player, 'ended', adEnd );
		addEventListeners( player, 'loadstart waiting', function (e){
			debug("[loadstart waiting ad("+i+") : " + player.src + "]" + e.type);
		
		} );
		addEventListeners( player, 'seeked', function(e){
			debug("[seeked ad("+i+") : " + player.src + "]" + e.type);
		} );

		addEventListeners( player, 'canplaythrough', function(e){
			/*if(self.onAdBreak && self.video.duration != NaN){
				if(!self.forceStopTimer) {
					debug("force stop at canplaythrough " + Math.round(self.video.duration));
					self.forceStopTimer = setTimeout( function(e){
						self.forceStopAd();
					}, Math.round(self.video.duration));
				}
			}*/
			debug("[canplaythrough ad("+i+") : " + player.src + "]" + e.type);
		} );
		addEventListeners( player, 'canplay', function(e){
			
			debug("[canplay ad("+i+") : " + player.src + "]" + e.type);
		} );
		addEventListeners( player, 'stalled suspend', function(e){
			debug("[stalled suspend ad("+i+") : " + player.src + "]" + e.type);
		} );
		addEventListeners( player, 'emptied', function(e){
			debug("[emptied ad("+i+") : " + player.src + "]" + e.type);
		
		} );
		addEventListeners( player, 'pause', function(e){
			debug("[pause ad("+i+") : " + player.src + "]" + e.type);
		
		} );
		
		addEventListeners( player, 'playing', onAdPlay );
		addEventListeners( player, 'timeupdate', onAdTimeupdate );
		addEventListeners( player, 'progress', onAdProgress );
	} );
};
VideoPlayerHTML5.prototype.getAds = function( adBreak ){
	var url, self = this;
	debug("get ads breaks=" + adBreak.ads + ", position="+adBreak.position );
	
	var serie = GLOBALS.item.show_title;
	if (adBreak.position == 'preroll') {
		url="/get.php/sd/"+ON_Channel+"/tg/media/ty/pre/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
		if (GLOBALS.dev)
			url="http://rik.smart-tv-data.com/get.php/sd/"+ON_Channel+"/tg/media/ty/pre/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
	} else {
		url="/get.php/sd/"+ON_Channel+"/tg/media/ty/mid/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
		if (GLOBALS.dev)
			url="http://rik.smart-tv-data.com/get.php/sd/"+ON_Channel+"/tg/media/ty/mid/sm/"+smarttv_id+"/area/"+encodeURIComponent(serie);
	}
	debug(url);

	createHttpRequest(url, function (p) {
		var ar=p.split('#');

		console.log(ar);
		if ((ar.length>2 && ar[2].match(/http/i)) || (1&&GLOBALS.dev) ){
			var spot=(1&&GLOBALS.dev ? 'http://mega.smart-tv-data.com/21.mp4':ar[2]), a=[];
			a.push(spot);
			debug('Got ad, loading video '+spot);

			self.onAdBreak = true; // disable seeking
			self.adCount = 0;
			try{
				if( self.isPlaying() ){
					self.video.pause();
					debug("main content paused to play ad.");
				}
			} catch(e){
				debug("content video pause failed. May be not initialized yet (prerolls)");
			}

			if (!GLOBALS.dev)
				for(var i=3;i < ar.length;i++){
					var xLog=new Image;
					xLog.src=ar[i];
				}
			if (a.length) {
				console.log("Array of ads to be displayed: " + a.length);
				self.adBuffer = a;
				self.prepareAdPlayers();
				self.playAds();
			} else{
				debug("No ads retrieved, please continue with video");
				self.video.play(); // XXX this is wrong
			}
		}else {
			debug("return value NOID play video");
			self.video.play(); // XXX this is wrong
		}
	});
};

VideoPlayerHTML5.prototype.playAds = function(){
	this.onAdBreak = true; // disable seeking
	try{
		if( this.isPlaying() ){
			debug("pause video to play ad");
			this.video.pause();
		}
	} catch(e){
		debug("content video pause failed. May be not initialized yet (prerolls)");
	}
	$(this.video).addClass("hide");
	
	var self = this;
	
	var activeAdPlayer = self.adPlayer[ self.adCount % 2 ];
	var idleAdPlayer = self.adPlayer[ (self.adCount + 1) % 2 ];
	
	// for the first ad, set active ad src. Later the active players url is always set and preload before the player is activated
	if( self.adCount == 0 ){
		activeAdPlayer.src = self.adBuffer[ self.adCount ];
		debug("set active ad source file :  "+ activeAdPlayer.src);
	}
	
	self.adCount++
	
	// set next ad url to idle player and preload it
	if( self.adBuffer.length > self.adCount ){
		idleAdPlayer.src = self.adBuffer[ self.adCount ];
		idleAdPlayer.load();
	}
	
	debug("active ad player play");
	activeAdPlayer.play();
	$( activeAdPlayer ).removeClass("hide");
	$( idleAdPlayer ).addClass("hide");
};

VideoPlayerHTML5.prototype.clearLicenseRequest = function(callback){
	debug("Clear DRM License, time: "+getYMDHMS(null));
	
	// if drm object exists set an empty acquisition
	this.oipfDrm = $("#oipfDrm")[0];	
	if( !this.oipfDrm ){
		if( callback ){
			callback("oipfDrm is null");
		}
		return;
	}
	
	var msgType="";
	var xmlLicenceAcquisition;
	var DRMSysID;
	var self = this;

	if(!this.drm || !this.drm.system) {
		callback();
		return;
	} else if(this.drm.system.indexOf("playready")==0) {
		msgType = "application/vnd.ms-playready.initiator+xml";
		DRMSysID = "urn:dvb:casystemid:19219";		
		xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
		  '<LicenseServerUriOverride><LA_URL></LA_URL></LicenseServerUriOverride>' +
		'</PlayReadyInitiator>';		
	}
	else if( this.drm.system == "marlin" ){
		msgType = "application/vnd.marlin.drm.actiontoken+xml";
		DRMSysID = "urn:dvb:casystemid:19188";
		xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<Marlin xmlns="http://marlin-drm.com/epub"><Version>1.1</Version><RightsURL><RightsIssuer><URL></URL></RightsIssuer></RightsURL></Marlin>';		
	}
	else if(this.drm.system.indexOf("widevine")==0) {
		msgType = "application/widevine+xml"; // "application/smarttv-alliance.widevine+xml"
		DRMSysID = "urn:dvb:casystemid:19156";
		xmlLicenceAcquisition =
			'<?xml version="1.0" encoding="utf-8"?>' +
			'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
			'<ContentURL></ContentURL>' +
			'<DeviceID></DeviceID><StreamID></StreamID><ClientIP></ClientIP>' +
			'<DRMServerURL></DRMServerURL>' +
			'<DRMAckServerURL></DRMAckServerURL><DRMHeartBeatURL></DRMHeartBeatURL>' +
			'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>' +
			'<UserData></UserData>' +
			'<Portal></Portal><StoreFront></StoreFront>' +
			'<BandwidthCheckURL></BandwidthCheckURL><BandwidthCheckInterval></BandwidthCheckInterval>' +
			'</WidevineCredentialsInfo>';
	} else if( this.drm.system == "clearkey" ){
		callback();
		return;
	}
		
	try {
		this.oipfDrm.onDRMMessageResult = callback;
	} catch (e) {
		debug("sendLicenseRequest Error 1: " + e.message );
	}
	try {
		this.oipfDrm.onDRMRightsError = callback;
	} catch (e) {
		debug("sendLicenseRequest Error 2: " + e.message );
	}
	try {
		debug("clearLicenseRequest type: "+ msgType + ", sysId: "+DRMSysID);
		var msgId=-1;
		if(msgType!="")
			msgId = this.oipfDrm.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		debug("clearLicenseRequest drmMsgId: " + msgId);
	} catch (e) {
		debug("sendLicenseRequest Error 3: " + e.message );
		callback();
	}
};

VideoPlayerHTML5.prototype.sendLicenseRequest = function(callback){
	debug("Send DRM License, time: "+getYMDHMS(null));
	createOIPFDrmAgent(); // see common.js
	this.oipfDrm = $("#oipfDrm")[0];
	
	this.drm.successCallback = callback;
	var self = this;
	
	// persistent-license test needs a session GUID to track laurl invocation
	var laUrl = self.drm.la_url;
	var laUrl = self.la_url;
	if(laUrl.indexOf("${GUID}")>=0) {
		self.drm.la_url_guid = uuidv4();
		laUrl = laUrl.replace("${GUID}", self.drm.la_url_guid);
	} else {

		delete self.drm.la_url_guid;
	}

	debug("[sendLicenseRequest] final la url is: " + laUrl);
	this.drm.system = "playready";
	debug("drm system of device is: ");
	debug(this.drm.system);
	if(1 /*this.drm.system.indexOf("playready")==0*/) {
		var msgType = "application/vnd.ms-playready.initiator+xml";
		var DRMSysID = "urn:dvb:casystemid:19219";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
		  '<LicenseServerUriOverride>' +
			'<LA_URL>' +
				laUrl +
			'</LA_URL>' +
		  '</LicenseServerUriOverride>' +
		'</PlayReadyInitiator>';
	}
	else if( this.drm.system == "marlin" ){
		var msgType = "application/vnd.marlin.drm.actiontoken+xml";
		var DRMSysID = "urn:dvb:casystemid:19188";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<Marlin xmlns="http://marlin-drm.com/epub"><Version>1.1</Version><RightsURL><RightsIssuer><URL>'+ laUrl +'</URL></RightsIssuer></RightsURL></Marlin>';
	} else if(this.drm.system.indexOf("widevine")==0) {
		var msgType = "application/widevine+xml"; // "application/smarttv-alliance.widevine+xml"
		var DRMSysID = "urn:dvb:casystemid:19156";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
		'<ContentURL>' + XMLEscape(this.url) +'</ContentURL>' +
		'<DeviceID></DeviceID><StreamID></StreamID><ClientIP></ClientIP>' +
		'<DRMServerURL>' + XMLEscape(laUrl) + '</DRMServerURL>' +
		'<DRMAckServerURL></DRMAckServerURL><DRMHeartBeatURL></DRMHeartBeatURL>' +
		'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>' +
		'<UserData></UserData>' +
		'<Portal></Portal><StoreFront></StoreFront>' +
		'<BandwidthCheckURL></BandwidthCheckURL><BandwidthCheckInterval></BandwidthCheckInterval>' +
		'</WidevineCredentialsInfo>';
	}
	else if( this.drm.system == "clearkey" ){
		// do some native players support manifest <LaUrl> field?
	}
	
	try {
		this.oipfDrm.onDRMMessageResult = drmMsgHandler;
	} catch (e) {
		debug("sendLicenseRequest Error 1: " + e.message );
	}
	try {
		this.oipfDrm.onDRMRightsError = drmRightsErrorHandler;
	} catch (e) {
		debug("sendLicenseRequest Error 2: " + e.message );
	}
	try {
		debug("sendLicenseRequest type: "+ msgType + ", sysId: "+DRMSysID);
		var msgId = this.oipfDrm.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		debug("sendLicenseRequest drmMsgId: " + msgId);
	} catch (e) {
		debug("sendLicenseRequest Error 3: " + e.message );
		setTimeout( function(){
			self.clearVideo();
			showInfo(e.message);
		}, 1000);
	}	
	
	
	function drmMsgHandler(msgID, resultMsg, resultCode) {
		debug("drmMsgHandler drmMsgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
		showInfo("drmMsgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
		var errorMessage = "";
		debug("[drmMsgHandler] Result code:||"+resultCode+"||");
		switch (resultCode) {
			case 0:
				self.drm.ready = true;
				debug("call self.drm.successCallback()");
				self.drm.successCallback();
			break;
			case 1:
				errorMessage = ("DRM: Unspecified error");
			break;
			case 2:
				errorMessage = ("DRM: Cannot process request");
			break;
			case 3:
				errorMessage = ("DRM: Uknown MIME type");
			break;
			case 4:
				errorMessage = ("DRM: User Consent Needed");
			break;
			case 5:
				errorMessage = ("DRM: Unknown DRM system");
			break;
			case 6:
				errorMessage = ("DRM: Wrong format");
			break;			
		}
		
		if( resultCode > 0 ){
			showInfo("" + resultCode + " " + errorMessage );
			Monitor.drmError(errorMessage);
		}
	}

	function drmRightsErrorHandler(resultCode, contentId, systemId, issuerUrl) {
		debug("drmRightsErrorHandler resultCode, contentId, sysId, issuerUrl: " + resultCode + "," + contentId + "," + systemId + "," + issuerUrl);
		var errorMessage = "";
		switch (resultCode) {
			case 0:
				errorMessage = ("DRM: No license error");
			break;
			case 1:
				errorMessage = ("DRM: Invalid license error");
			break;
			case 2:
				errorMessage = ("license valid");
			break;
		}
		showInfo("" + resultCode + " "+ errorMessage);
		Monitor.drmError(errorMessage);
	}
	

};


VideoPlayerHTML5.prototype.startVideo = function(isLive, ntCall) {
	debug("[VideoPlayerHTML5.prototype.startVideo]");

	var self = this;
	if(!ntCall) ntCall=0; // 0=initial, 1=afterDrmLaurlOverride
	debug("startVideo(), " + self.currentItem.title);
	this.subtitleTrack = false
	
	this.resetProgressBar(); // always reset progress bar	
	this.onAdBreak = false;
	this.firstPlay = true;	
	if( isLive ){
		self.live = true;
	} else{
		self.live = false;
	}
	
	if( !this.subtitles ){
		this.subtitleTrack = false;
	}
	GLOBALS.scenemgr.stopBroadcast();

	this.onAdBreak = false;
	this.firstPlay = true;
	
	try{
		if( !self.video ){
			debug("populate player and create video object");
			self.populate();
			self.createPlayer();
			self.setEventHandlers();
		}
	}
	catch(e){
		debug( e.message );
		debug( e.description );
	}
		
	self.element.removeClass("hidden");
	self.visible = true;
	self.setFullscreen(true);

	
	// first play preroll if present
	var playPreroll = false;
	// check prerolls on first start
	self.adBreaks = false;
	if(1 && self.adBreaks ){
		$.each( self.adBreaks, function(n, adBreak){
			if( !adBreak.played && adBreak.position == "preroll" ){
				debug("play preroll  " + JSON.stringify(adBreak) );
				adBreak.played = true;
				playPreroll = true;
				debug("adbreak : " + JSON.stringify(adBreak));
				self.getAds( adBreak );
				return false;
			}
		});
		if( playPreroll ){
			return; // return startVideo(). after prerolls this is called again
		}
	}	

	debug("Set oipf Active DRM");
	if(ntCall==0) setOIPFActiveDRM(self.currentItem);
	
	if(GLOBALS.useDrm){
		llog("drm is " + this.drm);
		this.drm = true;
		this.la_url = "https://drm.anixe.net/playreadyserver/rightsmanager.asmx";
		llog("la_url : " + this.la_url);
		this.drm.ready = false;
		llog("drm is " + this.drm);
		llog("drm ready " + this.drm.ready);
	}	
	
	if( this.drm && (this.drm.ready == false || this.drm.ready === undefined)){
		debug("send license acquisition request");
		this.sendLicenseRequest( function( response ){
			debug("License was acquired, ready ", self.drm);
			if( self.drm.ready ){
				debug("!!! license was successfuly acquired !!!");
				self.startVideo(isLive, ntCall+1); // async 2nd call
			} else if( self.drm.error ){
				debug( "Error: " + self.drm.error);
				showInfo( "Error: " + self.drm.error );
			} else {
				debug( "Unknown DRM error! " + JSON.stringify( response ));
				showInfo( "Unknown DRM error! " + JSON.stringify( response ));
				
			}
			
		} );
		return;
	}
	
	try{
		if( !self.video ){
			debug("populate player and create video object");
			self.populate();
			self.createPlayer();
			self.setEventHandlers();
		}
	}
	catch(e){
		debug( e.message );
		debug( e.description );
	}
	
	try{	
		self.element.removeClass("hidden");
		self.visible = true;
		self.watched.load();
		var position = null; // this.watched.get( self.videoid );
		//debug("position", position );
		if( !self.live && position ){
			self.video.pause();
			debug("video paused");
			showDialog("Resume","Do you want to resume video at position " + toTime( position.position ) , ["Yes", "No, Start over"], function( val ){
				if( val == 0 ){
					self.video.play();
					debug("Seek to resume and play")
					self.video.seek( position.position );
					self.setFullscreen(true);
					self.displayPlayer(5);
				}
				else{
					debug("video.play()")
					self.video.play();
					self.setFullscreen(true);
					self.displayPlayer(5);
				}
			}, 0, 0, "basicInfoDialog");
		}
		else{
			debug("video.play()")
			self.video.play();
			self.setFullscreen(true);
			self.displayPlayer(5);
		}
	}
	catch(e){
		debug( e.message );
		debug( e.description );
	}
	if (GLOBALS.smid && !this.onAdBreak ) {
		this.smidTimer = setInterval(function () {
			if (self.isPlaying()) {
				if(!self.video) return;
				sendSmid(self, self.state, 0);
			} else {
				clearInterval(self.smidTimer);
			}
		}, 30000);
	}
	if (!this.onAdBreak && LBANNER_CATS.indexOf(GLOBALS.item.show_title) != -1 ) {
		var ti = (GLOBALS.dev?40:4*60);
		console.log('lbanner int '+ GLOBALS.item.show_title);
		GLOBALS.lbannerTimer = setInterval( function() { if (!self.onAdBreak) lbanner(GLOBALS.item.show_title); }, ti * 1000);//XXX
	}
};
VideoPlayerHTML5.prototype.checkState = function(){
	var self = this, error=0;
	const state = self.state;
	if (state == STATE_ERROR && self.video)
		error = self.video.error.code;

	if (self.lastState == -1 || self.lastState != state) {
		debug('checkState: state '+ state);

		if (GLOBALS.smid && !self.onAdBreak) {
			sendSmid(self, state, error);
		}
	}
	self.lastState = state;
};

/*VideoPlayerHTML5.prototype.stopAd = function (){
	if (this.middleRollTime) {
			debug('time '+ this.middleRollTime);
			this.setCurrentPos(this.middleRollTime);
			this.middleRollTime = 0;
			this.middleRollDone = 1;
			if (!this.middleTimer)
				this.middleTimer = setInterval( function() { middlerollVideo(self.currentItem["title"]); }, 10 * 60 * 1000);
	}

}*/

VideoPlayerHTML5.prototype.stop = function(){
	//showInfo("Exit Video", 1);	
	var self = this;
	self.watched.save();
	this.onAdBreak = false;
	if(!self.video) return; // video tag not found anymore

	/*if(this.ad){
		this.stopAd();
	}*/

	try {
		//self.skipContainer.style.display = 'none';
		//self.skipTimer2.style.display = 'none';
		self.video.pause(); // html5 video tag does not have a stop() function
		debug("video.pause succeed");
		self.clearVideo();
		debug("clearVideo succeed");
		self.resetProgressBar();
		GLOBALS.scenemgr.stopBroadcast();
		window.setTimeout(function(){
			GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
		},200);
		var ldiv = document.getElementsByClassName('lbanner')[0];
		var img = document.getElementById("lbanner-img");
		var cont = document.getElementById("videodiv");
		ldiv.style.visibility = 'hidden';
		cont.removeClass('cont-lbanner');
		if (img)
			img.parentNode.removeChild(img);
	} catch(ex){
		debug(ex.description);
	}

	if(self.currentItem.setActiveDRM_drmSystemId)
		setOIPFActiveDRM(null);	
};

VideoPlayerHTML5.prototype.play = function(){
	var self = this;
	try{
		self.video.play();
		self.displayPlayer(5);
	}
	catch(e){
		debug(e);
	}
};

VideoPlayerHTML5.prototype.clearVideo = function(){	
	var self = this;
	self.element.addClass("hidden");
	$("#player").removeClass("show");
	self.visible = false;
	clearInterval(GLOBALS.lbannerTimer);
	clearTimeout(GLOBALS.lbannerTimerFirst);
	clearTimeout(GLOBALS.adTimer);
	try{
		if(self.video){
			self.video.pause();
			self.video.src = "";
			$( "#video2" ).remove(); // clear from dom
			this.video = null;
		}
		var broadcast = $("#mybroadcast")[0];
		if( broadcast ){
			debug( "Current broadcast.playState="+ broadcast.playState, "yellow" );
			if( broadcast.playState != 3) { // 0=unrealized, 1=connecting, 2=presenting, 3=stopped
				broadcast.bindToCurrentChannel();
				broadcast.stop();
				debug("broadcast stopped", "yellow");
			}
		}
	}catch(e){
		debug("Error at clearVideo()");
		debug( e.description );
	}
	
	this.clearAds();	
	this.subtitles = null;	
	this.clearLicenseRequest( function(msg){
		//destroyOIPFDrmAgent();
		debug("License cleared:" + msg);
	});
	
};

VideoPlayerHTML5.prototype.skipAd = function(){
	var self = this;
	if(self.enableSkipTimer) clearInterval(self.enableSkipTimer);
	this.skipContainer.style.display = 'none';
	this.skipTimer.style.display = 'none';
	this.skipTimer2.style.display = 'none';
	try{
			self.adPlayer[0].pause();
			$( self.adPlayer[0] ).addClass("hide");
			self.adPlayer[0].src = "";
	}catch(e){ debug("Error at skipAds(): " + e.message); }
	$( "#ad1" ).remove(); 
	$( "#adInfo" ).remove();
	self.onAdBreak = false;
}

VideoPlayerHTML5.prototype.clearAds = function(){
	if( self.adPlayer ){
		try{
			self.adPlayer[0].pause();
		} catch(e){ debug("Error at clearAds(): " + e.message); }
		try{
			self.adPlayer[1].pause();
		} catch(e){ debug("Error at clearAds(): " + e.message); }
		try{
			$( self.adPlayer[0] ).addClass("hide");
			$( self.adPlayer[1] ).addClass("hide");
			self.adPlayer[0].src = "";
			self.adPlayer[1].src = "";
		} catch(e){ debug("Error at clearAds(): " + e.message); }
		
		self.adPlayer = null;
		self.onAdBreak = false;
		self.adBreaks = null;
		self.adBuffer = null;
		self.adCount = 0;
	}
	$( "#ad1" ).remove(); // clear from dom
	$( "#ad2" ).remove(); // clear from dom
	$( "#adInfo" ).remove(); // clear from dom
};

VideoPlayerHTML5.prototype.isFullscreen = function(){
	var self = this;
	return self.fullscreen;
};

VideoPlayerHTML5.prototype.isPlaying = function(){
	return ( this.video && !this.video.paused ); // return true/false
};

VideoPlayerHTML5.prototype.getAudioTracks = function(){
	try{
		var tracks = this.video.audioTracks;
		return tracks.length;
	} catch(e){
		debug(e.message);
		return 0;
	}
}




