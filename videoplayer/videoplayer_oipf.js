/**
 * OIPF AV-Object videoplayer for HbbTV 1.5 devices
 * 
 * 
 *
 * @class VideoPlayer
 * @extends VideoPlayerBasic
 * @constructor
 */


function VideoPlayer(element_id, profile, width, height){
	debug("VideoPlayer - Constructor");
	
	// Call super class constructor
	VideoPlayerBasic.call(this, element_id, profile, width, height);
	this.timeInMilliseconds = true;
	debug("Initialized " + this.element_id);
}

VideoPlayer.prototype.createPlayer = function(){
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

	//this.createSkip();
	if( this.profile.hbbtv == "1.5" ){
		this.video = $("<object id='video2' type='application/dash+xml'></object>")[0];
		this.element.appendChild( this.video );
		return true;
	}else if (this.profile.hbbtv == "1.1"){
		if (GLOBALS.brtyp) this.video = $('<object type="video/mp4"  id="video2" class="fullscreen" ></object>')[0];
		else this.video = $('<video id="video2" class="fullscreen" ></video>')[0];
		this.element.appendChild( this.video );
		return true;
	}
	this.subtitles = [];
	this.buckets = [];
	this.subID = 0;
	this.bucketId = 0;
	this.subtitlesEnabled = false;
	this.midroll = false;
	this.adTimer = null;
	this.lastpos=0;
};

VideoPlayer.prototype.enableSubtitles = function( next ) {
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
		switch ( this.video.playState) {
			case 1:
				// components can be accessed only in PLAYING state
				//ref 7.16.5.1.1 OIPF-DAE
				/*
				COMPONENT_TYPE_VIDEO: 0,
				COMPONENT_TYPE_AUDIO: 1,
				COMPONENT_TYPE_SUBTITLE: 2
				*/
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
				
			break;
			case 6:
				/*ERROR*/
				showInfo("Error has occured");
				break; 
		}
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};

VideoPlayer.prototype.changeAVcomponent = function( component ) {
	debug("changeAVcomponent("+ component +")");
	var self = this;
	if(typeof this.subsmenu == "undefined") return ;
	if (self.video.playState == 1 && component == self.AVCOMPONENTS.SUBTITLE) {
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
		switch ( this.video.playState) {
			case 1:
				// components can be accessed only in PLAYING state
				//ref 7.16.5.1.1 OIPF-DAE
				/*
				COMPONENT_TYPE_VIDEO: 0,
				COMPONENT_TYPE_AUDIO: 1,
				COMPONENT_TYPE_SUBTITLE: 2
				*/
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
				
			break;
			case 6:
				/*ERROR*/
				showInfo("Error has occured");
				break; 
		}
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};

VideoPlayer.prototype.createInternalSubtitlesStructure = function (ret){
	try{
		this.buckets = JSON.parse(ret);
	}catch(e){}

	if(this.buckets.length > 0) {
		this.bucketId = 0;
	}else{
		debug("Subtitles BUCKET EMPTY");
		llog("Subtitles BUCKET EMPTY");
	}

	//GLOBALS.focusmgr.focusObject("videoplayer");
	// the rest of the job is done inside getTimeInfo function , using syncdata, see below
}

VideoPlayer.prototype.loadSubtitles = function (){
	debug("load subtitles "+this.srtFile);
	llog("[loadSubtitles] "+this.srtFile);
	var self = this, url = "videoplayer/parseSrt.php?srt_file="+escape(this.srtFile);
	if (GLOBALS.dev)
		url = "http://rik.smart-tv-data.com/videoplayer/parseSrt.php?srt_file="+escape(this.srtFile);
	llog("[loadSubtitles] "+url);
	this.req = createHttpRequest(url, function(ret) {
		self.req = null;
		self.createInternalSubtitlesStructure(ret);
		self.bucketId = 0;
		GLOBALS.upperlimit = 0;
		
	});
}

VideoPlayer.prototype.setSubtitles = function(subtitles){
	
	var self=this;

	
	if (!subtitles || !subtitles.length)
		return;
	if(subtitles) {
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

VideoPlayer.prototype.setURL = function(url){
	if (GLOBALS.focusmgr.currentFocus) {
		GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
		GLOBALS.focusmgr.focusObject(null);
	}
	url = url.replace("${GUID}", uuidv4());
	debug("setURL("+url+")");
	var type = "application/dash+xml", ag = navigator.userAgent.toUpperCase();
	
	if( url.match(/mp4$/) ){
		this.video.type = "video/mp4";
	} else if( url.match(/\.2ts$/) ){
		this.video.type = 'video/mpeg';
	} else{
		this.video.type = type;
	}
	this.url = url; // see sendLicenseRequest()

	this.video.data = this.url;

	// create id for video url
	this.videoid = url.hashCode();

	return;
};

VideoPlayer.prototype.checkAds = function(){
	var self = this, ldiv = document.getElementsByClassName('lbanner')[0];
	if(self.onAdBreak) return;
	if (ldiv.style.visibility == 'visible') return;

	if( self.adBreaks ){
		var position=0;
		if(self.video) position =  Math.floor( self.video.playPosition/1000 );

		$.each( self.adBreaks, function(n, adBreak){
			//console.log(adBreak.played, adBreak.position, position);
			if( !adBreak.played && adBreak.position == position ){
				$("#player").addClass("hide");
				debug('call midroll', 'yellow');
				if(typeof middlerollVideo === "undefined"){
					debug("middlerollVideo is undefined");
					return;
				}

				self.todo = self.currentItem;
				self.onAdBreak = true;
				middlerollVideo(GLOBALS.item.show_title);
				adBreak.played = true;
			}else if (!adBreak.played && adBreak.position == "preroll"){
				$("#player").addClass("hide");
				debug('call preroll', 'yellow');
				if(typeof prerollVideo === "undefined") {
					debug("prerollVideo is undefined");
					return;
				}
				self.todo = self.currentItem;
				self.onAdBreak = true;
				prerollVideo(GLOBALS.item.show_title);
				adBreak.played = true;
			}
		} );
	}
};

VideoPlayer.prototype.clearLicenseRequest = function(callback){
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
	var self = this;
	if(!this.drm || !this.drm.system) {
		callback();
		return;
	} else if(this.drm.system.indexOf("playready")==0) {
		msgType = "application/vnd.ms-playready.initiator+xml";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
		  '<LicenseServerUriOverride><LA_URL></LA_URL></LicenseServerUriOverride>' +
		'</PlayReadyInitiator>';
		var DRMSysID = "urn:dvb:casystemid:19219";		
	}	
	else if( this.drm.system == "marlin" ){
		msgType = "application/vnd.marlin.drm.actiontoken+xml";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<Marlin xmlns="http://marlin-drm.com/epub"><Version>1.1</Version><RightsURL><RightsIssuer><URL></URL></RightsIssuer></RightsURL></Marlin>';
		var DRMSysID = "urn:dvb:casystemid:19188";
	}
	else if(this.drm.system.indexOf("widevine")==0) {
		msgType = "application/widevine+xml";
		var DRMSysID = "urn:dvb:casystemid:19156";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
		'<ContentURL></ContentURL>' +
		'<DRMServerURL></DRMServerURL>' +
		'<DeviceID></DeviceID><StreamID></StreamID><ClientIP></ClientIP>' +
		'<DRMAckServerURL></DRMAckServerURL><DRMHeartBeatURL></DRMHeartBeatURL>' +
		'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>' +
		'<UserData></UserData>' +
		'<Portal></Portal><StoreFront></StoreFront>' +
		'<BandwidthCheckURL></BandwidthCheckURL><BandwidthCheckInterval></BandwidthCheckInterval>' +
		'</WidevineCredentialsInfo>';
	}
	else if( this.drm.system == "clearkey" ){
		callback();
		return;
	}
		
	try {
		this.oipfDrm.onDRMMessageResult = callback;
	} catch (e) {
		debug("clearLicenseRequest Error 1: " + e.message );
	}
	try {
		this.oipfDrm.onDRMRightsError = callback;
	} catch (e) {
		debug("clearLicenseRequest Error 2: " + e.message );
	}
	try {
		debug("clearLicenseRequest type: "+ msgType + ", sysId: "+DRMSysID);
		var msgId=-1;
		if(msgType!="")
			msgId = this.oipfDrm.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		debug("clearLicenseRequest drmMsgId: " + msgId);
	} catch (e) {
		debug("clearLicenseRequest Error 3: " + e.message );
		callback();
	}
	
};



VideoPlayer.prototype.setSubtitles2 = function( subtitles ){
	if( subtitles ){
		debug("setSubtitles()");
		this.subtitles = subtitles;
	}
	else{
		this.subtitles = null;
	}
};

VideoPlayer.prototype.clearLicenseRequest = function(callback){
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
	var self = this;
	if(!this.drm || !this.drm.system) {
		callback();
		return;
	} else if(this.drm.system.indexOf("playready")==0) {
		msgType = "application/vnd.ms-playready.initiator+xml";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
		  '<LicenseServerUriOverride><LA_URL></LA_URL></LicenseServerUriOverride>' +
		'</PlayReadyInitiator>';
		var DRMSysID = "urn:dvb:casystemid:19219";		
	}	
	else if( this.drm.system == "marlin" ){
		msgType = "application/vnd.marlin.drm.actiontoken+xml";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<Marlin xmlns="http://marlin-drm.com/epub"><Version>1.1</Version><RightsURL><RightsIssuer><URL></URL></RightsIssuer></RightsURL></Marlin>';
		var DRMSysID = "urn:dvb:casystemid:19188";
	}
	else if(this.drm.system.indexOf("widevine")==0) {
		msgType = "application/widevine+xml";
		var DRMSysID = "urn:dvb:casystemid:19156";
		var xmlLicenceAcquisition =
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
		'<ContentURL></ContentURL>' +
		'<DRMServerURL></DRMServerURL>' +
		'<DeviceID></DeviceID><StreamID></StreamID><ClientIP></ClientIP>' +
		'<DRMAckServerURL></DRMAckServerURL><DRMHeartBeatURL></DRMHeartBeatURL>' +
		'<DRMHeartBeatPeriod></DRMHeartBeatPeriod>' +
		'<UserData></UserData>' +
		'<Portal></Portal><StoreFront></StoreFront>' +
		'<BandwidthCheckURL></BandwidthCheckURL><BandwidthCheckInterval></BandwidthCheckInterval>' +
		'</WidevineCredentialsInfo>';
	}
	else if( this.drm.system == "clearkey" ){
		callback();
		return;
	}
		
	try {
		this.oipfDrm.onDRMMessageResult = callback;
	} catch (e) {
		debug("clearLicenseRequest Error 1: " + e.message );
	}
	try {
		this.oipfDrm.onDRMRightsError = callback;
	} catch (e) {
		debug("clearLicenseRequest Error 2: " + e.message );
	}
	try {
		debug("clearLicenseRequest type: "+ msgType + ", sysId: "+DRMSysID);
		var msgId=-1;
		if(msgType!="")
			msgId = this.oipfDrm.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		debug("clearLicenseRequest drmMsgId: " + msgId);
	} catch (e) {
		debug("clearLicenseRequest Error 3: " + e.message );
		callback();
	}
	
};

VideoPlayer.prototype.sendLicenseRequest = function(callback){
	debug("Send DRM License, time: "+getYMDHMS(null));
	createOIPFDrmAgent(); // see common.js
	this.oipfDrm = $("#oipfDrm")[0];
	
	this.drm.successCallback = callback;
	var self = this;
	
	// persistent-license test needs a session GUID to track laurl invocation
	var laUrl = self.drm.la_url;
	if(laUrl.indexOf("${GUID}")>=0) {
		self.drm.la_url_guid = uuidv4();
		laUrl = laUrl.replace("${GUID}", self.drm.la_url_guid);
	} else {
		delete self.drm.la_url_guid;
	}
	
	if(this.drm.system.indexOf("playready")==0) {
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
	} else if( this.drm.system == "marlin" ){
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
		debug("sendLicenseRequest Error 3: " + e.message);
		setTimeout( function(){
			self.clearVideo();
			showInfo(e.message);
		}, 1000);		
	}
	
	function drmMsgHandler(msgID, resultMsg, resultCode) {
		debug("drmMsgHandler drmMsgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
		showInfo("msgID, resultMsg, resultCode: " + msgID +","+  resultMsg +","+ resultCode);
		var errorMessage = "";
		switch (resultCode) {
			case 0:
				self.drm.ready = true;
				//debug("call self.drm.successCallback()");
				self.drm.successCallback();
			break;
			case 1:
				errorMessage = ("DRM: Unspecified error");
			break;
			case 2:
				errorMessage = ("DRM: Cannot process request");
			break;
			case 3:
				errorMessage = ("DRM: Wrong format");
			break;
			case 4:
				errorMessage = ("DRM: User Consent Needed");
			break;
			case 5:
				errorMessage = ("DRM: Unknown DRM system");
			break;
		}
		
		if( resultCode > 0 ){
			showInfo("" + resultCode + " " + errorMessage );
			Monitor.drmError(errorMessage);
		}
	}

	function drmRightsErrorHandler(resultCode, id, systemid, issuer) {
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
		showInfo( errorMessage );
		Monitor.drmError(errorMessage);
	}

};

VideoPlayer.prototype.startVideo = function(isLive, ntCall) {
	var self = this;
	if(!ntCall) ntCall=0; // 0=initial, 1=afterDrmLaurlOverride
	debug("startVideo(), " + self.currentItem.title);

	this.resetProgressBar(); // always reset progress bar	
	if( isLive ){
		self.live = true;
	} else{
		self.live = false;
	}
	GLOBALS.scenemgr.stopBroadcast();

	if(ntCall==0 && this.profile.hbbtv == "1.5") setOIPFActiveDRM(self.currentItem);	

	if( this.drm && this.drm.ready == false ){
		this.sendLicenseRequest( function( response ){
			debug("license ready ", self.drm);
			if( self.drm.ready ){
				self.startVideo(isLive, ntCall+1); // async 2nd call
			} else if( self.drm.error ){
				showInfo( "Error: " + self.drm.error );
			} else{
				showInfo( "Unknown DRM error! " + JSON.stringify( response ));
			}
		} );
		return;
	}

	if( !self.video ){
		self.populate();
		self.setEventHandlers();
	}

	self.video.onPlayStateChange = null;
	self.video.onPlayStateChange = function(){ self.doPlayStateChange(); };
	self.element.removeClass("hidden");
	self.visible = true;

	try{
		self.watched.load();
		var position = null; //this.watched.get( self.videoid );
		if( !self.live && position ){
			self.resumePosition = position.position;
			debug("resumePosition is " + self.resumePosition);
			self.whenstart = function(){
				self.pause();
				debug("video paused by resume dialog in whenstart function");
				showDialog("Resume","Do you want to resume video at position " + toTime( self.resumePosition ) , ["Yes", "No, Start over"], function( val ){
					if( val == 0 ){
						self.whenstart = function(){
							debug("Seek to resume and play " + self.resumePosition * 1000);
							self.video.seek( self.resumePosition * 1000 );
							self.whenstart = null;
							self.resumePosition = 0;

						};
						self.setFullscreen(true);
						self.play();
					}
					else{
						debug("video.play()")
						self.play();
						self.setFullscreen(true);
						self.resumePosition = 0;
					}

				}, 0, 0, "basicInfoDialog");
			};
		}

	} catch(e){
		debug("getting resume position: " + e.description);
	}

	try{
		debug("video.play()");
		self.play();
	} catch(e){
		debug("error start video play: " , e);
	}
	if (GLOBALS.smid && !this.onAdBreak ) {
		this.smidTimer = setInterval(function () {
			if (self.isPlaying()) {
				var vid = document.getElementById('video2');
				if(!vid) return;
				sendSmid(self, vid.playState, 0);
			} else {
				debug('clear smidTimer');
				clearInterval(self.smidTimer);
			}
		}, 30000);
	}

	self.setFullscreen(true);
	if(!self.middleRollTime) self.displayPlayer(5);
	if (!this.onAdBreak && LBANNER_CATS.indexOf(GLOBALS.item.show_title) != -1 ) {
		var ti = (GLOBALS.dev?40:4*60);
		GLOBALS.lbannerTimer = setInterval( function() { if (!self.onAdBreak) lbanner(GLOBALS.item.show_title); }, ti * 1000);//XXX
	}
};

VideoPlayer.prototype.pause = function(){
	var self = this;
	try{
		self.video.play(0);
		self.displayPlayer();
	}
	catch(e){
		debug(e);
	}
};

VideoPlayer.prototype.stop = function(){
	//showInfo("Exit Video", 1);	
	console.log('stop video');
	var self = this;
	if (!this.onAdBreak)
		self.watched.save();
	
	try{
		self.onAdBreak = false;
		clearInterval(self.enableSkipTimer);
		//self.skipContainer.style.display = 'none';
		//self.skipTimer2.style.display = 'none';
		self.video.stop();
		debug( "video.stop succeed" );
		self.clearVideo();
		debug( "clearVideo succeed" );
		self.resetProgressBar();
		GLOBALS.scenemgr.stopBroadcast();
		if (!self.onAdBreak) {
			window.setTimeout(function(){
				GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
			},200);
		}
		//GLOBALS.scenemgr.goBack();
		var ldiv = document.getElementsByClassName('lbanner')[0];
		var img = document.getElementById("lbanner-img");
		var cont = document.getElementById("videodiv");
		ldiv.style.visibility = 'hidden';
		cont.removeClass('cont-lbanner');
		if (img)
			img.parentNode.removeChild(img);
	} catch(ex) {
		debug(ex);
	}
	
	if(this.profile.hbbtv == "1.5" && self.currentItem && self.currentItem.setActiveDRM_drmSystemId)
		setOIPFActiveDRM(null);
};

VideoPlayer.prototype.play = function(){
	var self = this;
	try{
		self.video.play(1);
		self.displayPlayer(5);
	}
	catch(e){
		debug("Error at VideoPlayer.play() " + e.description);
	}
};

VideoPlayer.prototype.clearVideo = function(){
	var self = this;
	self.element.addClass("hidden");
	self.visible = false;
	clearInterval(GLOBALS.lbannerTimer);
	clearTimeout(GLOBALS.lbannerTimerFirst);
	clearTimeout(GLOBALS.adTimer);
	clearInterval(self.adTimer);
	clearInterval(self.progressUpdateInterval);
	self.adTimer = null;
	clearInterval(self.smidTimer);
	try{
		if(self.video){
			if( self.isPlaying() ){
				self.video.stop();
			}
			$( "#video2" ).remove(); // clear from dom
			this.video = null;
			debug("video object stopped, removed from dom and VideoPlayerClass");
		}
		if(!GLOBALS.brtyp){
			if( $("#mybroadcast")[0] ){
				$("#mybroadcast")[0].bindToCurrentChannel();
			}
		}
	}
	catch(e){
		debug("Error at clearVideo()");
		debug( e.description );
	}
	
	
	this.subtitles = null;
	this.buckets = null;
	this.subtitlesEnabled = false;
	this.clearLicenseRequest( function(msg){
		//destroyOIPFDrmAgent();
		debug("License cleared:" + msg);
	});
};

VideoPlayer.prototype.isFullscreen = function(){
	var self = this;
	return self.fullscreen;
};

VideoPlayer.prototype.isPlaying = function(){
	return ( this.video && this.video.playState == 1 ); // return true/false
};

VideoPlayer.prototype.doPlayStateChange = function(){
	var self = this;
	if(!self.video) {
		return;
	}
	if (GLOBALS.smid && !self.onAdBreak) {
		sendSmid(self, self.video.playState, (self.video.playState == STATE_ERROR ? self.video.error : 0));
	}
	switch (self.video.playState) {
		case 0: // stopped
			debug("stopped");
			clearInterval(self.adTimer);
			self.adTimer = null;
			clearInterval(GLOBALS.lbannerTimer);
			clearTimeout(GLOBALS.lbannerTimerFirst);
			clearTimeout(GLOBALS.adTimer);
			clearInterval(self.adTimer);
			clearInterval(self.progressUpdateInterval);
			self.setLoading(false);
			Monitor.videoEnded(debug);
			break;
		case 1: // playing
			debug("playing");
			llog(self.onAdBreak);
			if (self.onAdBreak) {
				llog("enable skip timer!");
				if (0)
				self.enableSkipTimer = setInterval(function(){
					if (!self.video) return;
					position = Math.floor( self.video.playPosition/1000 );
					duration = Math.floor(self.video.playTime / 1000);
					var whenToSkip = 30;
					if(1 && GLOBALS.dev && duration < 30) whenToSkip = 5;
					if (position == whenToSkip){
						self.showSkip();
						self.enableSkipButton = true;
					}
					if (duration > whenToSkip && position < whenToSkip) {
						self.skipTimer.style.display = 'block';
						self.skipTimer2.style.display = 'block';
						self.skipTimer2.innerHTML = (whenToSkip-position)+'s';
					}
				}, 1000);
			}else{
			 clearInterval(self.enableSkipTimer);
			 	//self.skipContainer.style.display = 'none';
				//self.skipTimer2.style.display = 'none';
				//self.skipContainer.style.display = 'none';
				//self.skipTimer.style.display = 'none';
			}

			if (!self.onAdBreak && !self.adTimer) {
				self.adTimer = setInterval(function(){self.checkAds()}, 1000);
			}

			if(self.middleRollTime && self.currentItem.title != "Ad"){
				if (!self.live) {
					debug("go to middle roll time: " + self.middleRollTime);
					self.video.seek(self.middleRollTime * 1000)
				}
				self.middleRollTime = 0;
				self.displayPlayer(5);
			}

			if( dialog.open ){
				debug("pause on dialog");
				self.pause();
				return;
			}

			self.visible = true;
			self.setLoading(false);
			clearInterval(self.progressUpdateInterval);
			self.progressUpdateInterval = window.setInterval( function(){
				if( self.video ){
					self.watched.set( self.video.playPosition / 1000, self.video.playTime / 1000, self.videoid );
				}
				if( self.seekTimer == null ){
					self.updateProgressBar();
					//self.displayPlayer( 5 );
				}
				var bucketNotFound = true, x = Math.floor(self.video.playPosition), playPosition = Math.floor(self.video.playPosition / 1000), duration = Math.floor(self.video.playTime / 1000);
				if (self.subtitles && self.subtitlesEnabled) {
					llog("Subtitles Enabled.");
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
			}, 1000);
			Monitor.videoPlaying();

			if( self.getAudioTracks() > 1 ){ // if more than one audiotrack selectable show button
				$("#audioButton").show();
			}else{
				$("#audioButton").hide();
			}

			if( this.subtitles && this.subtitles.length ){
				$("#subtitleButton").show();
			}
			else{
				$("#subtitleButton").hide();
			}

			// check if there is function to execute after all other things are done for video start
			if( self.whenstart && typeof self.whenstart == "function" ){
				self.whenstart();
				self.whenstart = null;
			}

			break;
		case 2: // paused
			self.setLoading(false);
			clearInterval(self.progressUpdateInterval);
			if(self.isFullscreen()){
				//self.controls.show();
			}
			Monitor.videoPaused();
			break;
		case 3: // connecting
			clearInterval(self.progressUpdateInterval);
			self.setLoading(true, "Connecting");
			Monitor.videoConnecting();
			break;
		case 4: // buffering
			clearInterval(self.progressUpdateInterval);
			self.setLoading(true, "Buffering");
			Monitor.videoBuffering();
			break;
		case 5: // finished
			debug("finished");
			if (self.onAdBreak) {
				self.onAdBreak = false;
				if (self.todo) {
					prepareVideoStart(self.todo);
					var live = false;
					if (self.todo.url.indexOf('.2ts') > 0)
						live = true;
					self.startVideo(live);
					self.todo = null;
				}
			} else {
				clearInterval(self.progressUpdateInterval);
				clearInterval(GLOBALS.lbannerTimer);
				clearTimeout(GLOBALS.lbannerTimerFirst);
				clearTimeout(GLOBALS.adTimer);
				clearInterval(self.adTimer);
				self.setLoading(false);
				self.stop();
			}
			break;
		case 6: // error
			clearInterval(self.progressUpdateInterval);
			self.setLoading(false);
			//self.controls.hide();
			var error = "";
			switch (self.video.error) {
				case 0:
					error = "A/V format not supported";
					break;
				case 1:
					error = "cannot connect to server or lost connection";
					break;
				case 2:
					error = "unidentified error";
					break;
			}
			debug("Error!: " + error + '# '+ self.video.error);
			showInfo("Error!: " + error);
			Monitor.videoError( error );
			//self.clearVideo();
			break;
		default:
			self.setLoading(false);
			// do nothing
			break;
	}
};

VideoPlayer.prototype.getStreamComponents = function(){
	try {
		if(typeof this.video.getComponents == 'function') {
			this.subtitles = vidobj.getComponents( 1 ); // 1= audio
			if (this.subtitles.length > 1) {
				showInfo("Found "+this.subtitles.length+" audio track(s)");
			}
		} else {
			showInfo("Switching audio components not supported");
		}
	} catch (e) {
		showInfo("Switching audio components not supported");
	}
	
};

VideoPlayer.prototype.getAudioTracks = function(){	
	try{
		if(typeof this.video.getComponents == 'function') {
			var avComponent = this.video.getComponents( this.AVCOMPONENTS.AUDIO );
			return avComponent.length;
		}
		else{
			return 0;
		}
	} catch(e){
		showInfo( "getComponents not available", e.message );
	}	
};

VideoPlayer.prototype.getCurrentAudioTrack = function(){
	/*
	try{
		if(typeof this.video.getComponents == 'function') {
			var avComponent = this.video.getComponents( this.AVCOMPONENTS.AUDIO );
			var track = avComponent[ self.audioTrack ];
			return track.language;
		}
		else{
			return "default";
		}
	} catch(e){
		showInfo( "getComponents not available", e.message );
		return "default";
	}
	*/
};
VideoPlayer.prototype.syncdata = function (ms, bucketId){
	if(!this.buckets[bucketId]){
		return;
	}
	var start = new Date().getTime(), t = msToTime(ms), list = this.buckets[bucketId].list;

	document.getElementById("subs-container").style.display = "block";
	document.getElementById("subs-container").innerHTML = "";
	document.getElementById("subs-container").style.visibility = "hidden";

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


VideoPlayer.prototype.changeAVcomponent = function( component ) {
	debug("changeAVcomponent("+ component +")");
	var self = this;
	try{
		var track = ( component == self.AVCOMPONENTS.AUDIO? self.audioTrack : self.subtitleTrack );
		debug("current track: " + track  );
		if( track == undefined || track == NaN || track === false ){
			debug("Change to 0"  );
			track = 0;
		}
		track++;
		
		debug("switched track: " + track );
		
		switch ( this.video.playState) {
			case 1:
				// components can be accessed only in PLAYING state
				//ref 7.16.5.1.1 OIPF-DAE
				/*
				COMPONENT_TYPE_VIDEO: 0,
				COMPONENT_TYPE_AUDIO: 1,
				COMPONENT_TYPE_SUBTITLE: 2
				*/
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
				
			break;
			case 6:
				/*ERROR*/
				showInfo("Error has occured");
				break; 
		}
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};

VideoPlayer.prototype.enableSubtitles = function( next ) {
	llog("enableSubtitles("+ next +")");
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
		switch ( this.video.playState) {
			case 1:
				// components can be accessed only in PLAYING state
				//ref 7.16.5.1.1 OIPF-DAE
				/*
				COMPONENT_TYPE_VIDEO: 0,
				COMPONENT_TYPE_AUDIO: 1,
				COMPONENT_TYPE_SUBTITLE: 2
				*/
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
				
			break;
			case 6:
				/*ERROR*/
				showInfo("Error has occured");
				break; 
		}
    } catch(e){
		debug("enableSubtitles - Error: " + e.description);
	}

};
