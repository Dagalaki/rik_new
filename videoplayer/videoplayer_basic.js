/**
 * Videoplayer common superclass impelmentation for all inherited versions. Common interface that can be extended and specified
 * 
 * 
 *
 * @class VideoPlayerBasic
 * @constructor
 */
function VideoPlayerBasic(element_id, profile, width, height){
	
	this.onExtraBtns = 0;
	this.onInfo = 0;
	this.extraFocusedId = 0;

	this.FILETYPES = {
		MP4:0,
		MPEG:1,
		DASH:2
	};
	this.AVCOMPONENTS = {
		VIDEO : 0,
		AUDIO : 1,
		SUBTITLE : 2
	};
	
	/*this.ad = false;
	this.middleRollTime = 0;
	this.middleTimer = null;
*/
	this.currentItem = null; // set by menu.js:prepareVideoStart(), config.json item
	this.audioTrack = false;
	this.subtitleTrack = false;
	
	this.element_id = element_id;
	this.element = document.getElementById(element_id);
	if(!this.element){
		this.element = document.createElement("div");
		this.element.setAttribute("id", this.element_id);
	}

	$(this.element).addClass("hidden");
	//this.element.style.position="relative";
	this.fullscreenElement = this.element;
	this.width = width;
	this.height = height;
	this.visible = false;
	this.url = null;
	this.video = null;
	this.profile = profile;
	this.timeInMilliseconds = false;

	// Timers and intervals
	this.progressUpdateInterval = null;
	this.hidePlayerTimer = null;
	this.seekTimer = null;
	this.seekValue = 0;
	this.segment = 10;
	
	/**
	 * Creates player component and sets up event listeners
	 * Basic version is left empty and inherited players must define this method for all different players creation
	 * @method createPlayer
	**/
	this.createPlayer = this.__proto__.createPlayer;
	
this.createSkip = function () {
		this.enableSkipButton = false;
		var skip = document.createElement("div");
		skip.className = 'skip-container';
		skip.id = "skip-div";
		this.skipContainer = skip;
		//parent.appendChild(skip);
		$("body").append(skip);

		var t = document.createElement("div");
		t.className = 'skip-timer';
		t.id = "skip-timer";
		this.skipTimer = t;
		//parent.appendChild(t);
		$("body").append(t);

		var s = document.createElement("span");
		s.id = "skip-timer2";
		this.skipTimer2 = s;
		//parent.appendChild(s);
		$("body").append(s);

		var skipButton = document.createElement("div");
		skipButton.className = 'skip-button';
		skipButton.id = "skip-button";
		skipButton.innerHTML = 'Παράλειψη διαφήμισης';
		this.skipContainer.appendChild(skipButton);

	}

	this.showSkip = function () {
		this.skipContainer.style.display = 'block';
		this.skipTimer.style.display = 'none';
		this.skipTimer2.style.display = 'none';
	}
	
	/**
	 * Basic video player populate method to initialize player html elements ready for setting up
	 * @method populate
	**/
	this.populate = function(){
		this.element.innerHTML = "";
		this.video = null;
		this.loadingImage = document.createElement("div");
		this.loadingImage.setAttribute("id", "loadingImage");
		this.loadingImage.addClass("hidden");
		this.element.appendChild(this.loadingImage);
		this.setFullscreen(true);
	};
	 	

	/**
	 * Displays player over video. Player shows current play position, duration and buttons that can be used
	 * @param {Int} sec. seconds player is displayed on screen and hidden after. If sec is not defined player remains on screen and is not hidden.
	 * @method displayPlayer
	 */
	this.displayPlayer = function( sec ){
		if(this.onAdBreak) return;
		debug("VideoPlayerBasic - displayPlayer");
		if(this.currentItem) {
			$("#player>#playText").text(this.currentItem.title);
			debug("Current item=" + this.currentItem.title
				+"\n"+this.currentItem.url
				+"\ndrm="+this.currentItem.drm + " " + this.currentItem.la_url);
		} else {
			$("#player>#playText").text("");
		}
		clearTimeout( this.hidePlayerTimer );
		$("#player").removeClass("hide");
		$("#player").addClass("show");
		if (document.getElementById("subs-container"))
			$("#subs-container").addClass("openplayer");

		if(sec){
			this.hidePlayerTimer = setTimeout( function(){
				$("#player").removeClass("show");
				if (document.getElementById("subs-container"))
					$("#subs-container").removeClass("openplayer");

				if(self.timelinePreview) {
					$('.thumbnail').css("display","none");
				}
			}, sec * 1000);
		}
	};
	
	this.navigateBottom = this.__proto__.navigateBottom || function(key){
		var self = this;
		var btnsSize = 6;
		if (self.onAdBreak){
			self.navigate(key);
			return;
		}
		
		if( dialog && dialog.open ){
			navigateDialog( key );
			return;
		}
		self.displayPlayer(6);
		switch(key){
			case VK_BACK:
				self.navigate(key);
				break;
			case VK_UP:
				self.displayPlayer(4);
				self.onExtraBtns = false;
				var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
				if (typeof btns[self.extraFocusedId] == 'undefined')
					break;
				btns[self.extraFocusedId].removeClass("focused");
				break;
			case VK_DOWN:
				if(!self.live) break;
				self.onExtraBtns = false;
				var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
				btns[self.extraFocusedId].removeClass("focused");
				$("#player").addClass("offset");
				self.onEpgList = true;
				self.dayIndex = self.dayFocusedId = 0;
				break;
			case VK_RIGHT:
				self.extraFocusedId++;
				if(self.extraFocusedId >= btnsSize) self.extraFocusedId = btnsSize -1;
				debug("nav bottom extra to: "+self.extraFocusedId);
				self.setFocusOnExtraBtn();
				break;
			case VK_LEFT:
				self.extraFocusedId--;
				if(self.extraFocusedId < 0) self.extraFocusedId = 0;
				self.setFocusOnExtraBtn();
				break;
			case VK_ENTER:
				switch(self.extraFocusedId) {
					case 0:
						debug("Push back button");
						self.stop();
						GLOBALS.vplayer.onExtraBtns = false;
						$("#player").removeClass("show");
						$("#subs-container").html("");
						$("#subs-container").css("visibility", "hidden");
						//self.removeNextEpisodeOverlay();
						break;
					case 1: //star
						break;
					case 2: 
						try{
							if( typeof this.enableSubtitles  == "function" ){
								this.changeAVcomponent( this.AVCOMPONENTS.SUBTITLE );
								if($('#extra-btn2').hasClass("active")) {
									GLOBALS.vplayer.subtitlesEnabled = false;
									$('#extra-btn2').removeClass("active");
								}
								else {
									GLOBALS.vplayer.subtitlesEnabled = true;
									$('#extra-btn2').addClass("active");
								}
								this.displayPlayer(4);
							}
						} catch( e ){
							console.log(e);
							debug( "246 error :" + e.message );
						}
						break;
					case 3: //info
						self.onExtraBtns = false;
						if (self.onInfo) {
							self.onInfo = 0;
							$('.playerbg').css('display', 'none');
							$('.playerinfo').css('display', 'none');
						} else {
							var item = GLOBALS.item;
							self.infotop = 60; // initial top
							var s = '<div class="info-sub">'+ item.category +' &gt; '+ (item.section?item.section:item.title) +'</div>';
							s += '<div class="info-title">'+ (item.episode?item.episode:item.title) +'</div>';
							s += '<div class="info-descr">'+ $(".show-description").html()+'</div>';
							$("#player").removeClass("show");
							$('.playerbg').css('display', 'block');
							$('.playerinfo').css('display', 'block');
							$('.playerinfo').html(s);
							self.onInfo = 1;
							self.descr = $('.playerinfo');
							self.descr.css('top', self.infotop + "px");
						}
						break;
					case 4: //more
						break;
					case 5: //next
						break;
				}
				break;
			default:
				break;
		}
	}

	/**
	 * Handles navigation during video playback. This super class method may be re-defined on inherited class
	 * @param {Int} key. keycode of pressed key. Keycodes are defined in keycodes.js file
	 * @method navigate
	 */
	/* Use inherited basic method or player specified */
	this.navigate = this.__proto__.navigate || function(key){
		
		var self = this;
		if (self.onAdBreak){
			if(key == VK_ENTER && self.enableSkipButton){
				var me = self;
				setTimeout(function() {
						me.onAdBreak = false;
					if(me.profile.version == "oipf"){
						self.enableSkipButton = false;
						me.onAdBreak = false;
						self.stop();
						var item = GLOBALS.vplayer.todo, live = false;
						prepareVideoStart(item);
						if (item.url.indexOf('.2ts') > 0)
							live = true;
						GLOBALS.vplayer.startVideo(live);
						me.skipContainer.style.display = 'none';
						me.skipTimer.style.display = 'none';
						me.skipTimer2.style.display = 'none';
					}else if(me.profile.version == "html5"){
						self.enableSkipButton = false;
						me.onAdBreak = false;
						me.skipAd();
 						me.video.play();
						$(me.video).removeClass("hide");
					}
					
				}, 200);
			}
			return;
		}else

		if (self.onInfo) {
			if (key == VK_UP) {
				if (self.infotop == 60) {
					return;
				}
				self.infotop += 30;
				self.descr.css('top', self.infotop + "px");
			} else if (key == VK_DOWN) {
				if (Math.abs(self.infotop) >= self.descr.prop('scrollHeight') - 190)
					return;
				self.infotop -= 30;
				self.descr.css('top', self.infotop + "px");
			} else {
				self.onInfo = 0;
				$('.playerbg').css('display', 'none');
				$('.playerinfo').css('display', 'none');
			}
			return;
		}
		
		if( dialog && dialog.open ){
			navigateDialog( key );
			return;
		}
		
		if( self.onAdBreak ){
			debug("Navigation on ad break");
		}
		
		// this       = VideoPlayerEME, VideoPlayer(oipf) instance
		// this.video = HTMLVideoElement
		// this.player= DashJSPlayer instance
		
		switch(key){
			case VK_UP:
				self.displayPlayer(5);
			break;

			case VK_DOWN:
				if(!self.live){
					self.displayPlayer();
					self.onExtraBtns = true;
					self.extraFocusedId = 1;
					self.setFocusOnExtraBtn();
				}else{
					self.onExtraBtns = false;
					var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
					btns[self.extraFocusedId].removeClass("focused");
					$("#player").addClass("offset");
					$('.arrowIcon').addClass("up");
					$('.arrowBg').addClass("up");
					self.onEpgList = true;
					self.dayIndex = self.dayFocusedId = 0;
				}
			break;

			case VK_BACK:
			case VK_STOP:
			case 8: // for edge backspace button
				self.stop();
				if(GLOBALS.PREVIEW) GLOBALS.videopreview.play();
				//GLOBALS.scenemgr.setRF();
				$("#player").removeClass("show");
				$("#subs-container").html("");
				$("#subs-container").css("visibility", "hidden");
				//this.removeNextEpisodeOverlay();
				self.onExtraBtns = false;
				if($('#extra-btn2').hasClass("active")) $('#extra-btn2').removeClass("active");
				return false;
			break;

			case VK_LEFT:
			case VK_REWIND:
				if( !self.onAdBreak  && !self.live){
					self.seek( this.timelinePreview?-10:-30 );
					self.displayPlayer(5);
				}
				break;
			case VK_RIGHT:
			case VK_FAST_FWD:
				if( !self.onAdBreak && !self.live){
					self.seek( this.timelinePreview?10:30 );
					self.displayPlayer(5);
				}
				break;
			case VK_ENTER:
			//case VK_PLAY_PAUSE:
			case VK_PAUSE:
			case VK_PLAY:
				if( !self.onAdBreak ){
					var pauseplay = document.querySelector("#ppauseplay");
					if( this.isPlaying() ){
						this.pause();
						if(pauseplay){
							pauseplay.removeClass("pause");
							pauseplay.addClass("play");
						}
					}
					else{
						this.play();
						if(pauseplay){
							pauseplay.removeClass("play");
							pauseplay.addClass("pause");
						}
					}
				}
			break;
			case VK_YELLOW:
				try{
					if( this.video.textTracks ){
						var isEME=this.constructor.name=="VideoPlayerEME";
						
						// count all tracks except metadata
						var tracks = 0;
						var metadataTracks = [];
						var firstTextTrack = null;
						try{
							if(isEME) {
								tracks = this.getTextTracks(); // counter
								if(tracks>0) firstTextTrack=0;
							} else {							
								for( var i = 0; i < this.video.textTracks.length; ++i ){
									if( this.video.textTracks[i].kind != "metadata" ){
										if( firstTextTrack === null )
											firstTextTrack = i;
										tracks++;
										this.video.textTracks[i].mode = 'hidden'; // hide all
									} else {
										metadataTracks.push(i);
									}
								}
							}
						} catch(e){
							debug("error " + e.description);
						}
						
						debug("switch text track, tracks " + tracks);
						//debug("metaDataTracks ", metadataTracks );
						if( !tracks ){
							showInfo("No Subtitles Available");
							break;
						}
						
						if( this.subtitleTrack === false )
							this.subtitleTrack = firstTextTrack;
						
						var lang;
						if(isEME) {	
							this.subtitleTrack = this.subtitleTrack >= tracks ? firstTextTrack : this.subtitleTrack+1;
							this.setTextTrack(this.subtitleTrack);
							lang = this.getCurrentTextTrack();
							if(lang=="undefined") lang="off";						
						} else {
							if( this.subtitleTrack >= tracks ){
								this.subtitleTrack = firstTextTrack; // current one was "off", select 1st track
							} else {
								this.video.textTracks[ this.subtitleTrack ].mode = 'hidden'; // hide current
								do{
									this.subtitleTrack++;
								} while( metadataTracks.indexOf( this.subtitleTrack ) != -1 );								
							}
							lang = (this.subtitleTrack >= tracks? "off" : this.video.textTracks[ this.subtitleTrack ].language );
							if(lang!="off")
								this.video.textTracks[ this.subtitleTrack ].mode = 'showing';
						}
						
						$("#subtitleButtonText").html( "Subtitles: " + lang );
						showInfo("Subtitles: " + lang);						
						if( lang != "off" )
							debug("Set textTrack["+ this.subtitleTrack +"] Showing: " + lang);
					}
					else if( typeof this.enableSubtitles  == "function" ){
						this.changeAVcomponent( this.AVCOMPONENTS.SUBTITLE );
						//this.enableSubtitles(true);
					}
				} catch( e ){
					debug( e.description );
				}
			break;
			
			case VK_GREEN:
				try{
					if( this.getAudioTracks() > 1 ){
						var isEME=this.constructor.name=="VideoPlayerEME";
						if( isEME || this.video.audioTracks ){
							debug("switch audio track");
							if( this.audioTrack === false ) {
								this.audioTrack = 0;
							}
							
							var tracks = isEME ? this.getAudioTracks() : this.video.audioTracks.length;	 // counter
							if( this.audioTrack >= tracks ){
								this.audioTrack = 0; // was off(muted), select first and unmute audio
							} else {
								this.audioTrack++;
							}
							
							var lang;
							if(isEME) {
								if(this.audioTrack == tracks) {
									this.player.setMute(true);
									lang="Muted";
								} else {
									var track = this.player.getTracksFor("audio")[this.audioTrack];
									lang = track.lang;
									this.player.setCurrentTrack(track);
									this.player.setMute(false);
								}
							} else {
								for (var i = 0; i < this.video.audioTracks.length; i += 1) {
									this.video.audioTracks[i].enabled = false;
								}
								var muted = ( this.audioTrack == tracks );
								if( !muted ){
									this.video.audioTracks[this.audioTrack].enabled = true;
								}
								lang = (muted? "Muted" : this.video.audioTracks[this.audioTrack].language );
							}
							debug("audiotracks " + tracks + ", current: "+this.audioTrack + ", " + lang);
							
							$("#audioButtonText").html( "Audio: " + lang );
							showInfo("Audio: " + lang);
						} else{
							this.changeAVcomponent( this.AVCOMPONENTS.AUDIO );
						}
					} else if( this.getAudioTracks() == 1 ) {
						showInfo("Current audio track (1/1): " + this.getCurrentAudioTrack() );
					} else {
						showInfo("No audio tracks available");
					}
				} catch( e ){
					debug( e.description );
				}
			default:
			break;
		}
	};
	
	this.setFocusOnExtraBtn = function(){
		var self = this;
		debug("focus extra to "+self.extraFocusedId);
		var btns = document.getElementById("extra-btns").getElementsByClassName("extra-btn");
		for(var i=0; i<btns.length; i++){
			if(i == self.extraFocusedId){
				btns[i].addClass("focused");
			}else{
				btns[i].removeClass("focused");
			}
		}
	}

	/**
	 * 
	 * @param {HTML Element} container. Container for video display. Video will be set inside the container 
	 * @method setDisplay
	 */
	this.setDisplay = function( container ){
		/*
		if( container ){
			// detach from DOM
			var element = $(this.element).detach();
			element.addClass("hidden");
			// append into
			$(container).prepend( element );
			element.removeClass("hidden");
		}
		else{
			// if target not set, assume to set fullscreen
			this.setFullscreen(true);
		}
		*/
	};
	
	this.getCurrentAudioTrack = this.__proto__.getCurrentAudioTrack || function(){
		return "default";
	};
	
	
	/**
	 * 
	 * @param {Object} subtitles. Creates HTML track objects for Out-Of-Band subtitle files
	 * @method setSubtitles
	 */
	this.setSubtitles = this.__proto__.setSubtitles || function( subtitles ){
		// out-of-band subtitles must be an array containing containing language code and source.xml file url.
		var self = this;
		try{
			var player = GLOBALS.vplayer.video;
			debug("set subs from active assets metadata 'subtitles'");
			this.subtitles = subtitles;
			debug("subtitles: "+JSON.stringify(this.subtitles) );
			
			if( this.subtitles && this.subtitles.length ){
				$.each( this.subtitles, function(i, lang){
					debug("Subtitles " + i + ": " + lang.code + " - " + lang.src);
					var track = document.createElement("track");
					track.kind = "subtitles";
					track.label = lang.code;
					track.language = lang.code;
					// https://www.w3schools.com/tags/ref_language_codes.asp
					//if (lang.code=="eng") lang.isocode="en";
					//else if (lang.code=="fin") lang.isocode="fi";
					//else if (lang.code=="swe") lang.isocode="sv";
					//else if (lang.code=="ger") lang.isocode="de";
					track.srclang = lang.code; //lang.isocode;
					track.src = lang.src;
					track.onerror = function(e){
						self.lastError = e;
						debug("track.onerror: "+JSON.stringify(e));
						//showInfo("Error getting subtitle file");
					};	
					player.appendChild(track);
				} );
				$("#subtitleButton").show();
				$("#subtitleButtonText").html( "Subtitles: " + player.textTracks[0].label );
				debug( "Text tracks: " + player.textTracks.length );
				$.each( player.textTracks, function(i, track){
					debug( track );
				} );
				this.subtitleTrack = 0;
				player.textTracks[0].mode = "showing";
			}
			else{
				debug( "no subs" );
			}
		} catch(e){
			debug("Error: setSubtitles: " + e.description );
		}
	};
	/**
	 * 
	 * Pause video playback and display player on screen
	 * @method pause
	 */
	this.pause = this.__proto__.pause || function(){
		debug("VideoPlayerBasic pause");
		var self = this;
		try{
			self.video.pause();
			self.displayPlayer();
		}
		catch(e){
			debug(e);
		}
	};
	
	/**
	 * 
	 * @param {bool} loading. Sets player's loading indicator visible if true, and hides if false
	 * @param {String} reason. logs reason for loading if specified
	 * @method setLoading
	 */
	this.setLoading = function(loading, reason){
		this.loading = loading;
		if(this.loading){
			this.loadingImage.removeClass("hidden");
		}
		else{
			this.loadingImage.addClass("hidden");
		}
		if(reason){
			debug(reason);
		}
	};
	
	/**
	 * 
	 * @param {bool} fs. Set video fullscreen if true, and to the active asset box if false
	 * @method setFullscreen
	 */
	this.setFullscreen = function(fs){		
		this.fullscreen = fs;
		if(fs){
			this.element.addClass("fullscreen");
			//this.setDisplay( $("body")[0] ); // sets video player object to child of body
		}
		else{
			this.element.removeClass("fullscreen");
			//this.setDisplay( menu.focus.element ); // sets video player object to child of focused tile element
			$("#player").removeClass("show");
		}
	};
	
	/**
	 * 
	 * returns true if player is visible
	 * @method isVisible
	 */
	this.isVisible = function(fs){
		return this.visible;
	};
	
	/**
	 * 
	 * Resets progressbar and time to initial state
	 * @method resetProgressBar
	 */
	this.resetProgressBar = function(){
		try{
			var self = this;
			$("#progressbar")[0].style.width = "0px";
			$("#playposition").css("left", "0px");
			$("#progress_currentTime").css("left", "0px");
			$("#playposition").html( "00:00:00" );
			

			document.getElementById("playtime").innerHTML = "";
			
			if( self.live ){
				document.getElementById("playtime").innerHTML = "LIVE";
			}
			else{
				document.getElementById("playtime").innerHTML = "00:00:00";
			}
			
		} catch(e){
			debug( e.message );
		}
	};
	function roundNearest(positionInSeconds) {
		var roundedPosition = Math.round(positionInSeconds / 10) * 10;
		return roundedPosition;
	}
	function roundNearestMS(positionInSeconds) {
		var roundedPosition = Math.round(positionInSeconds / 10000) * 10000;
		return roundedPosition;
	}
	/**
	 * 
	 * Updates progress bar. Progress bar is only visible when player UI is displayed, but it is always updated non-visible when this method is called
	 * @method updateProgressBar
	 */
	this.updateProgressBar = function( sec ){
		var position = 0;
		var duration = 0;
		var pbMaxWidth = 895; // progress bar maximum width in pixels
		
		// first try get time out of player and decide which player is used
		try{
			
			if( this.live ){
				duration = 100;
				position = 100;
				
				var time = this.time();
				
				duration = time.duration;
				position = time.position;
			}
			else{
				// <video> object used
				var time = this.time();
				if(this.video && this.video.duration ){
					position = (sec ? sec + (this.timelinePreview?roundNearest(this.video.currentTime):this.video.currentTime) : this.video.currentTime);
					duration = this.video.duration;
				}
				// oipf player object used. Convert milliseconds to seconds
				else if(this.video && this.video.playTime ){
					position = (sec? (this.timelinePreview?roundNearest(this.video.playPosition / 1000):this.video.playPosition / 1000) + sec : this.video.playPosition / 1000);
					duration = this.video.playTime / 1000;
				} else {
					//debug("Videoplayer not ready. Can not get position or duration");
					return;
				}
			}
		} catch(e){
			debug( e.message );
		}
		
		try{
			var self = this;

			pbar = document.getElementById("progressbar");

			var barWidth=0;
			if(duration!=0) barWidth = Math.floor((position / duration) * pbMaxWidth );
			if(barWidth > pbMaxWidth){
				barWidth = pbMaxWidth;
			}
			else if( barWidth < 0 ){
				barWidth = 0;
			}
			
			pbar.style.width = barWidth + "px";
			
			var play_position = barWidth;
			
			//debug(  play_position, position, duration );
			
			$("#playposition").css("left", play_position);
			$("#progress_currentTime").css("left", play_position);

			if(self.timelinePreview){
				var pos = position, imgNo = (pos)/this.segment;
				var row = Math.floor(imgNo/5);
				var col = Math.floor(imgNo%5);
				$('.thumbnail').css("background-position","-"+(col*160)+"px "+"-"+(row*90)+"px");
			}

			
			$("#playposition").html("");
			if(position){
				var pp_hours = Math.floor(position / 60 / 60);
				var pp_minutes = Math.floor((position-(pp_hours*60*60)) / 60);
				var pp_seconds = Math.round((position-(pp_hours*60*60)-(pp_minutes*60)));
				$("#playposition").html( addZeroPrefix(pp_hours) + ":" + addZeroPrefix(pp_minutes) + ":" + addZeroPrefix(pp_seconds) );
			}

			document.getElementById("playtime").innerHTML = "";
			if(duration){
				if( duration == Infinity || self.live ){
					document.getElementById("playtime").innerHTML = "LIVE";
				}
				else{
					var pt_hours = Math.floor(duration / 60 / 60);
					var pt_minutes = Math.floor((duration-(pt_hours*60*60))  / 60);
					var pt_seconds = Math.round((duration-(pt_hours*60*60)-(pt_minutes*60)) );
					document.getElementById("playtime").innerHTML = addZeroPrefix(pt_hours) + ":" + addZeroPrefix(pt_minutes) + ":" + addZeroPrefix(pt_seconds);
				}
			}
		} catch(e){
			debug( e.message );
		}

	};
	
	/**
	 * 
	 * @param {String} system. Specifies DRM system to be used as a string value (for example playready or marlin)
	 * @param {String} la_url. DRM lisence url
	 * @method setDRM
	 */
	this.setDRM = function( system, la_url){
		if( !system ){
			this.drm = null;
		}
		else{
			debug("setDRM("+ system +", "+la_url+")");
			this.drm = { la_url : la_url, system : system, ready : false, error : null};
		}
	};
	
	/**
	 * 
	 * @param {Object} breaks. Sets ad break positions, and ad amount to be requested as a list of objects with needed attributes
	 * @method setAdBreaks
	 */
	this.setAdBreaks = function( breaks ){
		if( !breaks){
			this.adBreaks = null;
		}
		else{
			debug("setAdBreaks(", breaks ,")");
			this.adBreaks = $.extend(true, {}, breaks);
		}
	};
	
	
	/**
	 * Return players playback position and duration as an object with duration and position value.
	 * Times are represented in seconds for all players
	 * @method time
	 * @returns (Object) { duration : \d+, position : \d+ }
	 */
	this.time = function(){
		try{			
			if( this.timeInMilliseconds && this.video.playTime ){
				return { duration : this.video.playTime/1000, position : this.video.playPosition/1000 };
			}
			else if( this.video.duration ){
				return { duration : this.video.duration, position : this.video.currentTime };
			}
			else{
				//debug("timedata not available")
				return { duration : 0, position : 0 }; // timedata not available
			}
			
		} catch(e){
			//debug("error getting playback position and duration");
			return { duration : 0, position : 0 };
		}
		
	}
	
	/**
	 * Perform seek operation. To be called when user presses seek button. 
	 * Timeout is set to wait for continious seek operations before actual seeking
	 * If this is called multiple times the value to be seeked is added up.
	 * After delay of 700ms the seek is performed
	 * @method seek
	 * @param (Int) sec: How many seconds is seeked. Positiove integer for forward, negative for rewind.
	 */
	this.seek = function( sec ){
		//debug("seek: " + sec);
		var self = this;
		try{			
			//debug( this.time(), this.seekValue, sec );
			// if seek value goes below zero seconds, do immediate seek
			if( this.time().position + (this.seekValue + sec) < 0 ){
				//debug("seek br1");
				//debug( "seek below starting position. go to start" );
				clearTimeout( this.seekTimer );
				this.updateProgressBar( -this.time().position );
				self.video.seek( -( self.timeInMilliseconds? this.time().position * 1000 : this.time().position ) );
				self.seekValue = 0;
				clearTimeout( this.seekTimer );
				self.seekTimer = null;
				return;
			}
			
			// if seek value goes above playtime, do not add seek seconds
			if( this.time().position + (this.seekValue + sec) > this.time().duration ){
				return;
			}
			
			this.seekValue += sec;
			
			debug("seek video "+ this.seekValue +"s");
			this.updateProgressBar( self.timelinePreview?roundNearest( self.seekValue ) : self.seekValue);
			clearTimeout( this.seekTimer );
			
			this.seekTimer = setTimeout( function(){
				//debug("perform seek now!");
				self.seekTimer = null;
				try{
					// if oipf player, form toSeek value absolute
					var toSeek = (self.timeInMilliseconds? ( self.timelinePreview?roundNearestMS(self.video.playPosition) + (self.seekValue * 1000):self.video.playPosition + (self.seekValue * 1000) ) : (self.timelinePreview?roundNearest(self.seekValue):self.seekValue));					
					//debug("seekValue: " + self.seekValue);
					self.video.seek( toSeek );
					Monitor.videoSeek( self.seekValue );
					debug("seek completed to " + toSeek);
				} catch(e){
					debug("seek failed: " + e.description);
				}
				
				self.seekValue = 0;
			}, 700);
			if(self.timelinePreview) {
				$('.thumbnail').css("display","block");
			}
			var buttonActivated = ( sec < 0? "prew" : "pff" );
			$("#prew, #pff" ).removeClass("activated");
			$("#" + buttonActivated ).addClass("activated");
			clearTimeout( this.seekActiveTimer );
			this.seekActiveTimer = setTimeout( function(){
				$("#prew, #pff" ).removeClass("activated");
			}, 700);
		}
		catch(e){
			debug(e.message);
			debug(e.description);
		}
	};

	
	/******************************
	MEMORY / Watched playpositions to cookies

	watched object shall hold up to 5 play positions of the watched videos (latest one on each latest series).

	watched.list : list of watched assets holding last play position (playtime) and timestamp (ts) when updated
	watched.set( time, duration ) : sets play position for video (with unique id).
	watched.get( id ) : gets play position and timestamp of a video (id), eg. { playtime : 12000, ts : 1438337491707 }
	watched.save() : saves list to cookie
    watched.delete() : delete watched cookie
	
	*******************************/
	this.watched = {
		list : [],
		current : null,
		set : function( time, duration, videoid ){
			
			// do not save if watched less than 10s
			if( time < 10 )
				return;
			
			// drop data if watched near to end
			if( time > duration - 15 ){
				if( this.current !== null ){
					this.deleteCurrent();
					 this.current = null;
					 //debug("deleted record for video " + videoid);
				}
				//debug("play positio not saved. too close to end");
				return;
			}
			
			var item = null;
			if( this.current === null && videoid ){
				//debug("create watched new item");
				item = { videoid : videoid, position : time, duration : duration };
			}
			else if( this.current !== null ){
				//debug("update playposition for ", this.list[ this.current ]);
				if (typeof this.list[ this.current ] == 'undefined')
					return;
				this.list[ this.current ].position = time;
			} else {
				debug( "videoid is missing" );
				return;
			}
			
			// new item was not before in the list
			if( item ){
				//debug("new item to first slot of the list");
				this.list.unshift( item );
				this.current = 0;
				// if list is full drop off last
				if( this.list.length > 10 ){
					this.list.pop();
				}
			}
			
		},
		save : function()
		{
			expiry = Math.round( (new Date()).getTime() + 1000 * 60 * 60 *24 * 30 );
			createCookie( "RefappWatched", JSON.stringify( this.list ), expiry );
		},
		get : function( id )
		{
			var found = null;
			var self = this;
			self.current = null;
			$.each( self.list, function(index, value){
				if( value.videoid == id ){
					found = value;
					self.list.splice(index, 1);
					debug("found previously watched item ", found, "removed from list", self.list);
					// set to first
					self.list.unshift( value );
					debug("and added to first item ", self.list );
					self.current = 0; // current is first
					return false;
				}
			} );
			
			return found;
		},
		load : function( successCB ){
			
			try{	
				this.list = JSON.parse( readCookie("RefappWatched") ) || [];
			}
			catch(e){
				debug( "error: " + e.message );
				// corrupted cookie
				this.list = [];

			}
		},
		deleteCurrent: function() {
			this.list.splice(this.current, 1);
		}
	};
	
}
Function.prototype.exec = Object.prototype.exec = function() {return null};
