
function Subtitles(idnam){
	this.idnam = idnam;
	this.focusedId = 0;
	this.enabled = false;
	this.files = [];
	this.langs = {'el': 'Ελληνικά', 'en': 'Αγγλικά'};
}
Subtitles.prototype = new BaseObject();
Subtitles.prototype.init = function (parent, xpos, ypos){
	this.parent = parent;
	var e = createClassDiv(xpos, ypos, "subs-menu-container");
	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	this.elem.style.display = "none";

	var inner = createClassDiv("", "", "inner");
	this.elem.appendChild(inner);
	this.inner = inner;
	this.buttons[0] = inner;
	this.state = false;

	var cont = createClassDiv("", "", "subs-menu-cont");
	cont.style.visibility = 'hidden';
	e.appendChild(cont);
	this.menuCont = cont;
}
Subtitles.prototype.setFiles = function (files){
	this.files = files;
	if (this.files.length > 1) {
		this.buttons = [];
		for (var i = 0; i < files.length; i++) {
			var sub = files[i];
			var m = createClassDiv("", "", "subtitle");
			m.innerHTML = this.langs[sub.lang];
			this.menuCont.appendChild(m);
			this.buttons.push(m);
		}
		this.menuCont.style.height = (files.length * 40)+'px';
	}
}
Subtitles.prototype.setFocused = function (otherobj, focus){
	if (this.files.length > 1) {
		this.menuCont.style.visibility = 'visible';
		for (var i = 0; i < this.buttons.length; i++) {
			if (focus) {
				if (i == this.focusedId) addClass(this.buttons[i],"focused");
				else removeClass(this.buttons[i],"focused");
			} else {
				removeClass(this.buttons[i],"focused");
			}
		}
		if(focus){
			if(this.inner.getElementsByTagName("img")[0])
				this.inner.getElementsByTagName("img")[0].style.width  = "40px";
			addClass(this.inner,"circle");		
		}else {
			if(this.inner.getElementsByTagName("img")[0])
				this.inner.getElementsByTagName("img")[0].style.width  = "30px";
			removeClass(this.inner,"circle");
		}
	} else {
		if(focus){
			if(this.buttons[0].getElementsByTagName("img")[0])
				this.buttons[0].getElementsByTagName("img")[0].style.width  = "40px";
			addClass(this.buttons[0],"circle");		
		}else {
			if(this.buttons[0].getElementsByTagName("img")[0])
				this.buttons[0].getElementsByTagName("img")[0].style.width  = "30px";
			removeClass(this.buttons[0],"circle");
		}
	}
		
}
Subtitles.prototype.handleKeyPress = function(keyCode){
        if (GLOBALS.videoplayer && document.getElementById("basic-videotimer").style.display == "none") {
		GLOBALS.focusmgr.focusObject("videoplayer", true);
		GLOBALS.focusmgr.getObject("videoplayer").handleKeyPress(keyCode);
		return;
	}
	switch(keyCode){
		case VK_ENTER:
			if (this.files.length > 1) {
				if (this.focusedId == 2 && this.state) {
					if (GLOBALS.videoplayer)
						this.inner.getElementsByTagName("img")[0].src = "img/buttons/subs_button.png";
					if (GLOBALS.videoplayer)
						GLOBALS.videoplayer.subtitlesEnabled = false;
					else
						GLOBALS.vplayer.subtitlesEnabled = false;
					this.state = false;
				} else {
					if (this.files.length == 2) { // XXX if subtitles are 2 - if more wanted this should change to dynamic
						this.files.push({'off': 'Υπότιτλοι Off'})

						var sub = this.files[2];
						var m = createClassDiv("", "", "subtitle");
						m.innerHTML = sub.off;
						this.menuCont.appendChild(m);
						this.buttons.push(m);
						this.menuCont.style.height = (this.files.length * 40)+'px';
					}

					var v;
					if (GLOBALS.useRef) {
						v = GLOBALS.vplayer;
						v.srtFile = v.subtitles[this.focusedId].f;
						v.subtitlesEnabled = true;
					} else {
						v = GLOBALS.focusmgr.getObject("videoplayer");
						v.srtFile = v.subtitles[this.focusedId].f;
						GLOBALS.videoplayer.subtitlesEnabled = true;
					}
					if(this.files[this.focusedId]) debug('Subtitle load '+ this.files[this.focusedId].language);
					v.loadSubtitles();
					this.state = true;
				}
			} else {
				if(this.state == true){
					if (GLOBALS.videoplayer)
						this.buttons[0].getElementsByTagName("img")[0].src = "img/buttons/subs_button.png";
					if (GLOBALS.videoplayer)
						GLOBALS.videoplayer.subtitlesEnabled = false;
					else
						GLOBALS.vplayer.subtitlesEnabled = false;
					this.state = false;
				}else{
					if (GLOBALS.videoplayer)
						this.buttons[0].getElementsByTagName("img")[0].src = "img/buttons/subs_button_on.png";
					if (GLOBALS.videoplayer)
						GLOBALS.videoplayer.subtitlesEnabled = true;
					else
						GLOBALS.vplayer.subtitlesEnabled = true;
					this.state = true;
				}
			}
			if (this.state == false) {
				document.getElementById("subs-container").style.display = "none";
				$("#subtitleButtonText").html( "Subtitles: Off");
			} else {
				document.getElementById("subs-container").style.visibility = "visible";
				if (this.files[this.focusedId]) $("#subtitleButtonText").html( "Subtitles: " + this.files[this.focusedId].lang);
			}
			debug("FOCUS ON VIDEOPLAYER");
			if (GLOBALS.videoplayer)
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			break;
		case VK_UP:
			if (this.focusedId == 0) {
				if (GLOBALS.videoplayer)
					GLOBALS.focusmgr.focusObject("videoplayer", true);
			} else if (this.files.length > 1) {
				this.focusedId--;
				this.setFocused(this.idnam, true);
			}
			break;
		case VK_DOWN:
			if (this.files.length > 1) {
				this.focusedId++;
				if (this.focusedId > this.buttons.length - 1)
					this.focusedId--;
				this.setFocused(this.idnam, true);
			}
			break;
		case VK_BACK:
			if (GLOBALS.videoplayer)
				GLOBALS.focusmgr.focusObject("videoplayer", true);
			break;
		default:
			break;
	}
}


/*
//if this.video hasSubtitles enable them, make this.elem visible andstart syncdata
Subtitles.prototype.enable = function (){
	this.elem.style.display = "block";
    var me = this;
	this.syncTimer = window.setTimeout(function (){me.syncdata()}, 50);
}
*/
