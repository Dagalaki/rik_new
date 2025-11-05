var ENABLE_CONSENT = 0, LOG = 0, DAI = false, ENABLE_MIDDLE=1, ENABLE_POSTROLL=1, sonyChrome, NEW_RADIO = 1, ENABLE_LOGIN=1, skaimenu=[];
var STATE_PLAYING = 1, STATE_STOP = 0, STATE_PAUSE = 2, STATE_CONNECTING = 3, STATE_BUFFERING = 4, STATE_FINISHED = 5, STATE_ERROR = 6;
var menu=null, keyLists =["home-cont", 'live','news', 'doc' ,'sports', 'shows', 'series', 'deltia', 'culture', 'child'];
function debug(s) {
	devmode2(s);
}
function getCookie(Name) {
	try {
		var offset, end, search = Name + "="
		if (document.cookie.length > 0) {
			offset = document.cookie.indexOf(search)
			if (offset != -1) {
				offset += search.length
				end = document.cookie.indexOf(";", offset)
				if (end == -1)
					end = document.cookie.length
				return unescape(document.cookie.substring(offset, end))
			}
			return ('');
		}
	} catch (e) {};
	return ('');
}

function setCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function deleteCookie(name) {
	if (getCookie(name)) {
		document.cookie = name + "=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
	}
}

function jsFehler(Nachricht, Datei, Zeile) {
	console.log(Nachricht, Datei, Zeile);
	if (GLOBALS.dev) {
		debug(Datei +' '+ Nachricht + ' line '+ Zeile);
		return;
	}
	var agt = navigator.userAgent.toLowerCase();
	var xtt = new Image;
	if (typeof Zeile == 'undefined') Zeile = 'movie-anixa-tv';
	var date = new Date();
	//var str = '[TIME: '+ date.getHours() +':'+date.getMinutes() + ']';
	var str = "";
	xtt.src = '/err.php?U=RIKAPP&P=jsErr:' + Zeile + '&M=' + escape(str + ' : ' + Nachricht + ':' + agt + ':' + Datei);
	return true;
}
try {
	 window.onerror = jsFehler;
	//else window.onerror = devmode2;

} catch (e) {}

function jsLog(Nachricht, Datei, Zeile) {

	var agt = navigator.userAgent.toLowerCase();
	var xtt = new Image;
	if (typeof Zeile == 'undefined') Zeile = 'movie-anixa-tv';
	var date = new Date();
	//var str = '[TIME: '+ date.getHours() +':'+date.getMinutes() + ']';
	var str = "";
	xtt.src = '/err.php?U=SKAIDEBUG&P=jsErr:' + Zeile + '&M=' + escape(str + ' : ' + Nachricht + ':' + agt + ':' + Datei);
	return true;
}
var FORMULA_APP_ID = 4;

var addTimer = false;
var NEW_FEATURE = false;
var CYCLIC_ON = false;
var IN_V2 = false;
var INFO_FEATURE = false;
var ctrl = 1;
var BTN_FULLSCREEN = 0;
var BTN_PLAY_PAUSE = 1;
var BTN_STOP = 2;
var BTN_REWIND = 3;
var BTN_FASTFORWARD = 4;

var SEL_OPEN = 0;
var SEL_CLOSED = 1;

var ON_XENES_SEIRES = 1;
var ON_EIDISEIS = 2;

var ON_VOD = 0;
var ON_MOSAIC = 1;
var ON_TRAILER = 2;
var ON_TABS = 3;

var isPlaying = false;
var invideoplayer = false;
var vid, full, anzeige;
var jumpInterval = 5;
var inicons = false;
var iconSel = 0;
var brtyp = navigator.userAgent.search(/TV/i) >= 0;
var tvbildPos = 134;
var SHOW_MENU_INFO = false;
var SHOW_BB = false;


/*if (location.host == 'smarttv.anixe.tv' || location.host == '127.0.0.1') {
	SHOW_MENU_INFO = true;
	SHOW_BB = true;
}*/

function hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}

function addClass(elem, className) {
    if (!hasClass(elem, className)) {
        elem.className += ' ' + className;
    }
}

function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
  
    if (hasClass(elem, className) ) {
        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}
Object.prototype.addClass = function (className) {
	if (!this.hasClass(className)) {
		if (this.className) this.className += " " + className;
		else this.className = className;
	}
};
Object.prototype.removeClass = function (className) {
	var regexp = this.addClass[className];
	if (!regexp) regexp = this.addClass[className] = new RegExp("(^|\\s)" + className + "(\\s|$)");
	this.className = this.className.replace(regexp, "$2");
};
Object.prototype.hasClass = function (className) {
	var regexp = this.addClass[className];
	if (!regexp) regexp = this.addClass[className] = new RegExp("(^|\\s)" + className + "(\\s|$)");
	return regexp.test(this.className);
};

function moves(tit) {
	if (tit == "") return;

	var piwik = new Image;
	sm = '';
	if (smarttv_id)
		sm = '&uid=' + smarttv_id;

	piwik.src = "http://lookcy.smart-tv-data.com/teletext.php?idsite=4&rec=1&action_name=" + encodeURIComponent(tit) + '&cookie=1&url=' + encodeURIComponent('http://rik.smart-tv-data.com/') + "&s=" + ON_Channel + sm;

	return true;
}


function shortTime(totalSeconds) {
	if (totalSeconds >= 3600) {
		hours = Math.floor(totalSeconds / 3600);
	}
	totalSeconds %= 3600;
	minutes = Math.floor(totalSeconds / 60);
	seconds = totalSeconds % 60;
	if (totalSeconds >= 3600) return "" + hours + ":" + minutes + ":" + seconds + "";
	else return "" + minutes + ":" + seconds + "";
}

function devmode(msg, obj) {
	return true;
}

function cleardebug() {
	if (GLOBALS.dev) {
		var deb = document.getElementById("log-message");
		deb.innerHTML = '';
		GLOBALS.debugCnt = 0;
	}
}
function devmode2(msg, obj) {
	if (GLOBALS.dev) {
		var a = document.getElementById("log-message").innerHTML.split('<br');
		if (a.length > 30) document.getElementById("log-message").innerHTML = "";
		document.getElementById("log-message").innerHTML += msg + "<br/>";
	}
}

function llog(msg, obj) {
	if (location.host == "127.0.0.1" || location.host == "smarttv.anixa.tv") {
		if (!obj) console.log(msg);
		else console.log(msg, ", ", obj);

	}

}

function lalert(msg) {
	if (location.host == "127.0.0.1") {
		alert(msg);
	} else llog(msg);

}




var GLOBALS = {
	"useDrm" : false,
	"userEmail" : '',
	"userId" : 0,
	"upperLimit": 0,
	"useRef": false,
	"vplayer" : null,
	"menu": null,
	"sid": null,
	"tsid": null,
	"onid": null,
	"user_country": "GR",
	"brtyp": navigator.userAgent.search(/TV/i) >= 0,
	"pageId": 0,
	"posi": null,
	"mode": null,
	"offset": 0,
	"upperLimit": 0,
	"baseurl": "",
	"focusmgr": null,
	"scenemgr": null,
	"demomode": null,
	"allowbroadcast": true,
	"keyevent": "",
	"philipsbug": false,
	"nosoundOn": false,
	"videoplayer": null,
	"muter": null,
	"jumpTimer": null,
	"ignoreKeyCodes": {},
	"lastPlayId": 0,
	"cat": '',
	"show": '',
	"middleRollDone": 0,
	"adsCnt": 0,
	"adLoop": false,
	"middleTimer": null,
	"adTimer": null,
	"ui" : ui,
	"PREVIEW": false,
	"keyeventlistener": function (e) {

		if (GLOBALS.demomode && (e.ctrlKey || e.altKey || e.metaKey)) {
			return;
		}
		var kc = e.keyCode,
			handled;
		if (!kc) {
			kc = e.charCode;
			alert(kc);
		}
		handled = GLOBALS.focusmgr.handleKeyCode(kc);
		if (handled) {

			e.preventDefault();
		}


		return handled;
	}
};

if (typeof KeyEvent !== 'undefined') {
	if (typeof KeyEvent.VK_LEFT !== 'undefined') {
		var VK_LEFT = KeyEvent.VK_LEFT;
		var VK_UP = KeyEvent.VK_UP;
		var VK_RIGHT = KeyEvent.VK_RIGHT;
		var VK_DOWN = KeyEvent.VK_DOWN;
	}
	if (typeof KeyEvent.VK_ENTER !== 'undefined') {
		var VK_ENTER = KeyEvent.VK_ENTER;
	}
	if (typeof KeyEvent.VK_RED !== 'undefined') {
		var VK_RED = KeyEvent.VK_RED;
		var VK_GREEN = KeyEvent.VK_GREEN;
		var VK_YELLOW = KeyEvent.VK_YELLOW;
		var VK_BLUE = KeyEvent.VK_BLUE;
	}
	if (typeof KeyEvent.VK_PLAY !== 'undefined') {
		var VK_PLAY = KeyEvent.VK_PLAY;
		var VK_PAUSE = KeyEvent.VK_PAUSE;
		var VK_STOP = KeyEvent.VK_STOP;
	}
	if (typeof KeyEvent.VK_FAST_FWD !== 'undefined') {
		var VK_FAST_FWD = KeyEvent.VK_FAST_FWD;
		var VK_REWIND = KeyEvent.VK_REWIND;
	}
	if (typeof KeyEvent.VK_NEXT !== 'undefined') {
		var VK_NEXT = KeyEvent.VK_NEXT;
		var VK_PREV = KeyEvent.VK_PREV;
	}
	if (typeof KeyEvent.VK_BACK !== 'undefined') {

		var VK_BACK = KeyEvent.VK_BACK;
	}
	if (typeof KeyEvent.VK_0 !== 'undefined') {
		var VK_0 = KeyEvent.VK_0;
		var VK_1 = KeyEvent.VK_1;
		var VK_2 = KeyEvent.VK_2;
		var VK_3 = KeyEvent.VK_3;
		var VK_4 = KeyEvent.VK_4;
		var VK_5 = KeyEvent.VK_5;
		var VK_6 = KeyEvent.VK_6;
		var VK_7 = KeyEvent.VK_7;
		var VK_8 = KeyEvent.VK_8;
		var VK_9 = KeyEvent.VK_9;
	}
}
if (typeof VK_LEFT === 'undefined') {
	var VK_LEFT = 0x25;
	var VK_UP = 0x26;
	var VK_RIGHT = 0x27;
	var VK_DOWN = 0x28;
}
if (typeof VK_ENTER === 'undefined') {
	var VK_ENTER = 0x0d;
}
if (typeof VK_RED === 'undefined') {
	var VK_RED = 0x74;
	var VK_GREEN = 0x75;
	var VK_YELLOW = 0x76;
	var VK_BLUE = 0x77;
}
if (typeof VK_PLAY === 'undefined') {
	var VK_PLAY = 0x50;
	var VK_PAUSE = 0x51;
	var VK_STOP = 0x53;
}
if (typeof VK_FAST_FWD === 'undefined') {
	var VK_FAST_FWD = 0x46;
	var VK_REWIND = 0x52;
}
if (typeof VK_NEXT === 'undefined') {
	var VK_NEXT = -1;
	var VK_PREV = -1;
}
if (typeof VK_BACK === 'undefined') {
	var VK_BACK = 0xa6;
}
if (typeof VK_0 === 'undefined') {
	var VK_0 = 0x30;
	var VK_1 = 0x31;
	var VK_2 = 0x32;
	var VK_3 = 0x33;
	var VK_4 = 0x34;
	var VK_5 = 0x35;
	var VK_6 = 0x36;
	var VK_7 = 0x37;
	var VK_8 = 0x38;
	var VK_9 = 0x39;
}

function FocusManager(basekeyset) {
	this.allObjects = {};
	this.focusableObjects = {};
	this.currentFocus = null;
	this.onFocusChange = null;
	this.patchThruEventsIfHidden = false;
	this.hidden = false;
	this.currentKeyset = 0;
	this.keysethidden = 0;
	this.keysets = [basekeyset];
	this.keysetslen = 1;
	this.handleGlobalKey = null;
}
FocusManager.KEYSET_DISABLED = 0;
FocusManager.KEYSET_ENABLED = 1;
FocusManager.KEYSET_ENHNAVIG = 2;
FocusManager.KEYSET_TEXTENTRY = 3;
FocusManager.KEYSET_PLAYBACK = 4;
FocusManager.prototype.setBaseKeyset = function (stage) {
	this.keysets[0] = stage;
	if (this.keysetslen === 1 && !this.hidden) {
		this.registerKeysInternal(stage);
	}
};
FocusManager.prototype.pushKeyset = function (stage) {
	this.keysets[this.keysetslen++] = stage;
	if (!this.hidden) {
		this.reconfigKeyset();
	}
};
FocusManager.prototype.popKeyset = function () {
	if (this.keysetslen > 1) {
		this.keysetslen--;
	}
	if (!this.hidden) {
		this.reconfigKeyset();
	}
};
FocusManager.prototype.setHidden = function (newhidden) {
	this.hidden = newhidden;
	this.reconfigKeyset();
};
FocusManager.prototype.reconfigKeyset = function () {
	this.registerKeysInternal(this.hidden ? this.keysethidden : this.keysets[this.keysetslen - 1]);
};
FocusManager.prototype.calculateKeyMaskInternal = function (stage) {

	var mask = 0x01 + 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x100 + 0x400;
	return mask;
};
FocusManager.prototype.registerKeysInternal = function (stage) {
	this.currentKeyset = stage;
	var mask = this.calculateKeyMaskInternal(stage);
	try {
		var app = document.getElementById('appmgr').getOwnerApplication(document);
		app.privateData.keyset.setValue(mask);
	} catch (e) {}
	try {
		document.getElementById('oipfcfg').keyset.value = mask;
	} catch (e2) {}
};
FocusManager.prototype.getObject = function (idnam) {
	return this.allObjects[idnam];
};
FocusManager.prototype.focusToStr = function (idnam) {
	if (idnam.indexOf('home-list') != -1) {
		return "Αρχική";
	} else if (idnam.indexOf('news-list') != -1) {
		return "Ενημέρωση";
	} else if (idnam.indexOf('shows-list') != -1) {
		return "Ψυχαγωγία";
	} else if (idnam.indexOf('series-list') != -1) {
		return "Σειρές";
	} else if (idnam.indexOf('doc-list') != -1) {
		return "Ντοκιμαντέρ";
	}
	var focusToStr = idnam;
	switch (idnam) {
		case "search":
			focusStr = "Αναζήτηση";
			break;
		case "epg":
			focusStr = "Πρόγραμμα";
			break;
		case "episodes-shows":
			var list_idnam = "shows-list";
			var o = GLOBALS.focusmgr.getObject(list_idnam);
			focusStr = o.buttons[o.focusedId].getElementsByClassName("title")[0].innerHTML;
			break;
		case "episodes-news":
			var list_idnam = "news-list";
			var o = GLOBALS.focusmgr.getObject(list_idnam);
			focusStr = o.buttons[o.focusedId].getElementsByClassName("title")[0].innerHTML;

			break;
		case "episodes-series":
			var list_idnam = "series-list";
			var o = GLOBALS.focusmgr.getObject(list_idnam);
			focusStr = o.buttons[o.focusedId].getElementsByClassName("title")[0].innerHTML;
			break;
		case "episodes-search":
			var list_idnam = "search-results-list";
			var o = GLOBALS.focusmgr.getObject(list_idnam);
			focusStr = o.buttons[o.focusedId].getElementsByClassName("title")[0].innerHTML;
			break;
		default:
			focusStr = idnam;
			break;
	}
	return focusStr;
}
FocusManager.prototype.focusObject = function (idnam) {
	if (0 && this.currentFocus && LOG)
		console.log(this.currentFocus.idnam, idnam);
	if (0 && this.currentFocus )
		debug(this.currentFocus.idnam+' '+ idnam);

	if (this.currentFocus && this.currentFocus.idnam === idnam) {
		return;
	}
	var oldFocus = this.currentFocus;
	var newFocus = this.allObjects[idnam];
	if (idnam == "controls") lalert("[focusObject]" + newFocus);

	if (oldFocus) {

		oldFocus.setFocused(newFocus, false);
	}

	oldFocus = this.currentFocus;
	this.currentFocus = newFocus || null;
	if (newFocus) {

		//focusStr = this.focusToStr(idnam);
		//lalert(focusStr);
		//moves('active/' + focusStr);
		newFocus.setFocused(oldFocus, true);
	}

	if (this.onFocusChange) {
		try {
			this.onFocusChange();
		} catch (e) {
			console.log('error on focusObject');
		}
	}
};
FocusManager.prototype.unregisterObject = function (obj) {
	var idnam = obj.idnam;
	if (this.currentFocus && this.currentFocus.idnam === idnam) {
		this.currentFocus.setFocused(false, false);
		this.currentFocus = null;
	}
	delete this.allObjects[idnam];
	delete this.focusableObjects[idnam];
};
FocusManager.prototype.findNewFocus = function (direction) {

	var currentx, currenty, currentw, currenth;
	var currentpx, currentpy;
	if (this.currentFocus) {
		this.currentFocus.updateBounds();
		currentx = this.currentFocus.xpos;
		currenty = this.currentFocus.ypos;
		currentw = this.currentFocus.width;
		currenth = this.currentFocus.height;
		currentpx = currentx + currentw - 1;
		currentpy = currenty + currenth - 1;
	} else {
		currentx = 0;
		currenty = 0;
		currentw = 1280;
		currenth = 0;
		currentpx = 1280;
		currentpy = 0;
	}
	var mindiffx = -currentw + 3;
	var mindiffy = -currenth + 3;
	var ret = null;
	var mindist = 10000000;
	var px, py, celem, dist;
	var currentFocusIdnam = this.currentFocus ? this.currentFocus.idnam : null;
	var idnam;
	for (idnam in this.focusableObjects) {
		if (idnam === currentFocusIdnam) {
			continue;
		}

		celem = this.focusableObjects[idnam];
		if (!celem || typeof celem == 'undefined' || typeof celem.updateBounds != 'function')
			continue;

		celem.updateBounds();
		px = celem.xpos + celem.width - 1;
		py = celem.ypos + celem.height - 1;
		switch (direction) {
			case 1:
				dist = this.calcFocusDist(currenty - py, mindiffy, currentx, currentpx, celem.xpos, px);
				break;
			case 2:
				dist = this.calcFocusDist(celem.ypos - currentpy, mindiffy, currentx, currentpx, celem.xpos, px);
				break;
			case 3:
				dist = this.calcFocusDist(currentx - px, mindiffx, currenty, currentpy, celem.ypos, py);
				break;
			default:
				dist = this.calcFocusDist(celem.xpos - currentpx, mindiffx, currenty, currentpy, celem.ypos, py);
				break;
		}
		if (mindist > dist) {
			ret = celem;
			mindist = dist;
		}
	}
	return ret;
};
FocusManager.prototype.calcFocusDist = function (walkDiff, minWalkDiff, myPos1, myPos2, otherPos1, otherPos2) {
	var isbad = false;
	if (walkDiff < minWalkDiff) {
		return 10000000;
	}
	if (walkDiff < 0) {
		walkDiff = -walkDiff * 2;
		isbad = true;
	}
	if ((myPos1 <= otherPos1 && myPos2 >= otherPos2) || (myPos1 >= otherPos1 && myPos2 <= otherPos2)) {
		return walkDiff;
	}
	var otherDiff = myPos1 + myPos2 - otherPos1 - otherPos2;
	if (otherDiff < 0) {
		otherDiff = -otherDiff;
	}
	if (!isbad && ((myPos1 < otherPos1 && otherPos1 < myPos2) || (myPos1 < otherPos2 && otherPos2 < myPos2))) {
		otherDiff /= 3;
	} else {
		otherDiff *= 2;
		walkDiff *= 3;
	}
	return otherDiff + walkDiff;
};
FocusManager.prototype.handleOkPress = function () {
	if (this.currentFocus) {
		this.currentFocus.handleKeyPress(VK_ENTER);
	}
};
FocusManager.prototype.handleFocusMove = function (direction) {
	var newFocus = this.findNewFocus(direction);
	if (newFocus) {
		this.focusObject(newFocus.idnam);
	}
};
FocusManager.prototype.handleKeyCode = function (keyCode) {
	if(GLOBALS.vplayer && GLOBALS.vplayer.isVisible() && GLOBALS.vplayer.isFullscreen()){
	    if(!GLOBALS.vplayer.onExtraBtns) GLOBALS.vplayer.navigate(keyCode);
		else GLOBALS.vplayer.navigateBottom(keyCode);
		
	    return true;
  	}

	//if(this.currentFocus.idnam == "controls") return true;

	if (this.currentFocus && this.currentFocus.handleKeyPress(keyCode)) {

		return true;
	}

	return false;

	/*
	    if (GLOBALS.ignoreKeyCodes.hasOwnProperty(keyCode)) {
	   
	        return false;
	    }
	if (this.hidden && !this.patchThruEventsIfHidden) {
	   
	        
	        if (this.handleGlobalKey && this.handleGlobalKey(keyCode)) {
	            return true;
	        }
	        return false;
	    }
	    if (this.currentFocus && this.currentFocus.handleKeyPress(keyCode)) {
	    
	        return true;
	    }
	    if (this.handleGlobalKey && this.handleGlobalKey(keyCode)) {
	       
	       
	     
	        return true;
	    }
	    if (this.patchThruEventsIfHidden && this.hidden) {
	     
	        return false;
	    }
	    if (keyCode === VK_LEFT || keyCode === VK_RIGHT || keyCode === VK_UP || keyCode === VK_DOWN || keyCode === VK_ENTER) {
	      
	        return true;
	    }
	   
	    return false;
	    */
};
FocusManager.prototype.numberKeyToInt = function (keyCode) {
	if (keyCode === VK_0) {
		return 0;
	}
	if (keyCode === VK_1) {
		return 1;
	}
	if (keyCode === VK_2) {
		return 2;
	}
	if (keyCode === VK_3) {
		return 3;
	}
	if (keyCode === VK_4) {
		return 4;
	}
	if (keyCode === VK_5) {
		return 5;
	}
	if (keyCode === VK_6) {
		return 6;
	}
	if (keyCode === VK_7) {
		return 7;
	}
	if (keyCode === VK_8) {
		return 8;
	}
	if (keyCode === VK_9) {
		return 9;
	}
	return -1;
};
FocusManager.prototype.charKeyToString = function (keyCode) {
	if (GLOBALS.samsungav) {
		return null;
	}
	if ((keyCode > 0x40 && keyCode < 0x5b) || keyCode === 0x20) {
		return String.fromCharCode(keyCode);
	}
	return null;
};

function HideManager(hideelemid, appelemid) {
	this.hidemsgtimer = null;
	this.hidemsgelem = hideelemid ? document.getElementById(hideelemid) : null;
	this.appscreenelem = appelemid ? document.getElementById(appelemid) : null;
	this.onchangelisteners = [];
	this.hidemsgtimeout = 7000;
}
HideManager.prototype.setHidden = function (hidden, hidemsgtimeout) {
	if (this.hidemsgtimer) {
		clearTimeout(this.hidemsgtimer);
		this.hidemsgtimer = null;
	}
	GLOBALS.focusmgr.setHidden(hidden);
	if (this.appscreenelem) {
		this.appscreenelem.style.visibility = hidden ? 'hidden' : 'inherit';
		if (!hidden) {
			this.appscreenelem.style.display = 'block';
		}
	}
	if (this.hidemsgelem) {
		this.hidemsgelem.style.display = hidden ? 'block' : 'none';
		if (hidden) {
			var me = this;
			var timout = hidemsgtimeout || this.hidemsgtimeout;
			this.hidemsgtimer = setTimeout(function () {
				me.hidemsgtimer = null;
				me.hidemsgelem.style.display = "none";
			}, timout);
		}
	}
	this.onchange(hidden);
};
HideManager.prototype.onchange = function (hidden) {
	/* if (hidden) {
	     GLOBALS.videohandler.setFullSize();
	 } else {
	     GLOBALS.videohandler.restoreSize();
	 }*/
	var i;
	for (i = 0; i < this.onchangelisteners.length; i++) {
		try {
			this.onchangelisteners[i](hidden);
		} catch (e) {}
	}
};

function BaseObject() {}
BaseObject.prototype.baseInit = function (elem) {
	if (elem || !this.elem) {
		this.elem = elem || document.getElementById(this.idnam);
	}
	this.focusable = false;
	this.requireUpdateBounds = true;
};
BaseObject.prototype.register = function () {

	GLOBALS.focusmgr.allObjects[this.idnam] = this;
};
BaseObject.prototype.unregister = function () {
	this.focusable = false;
	GLOBALS.focusmgr.unregisterObject(this);
};
BaseObject.prototype.setFocusable = function (enabled) {
	this.focusable = enabled;
	if (enabled) {
		GLOBALS.focusmgr.focusableObjects[this.idnam] = this;
	} else {
		delete GLOBALS.focusmgr.focusableObjects[this.idnam];
	}
};
BaseObject.prototype.updateBounds = function () {
	if (!this.requireUpdateBounds) {
		return false;
	}
	this.requireUpdateBounds = false;
	var cobj = this.elem;
	this.width = cobj.offsetWidth;
	this.height = cobj.offsetHeight;
	var x, y;
	if (!this.width || !this.height) {
		this.xpos = parseInt(cobj.style.left, 10);
		this.ypos = parseInt(cobj.style.top, 10);
		this.width = parseInt(cobj.style.width, 10);
		this.height = parseInt(cobj.style.height, 10);
		if (isNaN(this.width) || isNaN(this.height)) {
			this.width = 0;
			this.height = 0;
			return true;
		}
		while (cobj.parentNode && cobj.parentNode !== document.body) {
			cobj = cobj.parentNode;
			x = parseInt(cobj.style.left, 10);
			y = parseInt(cobj.style.left, 10);
			if (isNaN(x) || isNaN(y)) {
				break;
			}
			this.xpos += x;
			this.xpos += y;
		}
		return true;
	}
	this.xpos = 0;
	this.ypos = 0;
	while (cobj.offsetParent) {
		this.xpos += cobj.offsetLeft;
		this.ypos += cobj.offsetTop;
		cobj = cobj.offsetParent;
	}
	return true;
};
BaseObject.prototype.setBounds = function (xpos, ypos, width, height) {
	this.elem.style.width = width + 'px';
	this.elem.style.height = height + 'px';
	this.setPosition(xpos, ypos);
};
BaseObject.prototype.setPosition = function (xpos, ypos) {
	this.elem.style.left = xpos + 'px';
	this.elem.style.top = ypos + 'px';
	this.requireUpdateBounds = true;
};
BaseObject.prototype.setDimension = function (width, height) {
	this.elem.style.width = width + 'px';
	this.elem.style.height = height + 'px';
	this.requireUpdateBounds = true;
};
BaseObject.prototype.setFocused = function (otherobj, focused) {};
BaseObject.prototype.requestFocus = function () {
	GLOBALS.focusmgr.focusObject(this.idnam);
};
BaseObject.prototype.handleKeyPressInternal = function (keyCode) {
	if (keyCode === VK_RED) {
		this.onRed();
	}
	if (keyCode === VK_GREEN) {
		this.onGreen();

		return true;
	}
	if (keyCode === VK_YELLOW) {
		this.onYellow();
		return true;
	}
	if (keyCode === VK_BLUE) {
		this.onBlue();
		return true;
	}
	if (keyCode === VK_LEFT) {
		if (this.onleft) {
			this.onleft();
		} else {
			GLOBALS.focusmgr.handleFocusMove(3);
		}
		return true;
	}
	if (keyCode === VK_RIGHT) {
		if (this.onright) {
			this.onright();
		} else {
			GLOBALS.focusmgr.handleFocusMove(4);
		}
		return true;
	}
	if (keyCode === VK_UP) {
		if (this.onup) {
			this.onup();
		} else {
			GLOBALS.focusmgr.handleFocusMove(1);
		}
		return true;
	}
	if (keyCode === VK_DOWN) {
		if (this.ondown) {
			this.ondown();
		} else {
			GLOBALS.focusmgr.handleFocusMove(2);
		}
		return true;
	}
	if (keyCode === VK_ENTER) {
		if (this.onok) {
			this.onok();
		}
		return true;
	}
	if (keyCode === VK_BACK && this.onback) {

		this.onback();
		return true;
	}
	return false;
};

BaseObject.prototype.onRed = function () {
	location.href = '/home/index.php?s=' + aktueller_sender;
}

BaseObject.prototype.onGreen = function () {
	if (document.getElementById("log-message").style.display == "none")
		document.getElementById("log-message").style.display = "block";
	else
		document.getElementById("log-message").style.display = "none";
	/*var o = GLOBALS.focusmgr.getObject("skai");
	document.getElementsByClassName("sidebar")[0].style.visibility = "hidden";
            var bbId = 67280;
            o.loadJson("bigbrother", bbId);
            //o.createBigBrother();
            llog(GLOBALS.scenemgr.sceneStack);*/
	return true;

}

BaseObject.prototype.onYellow = function () {
	var o = GLOBALS.focusmgr.getObject("side-bar");
	if (o.elem.hasClass('open'))
		o.close();
	else {
		o.open();
		GLOBALS.focusmgr.focusObject("submenu-" + o.focusedId, true);
	}

	return true;

}

BaseObject.prototype.onBlue = function () {
	if (GLOBALS.dev) {
		if(document.getElementById("log-message").style.display == "none") document.getElementById("log-message").style.display = "block";
		else if(document.getElementById("log-message").style.display == "block") document.getElementById("log-message").style.display = "none";
	} else {
		cleardebug();
		var res = document.getElementById('show-smid');
		if (res) {
			var bl = res.style.display;
			if (bl == 'none') {
				res.style.display = 'block';
				document.getElementById("speed-result").innerHTML = 'Μέτρηση ταχύτητας...';

				testDownload();
			} else
				res.style.display = 'none';
		} else {
			var e = createClassDiv("", "", "show-smid");
			e.id = 'show-smid';

			var sp = createClassDiv("", "", "speed");
			sp.id = 'speed-result';
			sp.innerHTML = 'Μέτρηση ταχύτητας...';

			e.innerHTML = 'SmartID: '+ GLOBALS.smid;
			e.appendChild(sp);
			var ag = createClassDiv("", "", "agent-res");
			ag.id = 'agent-result';
			ag.innerHTML = navigator.userAgent;
			e.appendChild(ag);

			if(document.getElementById("appscreen"))
				document.getElementById("appscreen").appendChild(e);

			testDownload();
		}

		function testDownload() {
			var start = 0, FILE_URL_SPEED_TEST = "testfile.m4v";
			var end = 0;
			start = new Date().getTime();
			var msg = null;

			var xhr = new XMLHttpRequest();
			xhr.open("GET", FILE_URL_SPEED_TEST + "?id=" + start, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						end = new Date().getTime();
						diff = (end - start) / 1000;

						msg = typeof xhr.response == "undefined" ? xhr.responseText : xhr.response;
						bytes = msg.length;

						speed = (bytes / diff) / 1024 / 1024 * 8;
						speed = Math.round(speed*100)/100;

						setDownloadResult(speed);
					} else {
						setDownloadResult(0);
					}
				}
			}
			xhr.send();
		};

		function setDownloadResult(speed) {
			var spdRes = document.getElementById('speed-result');
			if(spdRes){
				if (speed > 0) {
					spdRes.innerHTML = 'Η ταχύτητα download βρέθηκε να είναι <b>' + speed + ' Mbit/sec.</b><br/>Το λιγότερο που χρειάζεται είναι 5 Mbit/sec για HD περιεχόμενο, 8 Mbit/sec<br/>για Full-HD και 10 Mbit/sec για UHD περιεχόμενο.';

					sendSpeed(speed);
				}
				if (speed == 0) {
					spdRes.innerHTML = 'Σφάλμα στην μέτρηση download!';
				}
			}
		}
	}
	return true;
}
function sendSpeed(speed) {
	debug('send speed '+ speed);
	var xhr = new XMLHttpRequest(), o = {};
	o.speed = speed;
	o.url = 'speed';
	o.smid = GLOBALS.smid;
	o.ua = navigator.userAgent;
	var data = JSON.stringify(o), url = 'smidlog.php';

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200) {
				var j = JSON.parse(this.responseText);
				//debug('Got response :'+ JSON.stringify(j));
			} else {
				debug('status '+this.status);
			}
		}
	}
	xhr.send(data);
}

BaseObject.prototype.handleKeyPress = function (keyCode) {
	return this.handleKeyPressInternal(keyCode);
};

function initHbbTV(basekeyset) {


	try {
		if (navigator && navigator.appVersion && navigator.appVersion.indexOf("PHILIPS_OLS_") > 0) {
			GLOBALS.philipsbug = true;
			if (GLOBALS.keyevent === "") {
				GLOBALS.keyevent = "keypress";
			}
		}
	} catch (e) {}
	if (GLOBALS.keyevent === "") {
		GLOBALS.keyevent = "keydown";
	}
	GLOBALS.focusmgr = new FocusManager(basekeyset);
	document.addEventListener(GLOBALS.keyevent, GLOBALS.keyeventlistener, false);

	//EVI - new video timer
	var ag = navigator.userAgent.toUpperCase();
	if (ag.indexOf("SHARP") < 0) {
		document.addEventListener("keyup", function (e) {
			if (GLOBALS.focusmgr.getObject("videoplayer")) {
				var o = GLOBALS.focusmgr.getObject("videoplayer");
				if (o.inTrickMode) {
					if (o.jumpTimer) {
						var duration, vid = document.getElementById("video"),
							offset = o.rew ? -o.jumpInterval : o.jumpInterval;
						if (GLOBALS.brtyp) {
							duration = Math.floor(vid.playTime / 1000);
							GLOBALS.posi = Math.floor(vid.playPosition / 1000);
						} else {
							duration = Math.floor(vid.duration);
							GLOBALS.posi = Math.floor(vid.currentTime);
						}
						o.enableTrickMode(offset, duration);
						o.rew = 0;
					}
					o.releaseTrickMode();
					o.inTrickMode = false;
					return true;
				}
			}

		}, false);

	} //not for vestel

	/*document.addEventListener("keydown",function(){
	    alert("keydown");
	});*/
}

function closeHbbTV() {
	try {
		document.removeEventListener(GLOBALS.keyevent, GLOBALS.keyeventlistener, false);
	} catch (e) {}
	try {
		GLOBALS.videohandler.setFullSize();
		GLOBALS.videohandler.setBroadcast();
	} catch (e1) {}
	try {
		GLOBALS.focusmgr.allObjects = null;
		GLOBALS.focusmgr.focusableObjects = null;
	} catch (e2) {}
	GLOBALS.focusmgr = null;
	GLOBALS.videohandler = null;
	GLOBALS.keyeventlistener = null;
}

function showApplication() {
	if (GLOBALS.samsungav) {
		try {
			setTimeout(function () {
				window.curWidget.setPreference("ready", "true");
			}, 1);
		} catch (ignore) {}
	}
	try {
		var app = document.getElementById('appmgr').getOwnerApplication(document);
		app.show();
		app.activate();
		app.show();
	} catch (e) {}
}

function shortenText(txt, maxch) {
	if (txt.length < maxch) {
		return txt;
	}
	if (maxch < 5) {
		return '';
	}
	txt = txt.substring(0, maxch - 4);
	var i = txt.lastIndexOf(' ');
	if (i > 0) {
		txt = txt.substring(0, i + 1);
	} else {
		i = txt.lastIndexOf('&');
		if (i > 0 && i > txt.length - 8) {
			txt = txt.substring(0, i);
		}
	}
	i = txt.lastIndexOf('<');
	if (i > 0) {
		txt = txt.substring(0, i);
	}
	return txt + '...';
}

function wrapTextLines(txt, charsperline) {
	var lines = 1,
		i = 0,
		j, t;
	while (txt.length - i > charsperline) {
		t = txt.substring(i, Math.min(txt.length, i + charsperline));
		j = t.lastIndexOf(" ");
		if (j < 0) {
			j = i + charsperline - 1;
			txt = txt.substring(0, j) + "-<br />" + txt.substring(j);
			i = j + 7;
		} else {
			j += i;
			txt = txt.substring(0, j) + "<br />" + txt.substring(j + 1);
			i = j + 6;
		}
		lines++;
	}
	return [lines, txt];
}

function textHtmlEncode(txt, handleNl) {
	txt = toStr(txt).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	if (handleNl) {
		txt = txt.replace(/\n/g, "<br />");
	}
	return txt;
}

function createDiv(xpos, ypos, width, height, className) {
	var ret = document.createElement("div");
	//  ret.style.overflow = 'hidden ';
	ret.style.left = xpos + 'px';
	ret.style.top = ypos + 'px';
	if (width !== false) {
		ret.style.width = width + 'px';
	}
	if (height !== false) {
		ret.style.height = height + 'px';
	}
	if (className) {
		ret.className = className;
	}
	return ret;
}

function createClassDiv(xpos, ypos, className) {
	var ret = document.createElement('div');
	if (xpos !== false) {
		ret.style.left = xpos + 'px';
	}
	if (ypos !== false) {
		ret.style.top = ypos + 'px';
	}
	ret.className = className;
	return ret;
}

function selectDvbService(onid, tsid, sid) {
	if (GLOBALS.videohandler.url) {
		GLOBALS.videohandler.setBroadcast();
		setTimeout(function () {
			selectDvbService(onid, tsid, sid);
		}, 3000);
	}
	var vid = GLOBALS.videohandler.vid,
		ch = null,
		clist = null;
	try {
		clist = vid.getChannelConfig().channelList;
		ch = clist.getChannelByTriplet(onid, tsid, sid);
		if (ch && vid.setChannel) {
			vid.setChannel(ch, false);
			return true;
		}
	} catch (e) {}
	try {
		vid.setChannelByTriplet(onid, tsid, sid, true);
		return true;
	} catch (e2) {}
	return false;
}

function buildCssUrl(url, doescape) {
	if (!url) {
		return "";
	}
	if (doescape) {
		url = url.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\"/g, "%22").replace(/'/g, "%27");
	}
	return 'url("' + url + '")';
}

function toStr(o) {
	return "" + o;
}

function abortHttpRequest(req) {
	if (req) {
		try {
			req.abort();
		} catch (ignore) {}
	}
}

function createHttpRequest(url, callback, options) {
	var req = new XMLHttpRequest();
	//req.timeout = 500;
	if (callback) {
		req.onreadystatechange = function () {
			if (req.readyState !== 4) {
				return;
			}
			if (callback) {
				try {
					if (req.status >= 200 && req.status < 300) {
						callback(req.responseText);
					} else {
						callback(null);
					}
				} catch (e) {
					if (console && console.log && LOG) {
						llog('Error while processing URL ' + url + ': ' + e + ' - Result was: ' + req.status + '/' + req.responseText);
						llog(e);
					}
				}
			}
			req.onreadystatechange = null;
			req = null;
		};
	}
	if (GLOBALS.baseurl && url.indexOf(':/') < 1) {
		url = GLOBALS.baseurl + url;
	}
	try {
		req.open((options ? options.method : null) || 'GET', url, true);
		if (!options || !options.dosend) {
			req.send(null);
		} else {
			options.dosend(req);
		}
	} catch (e) {
		req.onreadystatechange = null;
		if (GLOBALS.demomode && console && console.log && LOG) {
			llog(["Cannot open URL " + url, e]);
		}
		try {
			callback(null);
		} catch (e2) {}
		req = null;
	}
	return req;
}

function parseJSON(txt) {
	if (!txt) {
		return null;
	}
	var startpos = 0,
		endpos = txt.length - 1,
		fchar, lchar;
	while (startpos + 1 < endpos && txt.charCodeAt(startpos) < 33) {
		startpos++;
	}
	while (endpos - 1 > startpos && txt.charCodeAt(endpos) < 33) {
		endpos--;
	}
	fchar = txt.substring(startpos, startpos + 1);
	lchar = txt.substring(endpos, endpos + 1);
	if ((fchar === '[' && lchar === ']') || (fchar === '{' && lchar === '}')) {
		try {
			txt = txt.substring(startpos, endpos + 1);
			return eval('(' + txt + ')');
		} catch (e) {}
	}
	return null;
}


function TimeHelper() {
	this.timediffLocal = 0;
	this.timediffUTC = 0;
	this.progdaystart = 5.5;
	this.daynames = ["ÎšÎ¥Î¡Î™Î‘ÎšÎ—", "Î”Î•Î¥Î¤Î•Î¡Î‘", "Î¤Î¡Î™Î¤Î—", "Î¤Î•Î¤Î‘Î¡Î¤Î—", "Î Î•ÎœÎ Î¤Î—", "Î Î‘Î¡Î‘Î£ÎšÎ•Î¥Î—", "Î£Î‘Î’Î’Î‘Î¤ÎŸ"];
}
TimeHelper.prototype.init = function (onfinished) {
	var me = this;
	var now = new Date();
	var mytim = "d=" + now.getDate() + "&m=" + now.getMonth() + "&y=" + now.getFullYear() + "&h=" + now.getHours() + "&i=" + now.getMinutes() + "&s=" + now.getSeconds() + "&t=" + Math.floor(now.getTime() / 1000);

	createHttpRequest("timediff.php?" + mytim, function (txt) {
		var config = parseJSON(txt);

		if (config && config.length > 0) {
			config[0] = parseInt(config[0], 10);
			config[1] = parseInt(config[1], 10);
			if (!isNaN(config[0]) && !isNaN(config[1])) {
				me.timediffLocal = config[0] * 1000;
				me.timediffUTC = config[1] * 1000;
			}
		}
		if (onfinished) {
			onfinished();
		}
	});
};
TimeHelper.prototype.getNowDate = function () {
	if (this.timediffLocal === 0) {
		return new Date();
	}
	return new Date(new Date().getTime() + this.timediffLocal);
};
TimeHelper.prototype.getJSONDate = function (d) {
	return new Date(d * 1000 + this.getTimezoneDiff());
};
TimeHelper.prototype.getQueryTime = function (dat) {
	return Math.floor((dat.getTime() - this.getTimezoneDiff()) / 1000);
};
TimeHelper.prototype.getTimezoneDiff = function () {
	return Math.round((this.timediffLocal - this.timediffUTC) / 1800000) * 1800000;
};
TimeHelper.prototype.formatTime = function (tim) {
	var hrs = tim.getHours();
	if (hrs < 10) {
		hrs = "0" + hrs;
	}
	var mins = tim.getMinutes();
	if (mins < 10) {
		mins = "0" + mins;
	}
	return hrs + ":" + mins;
};
TimeHelper.prototype.formatDate = function (tim) {
	var day = tim.getDate();
	if (day < 10) {
		day = "0" + day;
	}
	var mon = tim.getMonth() + 1;
	if (mon < 10) {
		mon = "0" + mon;
	}
	return day + "." + mon + "." + tim.getFullYear();
};
TimeHelper.prototype.getMidnight = function (now) {
	var ret = now.getTime();
	var h = now.getHours() + now.getMinutes() / 60 - this.progdaystart;
	var m = now.getMinutes() - (this.progdaystart * 60) % 60;
	if (h < 0) {
		h += 24;
	}
	if (m < 0) {
		h++;
	}
	ret -= Math.floor(h) * 3600000;
	ret -= now.getSeconds() * 1000;
	ret -= m * 60000;
	ret -= ret % 1000;
	return ret;
};
TimeHelper.prototype.getDayName = function (midnight, d, shorttxt) {
	if (!d) {
		return "";
	}
	var diff = d.getTime() - midnight;
	var hrsdiff = diff / 3600000;
	d = new Date(d.getTime() - this.progdaystart * 3600000);
	var ret = this.daynames[d.getDay() % 7];
	if (shorttxt) {
		if (!IN_V2) ret = ret.substring(0, 2);
	}
	if (hrsdiff >= -24) {
		if (diff < 0) {
			ret = shorttxt ? "Î§Î˜Î•Î£" : "Î§Î˜Î•Î£";
		} else if (hrsdiff < 24) {
			ret = shorttxt ? "Î£Î—ÎœÎ•Î¡Î‘" : "Î£Î—ÎœÎ•Î¡Î‘";
		} else if (hrsdiff < 48) {
			ret = shorttxt ? "Î‘Î¥Î¡Î™ÎŸ" : "Î‘Î¥Î¡Î™ÎŸ";
		}
	}

	if (IN_V2) ret += "<br>";
	else ret += ", ";
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getYear() + 1900;
	return ret + (day < 10 ? " 0" : " ") + day + (month < 10 ? ".0" : ".") + month; //+ "."+year;
};

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}


var basicmenu = [{
		"image": "img/RED_B1.png",
		"text": "Έξοδος",
		"pageId": -1,
		"xpos": 120,
		"ypos": 10,
		"width": 83
	},
	{
		"image": "img/YELLOW_B1.png",
		"text": "Μενού",
		"pageId": 1,
		"xpos": 234,
		"ypos": 10,
		"width": 83
	},
	/*{
		"image": "img/YELLOW_B1.png",
		"text": "24News",
		"pageId": -1,
		"xpos": 425,
		"ypos": 10,
		"width": 110
	},
	{
		"image": "img/BLUE_B1.png",
		"text": "Big Brother",
		"pageId": 0,
		"xpos": 561,
		"ypos": 10,
		"width": 110
	}*/
];


function BasicMenu(idnam) {
	this.idnam = idnam;
	this.newmenu = null;
}

BasicMenu.prototype = new BaseObject();
BasicMenu.prototype.init = function (parent, xpos, ypos, newmenu) {
	this.parent = parent;
	var e = createClassDiv(662, 644, "basic-menu-container");
	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	this.focusedId = 0;

	if (newmenu) {
		this.newmenu = newmenu;
	}

	if (this.newmenu) basicmenu = this.newmenu;

	for (var i = 0; i < basicmenu.length; i++) {
		var inner = createClassDiv( /*basicmenu[i].xpos,basicmenu[i].ypos*/ "", "", "inner");
		inner.style.width = basicmenu[i].width + "px";
		var imgDiv = createClassDiv(0, 0, "imgDiv");
		var img = document.createElement("img");
		img.setAttribute("src", basicmenu[i].image);
		imgDiv.appendChild(img);
		var textDiv = createClassDiv(27, -3, "textDiv");
		var text = basicmenu[i].text;

		textDiv.innerHTML = "<span>" + text + "</span>";
		inner.appendChild(imgDiv);
		inner.appendChild(textDiv);
		this.elem.appendChild(inner);
		this.buttons[i] = inner;
	}


}
BasicMenu.prototype.destroy = function () {
	this.parent.removeChild(this.elem);
}
BasicMenu.prototype.setFocused = function (otherobj, focused) {
	for (i = 0; i < this.buttons.length; i++) {
		if (focused) {
			if (i == this.focusedId) this.buttons[i].addClass("focused");
			else this.buttons[i].removeClass("focused")
		} else this.buttons[i].removeClass("focused");
	}
}

BasicMenu.prototype.handleKeyPress = function (keyCode) {
	switch (keyCode) {
		case VK_RIGHT:
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				GLOBALS.focusmgr.focusObject("mainmenu");
			}
			this.setFocused(this.idnam, true);
			break;
		case VK_LEFT:
			this.focusedId--;
			if (this.focusedId < 0) this.focusedId = 0;
			this.setFocused(this.idnam, true);
			break;
		case VK_UP:
			if (GLOBALS.pageId == 1) {
				GLOBALS.focusmgr.focusObject("epg3");
				break;
			}
			GLOBALS.scenemgr.obtainFocus();
			break;
		case VK_ENTER:
			if (this.focusedId == 3) {
				GLOBALS.focusmgr.focusObject("mainmenu");
				break;
			}
			GLOBALS.pageId = basicmenu[this.focusedId].pageId;
			GLOBALS.scenemgr.baseInit(GLOBALS.pageId);
			break;
		default:
			break;
	}
}


/**
 * Scene Manager is responsible to initialize each scene. <br>
 * A service like 24plus may have more than 1 scenes.<br>
 * All scenes are stored in a stack and previous scenes are retrieved from there.<br>
 * Each scene is identified by a pageId  <br>
 * RADIO page id : 3 <br>
 * EPG page id : 1 <br>
 * 24PLUS page id : 0 <br>
 * SUPER LEAGUE page id : 20 <br>
 * ON DEMAND page id : 2 <br>
 * WEATHER page id : 5 <br>
 * SEARCH page id : 7 <br>
 * ERTPLAY page id : 4 <br>
 * INFO page id : 6 <br>
 * ARCHIVE page id : 11 <br>
 * @constructor
 */
function SceneManager() {
	this.parent = document.getElementById("appscreen");
	this.container = createDiv(0, 0, 1280, /*632*/ 659, "scene-container");
	//this.bgColor = "rgb(60,63,168)";
	//this.bgColor= "rgb(113, 113, 113)";
	this.container.style.background = this.bgColor;
	this.parent.appendChild(this.container);
	this.sceneStack = [];
	this.sceneId = GLOBALS.pageId;
	this.focus = {
		url : null,
		la_url : null
	}
}

SceneManager.prototype.getCurrentScene = function () {
	return this.sceneStack[this.sceneStack.length - 1];
}

SceneManager.prototype.obtainFocus = function () {
	if (GLOBALS.focusmgr.getObject("epg-menu")) {
		var o = GLOBALS.focusmgr.getObject("epg");
		GLOBALS.focusmgr.focusObject("epg-list-" + o.activeId);
		return true;
	}
	if (this.sceneStack.length > 0) {
		var obj = this.sceneStack[this.sceneStack.length - 1].obj;
		var last = obj.idnam;
		if (last == "episodes") {
			var o = GLOBALS.focusmgr.getObject(activeCont.subCat), obj = GLOBALS.focusmgr.getObject('episodes');
			if (o.idnam == 'sports' && typeof obj.buttons[obj.focusedId] != 'undefined') {
				GLOBALS.focusmgr.focusObject(obj.buttons[obj.focusedId].idnam);
			} else
				GLOBALS.focusmgr.focusObject("episodes-" + activeCont.subCat);
			return true;
		}
		if (last == "search") {
			var o = GLOBALS.focusmgr.getObject('search');
			GLOBALS.focusmgr.focusObject(o.ktab_idnam, true);
			return true;
		}
		if (last == "skai") {
			GLOBALS.focusmgr.focusObject(obj.idnam + "-list", true);
			return true;
		}
		if (last == "epg") {
			GLOBALS.focusmgr.focusObject("epg-list", true);
			return true;
		}
		if (last == "summer") {
			GLOBALS.focusmgr.focusObject("summer-list");
			return true;
		}
		if (last == "home-cont") {
			var o = GLOBALS.focusmgr.getObject('home-cont');
			GLOBALS.focusmgr.focusObject("home-list-"+ o.focusedId);
			return true;
		} else if (last == "radio") {
			GLOBALS.focusmgr.focusObject("radio-list");
			return true;
		} else if (keyLists.indexOf(last) != -1) {
			GLOBALS.focusmgr.focusObject(last + "-list-"+ obj.focusedId, true);
			return true;
		}
		GLOBALS.focusmgr.focusObject(obj.idnam);
	} else {
		return true;
	}
}

SceneManager.prototype.clear = function () {
	if (GLOBALS.pageId != 4) this.emptyStack();
	this.container.style.display = "none";
	var dependencies = Array("super-league-all", "360-videos", "wc-buttons", "wc-channels", "fifa-films", "privacy-policy", "radio-categories", "fifa-films-categories", "video-categories", "nowbutton", "timebuttons", "daysel", "ruler", "channel-container", /*"epg0", "epg1", "epg2", "epg3",*/ "24plus-dayselector");
	for (i = 0; i < dependencies.length; i++) {
		var obj = GLOBALS.focusmgr.getObject(dependencies[i]);
		if (obj) {
			GLOBALS.focusmgr.unregisterObject(obj);
			if (obj.elem) this.parent.removeChild(obj.elem);
		}
	}
	var elems = document.getElementsByClassName("sepdiv");
	for (i = 0; i < elems.length; i++) {
		elems[i].style.display = "none";
	}
	if (document.getElementById("container-1")) document.getElementById("container-1").style.display = "none";
	if (document.getElementById("container-2")) document.getElementById("container-2").style.display = "none";
	if (document.getElementById("container-3")) document.getElementById("container-3").style.display = "none";
	if (document.getElementById("container-right")) document.getElementById("container-right").style.display = "none";
	document.getElementById("tvbild").innerHTML = '';
	if (GLOBALS.focusmgr.getObject("rss-ticker")) GLOBALS.focusmgr.getObject("rss-ticker").show();
	if (document.getElementById('mybroadcast')) {
		var dvb = document.getElementById('mybroadcast');

		try {
			console.log('stop');
			dvb.stop();
		} catch (e) {}
		try {
			dvb.release();
		} catch (e) {}
		try {
			dvb.data = "";
			dvb.src = "";
			dvb.vtype = "";
		} catch (e) {}
	}

	document.getElementById("tvbild").removeClass("epg-v2");

	if (document.getElementById('myradio')) {
		var dvb = document.getElementById('myradio');

		try {
			dvb.stop();
		} catch (e) {}
		try {
			dvb.release();
		} catch (e) {}
		try {
			dvb.data = "";
			dvb.src = "";
			dvb.vtype = "";
		} catch (e) {}
	}
}

SceneManager.prototype.parseIPInfo = function (data) {
	var d = JSON.parse(data);
	if (d.country) {
		GLOBALS.user_country = d.country;
	} else GLOBALS.user_country = "GR";

	var j = 0;
	var applist_2 = [];
	if (GLOBALS.user_country != "GR" && location.host != "195.211.203.122") {
		for (var i = 0; i < applist.length; i++) {
			if (applist[i].name == "FORMULA1") continue;
			applist_2[j] = applist[i];
			j++;
		}
		applist = applist_2;
	}

	var j = 0;
	var videocategories_2 = [];
	if (GLOBALS.user_country != "GR") {
		for (var i = 0; i < videocategories.length; i++) {
			if (videocategories[i].name == "ÎžÎ•ÎÎ•Î£ Î£Î•Î™Î¡Î•Î£") continue;
			videocategories_2[j] = videocategories[i];
			j++;
		}
		videocategories = videocategories_2;
	}

	devmode2("[SceneManager.prototype.parseIPInfo] user_country: " + GLOBALS.user_country);
}


SceneManager.prototype.captureChannelChange = function () {

	try {
		var tvbild = document.getElementById("tvbild");
		tvbild.innerHTML = '<object id="mybroadcast"  type="video/broadcast"></object>';
		var dvb = document.getElementById('mybroadcast');
		if (dvb) {
			/*
			dvb.type = 'video/mpeg';
			dvb.data = 'http://stream.anixe.net/live/skai/mpeg.2ts';
			dvb.play(1);
			*/
			dvb.bindToCurrentChannel();
			// Get current triplet

			/*
			 * var ch = dvb.currentChannel;
			GLOBALS.sid = ch.sid;
			GLOBALS.tsid = ch.tsid;
			GLOBALS.onid = ch.onid;
			*/
		}
	} catch (e) {}


	var aktueller_sender = GLOBALS.channelId;
	try {
		dvb.onChannelChangeSucceeded = function () {
			if (dvb.currentChannel) {
				dvb.onChannelChangeSucceeded = null;
				dvb.onChannelChangeError = null;
				if (GLOBALS.sid != dvb.currentChannel.sid && GLOBALS.pageId != 1 && GLOBALS.pageId != 28) {
					//set new channel
					GLOBALS.channelId = getNewChannel(dvb.currentChannel.sid);
					restartApp();
				}
			}
		};
	} catch (e) {}
}

SceneManager.prototype.baseInit = function (pageid) {
	document.getElementById("appscreen").className = "";
	document.getElementById("appscreen").addClass("default");

	if (GLOBALS.focusmgr.getObject("rss-ticker")) {
		var obj = GLOBALS.focusmgr.getObject("rss-ticker");
		obj.elem.style.visibility = "visible";
	}
	this.clear();

	document.getElementById("tvbild").style.visibility = "hidden";
	var tvbild = document.getElementById("tvbild");
	if (GLOBALS.pageId == 24 || GLOBALS.pageId == 26) {
		tvbild.removeClass("tvbild");
		tvbild.addClass("athletics");
		document.getElementById("tvbild").style.visibility = "visible";
	} else if (GLOBALS.pageId == 1) {
		tvbild.className = "epg-v2";
	} else {
		tvbild.addClass("tvbild");
	}


	if (GLOBALS.focusmgr.getObject("basic-menu")) {
		var o = GLOBALS.focusmgr.getObject("basic-menu");
		o.destroy();
	}

	this.top = createClassDiv("", "", "top-container");

	if (location.host == 'smarttv.anixa.tv' || location.host == 'localhost') {
		var devlab = createClassDiv("", "", "dev-label");
		devlab.innerHTML = "ON-DEV";
		document.getElementById("appscreen").appendChild(devlab);
	}
	var me=this,rf = createClassDiv("", "", "rf-div");
	this.top.appendChild(rf);

	var url = 'live.php';
	me.req = createHttpRequest(url, function (ret) {
		me.req = null;
		me.live = JSON.parse(ret);

		if (GLOBALS.menu == "sidebar") {
			var e = new SideBar("side-bar");
			e.init(document.getElementById("appscreen"), "", "");
			GLOBALS.scenemgr.sidemenu = e;
			document.getElementById("appscreen").addClass("v2");

		} else {
			var sm = new Menu("menu");
			sm.init(me.top, "", "");
		}
	});

	var e = new BasicMenu("basic-menu");
	e.init(this.parent, "", "");

	this.parent.appendChild(this.top);
	this.parent.appendChild(createClassDiv(0, 636, "bottom-sepdiv"));

	if (GLOBALS.pageId == 1 && GLOBALS.videoplayer) this.disableMute();
	if (GLOBALS.pageId != 1 /*&& !GLOBALS.videoplayer*/ ) this.enableMute();
	document.getElementById("appscreen").className = "";
	document.getElementById("appscreen").removeClass("noindex");
	GLOBALS.pageId = pageid;
	this.container.style.display = 'block';

	this.captureChannelChange();

	switch (pageid) {
		case 46:
			var e = new Skai("skai");
			if (GLOBALS.action == "mercedes") {
				moves('Mercedes promo');
				e.createStream();
				break;
			} else if (GLOBALS.action == "4k") {
				this.addScene(e);
				this.showCurrentScene("");
				e.loadJson("sports", 0);
				break;
			}

			if (GLOBALS.action == "bigbrother") {
				document.getElementsByClassName("sidebar")[0].style.visibility = "hidden";
				e.createBigBrother();
			} else if (GLOBALS.action == "planet") {
				this.addScene(e);
				this.showCurrentScene("");

				e.loadJson("news", 0);
				window.setTimeout(function () {
					e.loadJson("episodes", 67429, 'news');
				}, 180);
			} else {
				this.addScene(e);
				this.showCurrentScene("");
			}

			var coStd = getCookie("std_anx");

			var coStk = getCookie("stk_anx");
			break;
		default:
			break;
	}

	if (GLOBALS.menu == "sidebar") {
		document.getElementById("appscreen").addClass("v2");
	}
}


SceneManager.prototype.displayBigBrother = function () {
	if (this.bbLeft == 975) {
		clearTimeout(this.bbDisplayer);
		return true;
	}
	this.bbLeft -= 1;
	this.greenBtn.style.left = this.bbLeft + "px";
}

SceneManager.prototype.setRF = function () {
	if (GLOBALS.videoplayer) {
		GLOBALS.videoplayer.close();
		// GLOBALS.scenemgr.closeVideoPlayer();
		GLOBALS.videoplayer = null;
	}
	if (document.getElementById('video')) {
		var vid = document.getElementById('video');
		devmode("[VideoPlayer.prototype.close] vid stop");
		try {
			vid.stop();
		} catch (e) {}
		//try {vid.release();}catch (e) {}
		try {
			vid.pause();
		} catch (e) {}
		try {
			vid.data = '';
		} catch (e) {}
		try {
			vid.src = '';
		} catch (e) {}
	}
	this.stopBroadcast();
}
SceneManager.prototype.stopBroadcast = function (){
	debug("stop broadcast on init app");
	try{
		var broadcast = $("#mybroadcast")[0];
		debug("Broadcast object found - attempting to stop. Current state:"+broadcast.playState,"yellow");
		if( broadcast.playState != 3) {
			debug("Broadcast object found - not in stopped state","yellow");
			broadcast.bindToCurrentChannel();
			debug("Broadcast object found - bound to current channel","yellow");
			broadcast.stop();
			debug("Broadcast object found - stopped","yellow");
			this.brStopped = true;
			
		}
	} catch(e){
		debug("error stopping broadcast e: " + e.description);
		if( !broadcast ){
			debug("create broadcast object");
			$("body").append("<object type='video/broadcast' id='mybroadcast'></object>");
		}
		broadcast = $("#mybroadcast")[0];
		if( !broadcast ) debug("Failed to create or access broadcast object!", "yellow");
		try{
			debug( "Current broadcast.playState="+ broadcast.playState, "yellow" );
			if( broadcast.playState != 3) { // 0=unrealized, 1=connecting, 2=presenting, 3=stopped
				broadcast.bindToCurrentChannel();
				broadcast.stop();
				//   broadcast.release();//outside of try catch does not stop broadcast on html5
				debug("broadcast stopped", "yellow");
				this.brStopped = true;
			}
		}catch(ex){
			debug("failed to stop broadcast ex:"+ ex.description);
		}
	}
}


SceneManager.prototype.playNosound = function (mode, audio, times, ended) {
	if (times <= 0) {
		return;
	}
	var played = 0;
	audio.addEventListener("ended", function () {

		played++;
		if (played < times) {
			audio.play(1);
		} else if (ended) {
			ended();
		}
		audio.play();
	});
	if (mode == "on") audio.play(1);
	else if (mode == "off") {
		audio.stop();
		audio.pause();
	}
}



/**
 * Enable mute. Stop DVB signal and starts a loop of no sound video
 */
SceneManager.prototype.enableMute = function () {
	return true;

}

/**
 * Disable Mute. Stops the no sound loop. Eg when we exit the HbbTV app.
 */
SceneManager.prototype.disableMute = function () {
	return true;

}

/**
 * Removes all scenes from the stack. Eg when we load a new service. 
 */
SceneManager.prototype.emptyStack = function () {
	for (var i = 0; i < this.sceneStack.length; i++) {

		var elem = this.sceneStack[i];
		if (elem) {
			elem.obj.unregister();
			this.container.removeChild(document.getElementById("scene" + elem.sceneId));
		}
	}
	this.sceneStack = [];
	this.sceneId = 0;
}

/**
 * Adds a new scene in the stack. 
 * @param obj it is the javascript object that instantiates the scene
 */
SceneManager.prototype.addScene = function (obj) {
	this.sceneStack.push({
		"obj": obj,
		"sceneId": this.sceneId
	});
	this.sceneId++;
}

/**
 * Shows the current scene and hides previous ones if they exist.
 * @param index This is the title of the scene appearing on the top left corner 
 * @param top Top position of the scene
 */
SceneManager.prototype.showCurrentScene = function (index, top) {



	var elem = this.sceneStack[this.sceneStack.length - 1];
	if (top) thistop = top;
	else thistop = 0;
	var currentScene = createDiv(0, thistop, 1280, 720);
	currentScene.id = "scene" + elem.sceneId;
	//if(GLOBALS.pageId != 19){
	if (document.getElementById("appscreen").getElementsByClassName("index")[0]) {
		if (thistop == 76) document.getElementById("appscreen").getElementsByClassName("index")[0].innerHTML = index;
		else document.getElementById("appscreen").getElementsByClassName("index")[0].innerHTML = "";
	} else {
		var indexDiv = createClassDiv(66, 30, "index");
		indexDiv.innerHTML = index;
		document.getElementById("appscreen").appendChild(indexDiv);
	}
	//}


	elem.obj.init(currentScene);
	this.container.appendChild(currentScene);
	this.currentScene = currentScene;
	this.hidePreviousScenes();

	if (elem.obj.idnam == "home-cont") {
		GLOBALS.focusmgr.focusObject("home-list-0", true);
		return true;
	} else if (keyLists.indexOf(elem.obj.idnam) != -1) {
		GLOBALS.focusmgr.focusObject(elem.obj.idnam + "-list-0", true);
		return true;
	}

	if (elem.obj.idnam == "stream") {
		GLOBALS.focusmgr.focusObject("videoplayer", true);
		return true;
	}
	if (elem.obj.idnam == "bigbrother") {
		GLOBALS.focusmgr.focusObject("episodes-list", true);
		return true;
	}
	if (elem.obj.idnam == "episodes") {
		if (elem.obj.league && elem.obj.buttons.length==2)
			GLOBALS.focusmgr.focusObject("episodes-list-top", true);
		else
			GLOBALS.focusmgr.focusObject("episodes-" + elem.obj.subCat, true);
		return true;
	}
	if (elem.obj.idnam == "lexeis") {
		GLOBALS.focusmgr.focusObject("lexeis-" + elem.obj.focusedId, true);
		return true;
	}
	if (elem.obj.idnam == "doc") {
		GLOBALS.focusmgr.focusObject("doc-list", true);
		return true;
	}
	if (elem.obj.idnam == "summer") {
		GLOBALS.focusmgr.focusObject("summer-list", true);
		return true;
	}
	if (elem.obj.idnam == "sports") {
		GLOBALS.focusmgr.focusObject("sports-list", true);
		return true;
	}
	if (elem.obj.idnam == "radio") {
		GLOBALS.focusmgr.focusObject("radio-list", true);
		return true;
	}

	

	GLOBALS.focusmgr.focusObject(elem.obj.idnam);
}

SceneManager.prototype.removeLastScene = function () {
	for (var i = 1; i < this.sceneStack.length; i++) {

		var elem = this.sceneStack[i];
		if (elem) {
			elem.obj.unregister();
			this.container.removeChild(document.getElementById("scene" + elem.sceneId));
		}
	}
	this.sceneStack.length = 1;
	this.sceneId = 1;
}

SceneManager.prototype.showLastScene = function () {
	var elem = this.sceneStack[this.sceneStack.length - 1];
	if (document.getElementById("scene" + elem.sceneId)) document.getElementById("scene" + elem.sceneId).style.display = 'block';

	if (GLOBALS.menu == "sidebar") var m = GLOBALS.focusmgr.getObject("submenu-0");
	else var m = GLOBALS.focusmgr.getObject("menu");

	if (elem.obj.idnam == "search") {
		m.activeId = 0;
		m.focusedId = 0;
		m.setActive();
		GLOBALS.focusmgr.focusObject("search-input");
		return true;
	} else if (elem.obj.idnam == "home-cont") {
		activeCont = elem.obj;
		currScene = elem.obj.idnam;
		m.activeId = 0;
		m.focusedId = 0;
		m.setActive();
		GLOBALS.focusmgr.focusObject("home-list-"+ elem.obj.focusedId, true);
		return true;
	} else if (keyLists.indexOf(elem.obj.idnam) != -1) {
		activeCont = elem.obj;
		currScene = elem.obj.idnam;
		if (elem.obj.idnam == "news") {
			m.activeId = 1;
			m.focusedId = 1;
		}
		if (elem.obj.idnam == "shows") {
			m.activeId = 2;
			m.focusedId = 2;
		}
		if (elem.obj.idnam == "series") {
			m.activeId = 3;
			m.focusedId = 3;
		}
		m.setActive();
		GLOBALS.focusmgr.focusObject(elem.obj.idnam + "-list-0");
		return true;
	} else if (elem.obj.idnam == "sports") {
		GLOBALS.focusmgr.focusObject("sports-list");
	} else if (elem.obj.idnam == "episodes") {
		activeCont = elem.obj;
		currScene = elem.obj.idnam;
		// if(elem.obj.subCat)
		GLOBALS.focusmgr.focusObject("episodes-" + elem.obj.subCat);
		return true;
	}
	debug('focus '+ elem.obj.idnam);
	if (elem.obj) GLOBALS.focusmgr.focusObject(elem.obj.idnam);

}

/**
 * Hides previous scenes. Sets display css property to none.
 */
SceneManager.prototype.hidePreviousScenes = function () {
	for (i = 0; i < this.sceneStack.length - 1; i++) {
		document.getElementById("scene" + i).style.display = 'none';
	}
}

function getAppId() {
	for (var i = 0; i < applist.length; i++) {
		if (applist[i].pageId == GLOBALS.pageId) return i;
	}
}

/**
 * Removes last scene and set focus on the the current object. 
 */
SceneManager.prototype.goBack = function () {
	var elem = this.sceneStack[this.sceneStack.length - 1];
	elem.obj.unregister();
	this.container.removeChild(document.getElementById("scene" + elem.sceneId));
	this.sceneStack.length = this.sceneStack.length - 1;
	this.sceneId--;

	var elem = this.sceneStack[this.sceneStack.length - 1];
	document.getElementById("scene" + elem.sceneId).style.display = "block";
	if (GLOBALS.menu == "sidebar") var m = GLOBALS.focusmgr.getObject("submenu-0");
	else var m = GLOBALS.focusmgr.getObject("menu");

	clearInterval(GLOBALS.lbannerTimer);
	clearTimeout(GLOBALS.lbannerTimerFirst);
	clearTimeout(GLOBALS.adTimer);
	var ldiv = document.getElementsByClassName('lbanner')[0];
	var img = document.getElementById("lbanner-img");
	var cont = document.getElementById("videodiv");
	ldiv.style.visibility = 'hidden';
	cont.removeClass('cont-lbanner');
	if (img)
		img.parentNode.removeChild(img);

	if (elem.obj.idnam == "search") {
		m.activeId = 0;
		m.focusedId = 0;
		m.setActive();
		GLOBALS.focusmgr.focusObject("search-input");
		return true;
	}
	if (elem.obj.idnam == "home-cont") {
		activeCont = elem.obj;
		currScene = elem.obj.idnam;
		m.activeId = 0;
		m.focusedId = 0;
		m.setActive();
		
		GLOBALS.focusmgr.focusObject("home-list-"+ elem.obj.focusedId, true);
		return true;
	}
	if (keyLists.indexOf(elem.obj.idnam) != -1) {
		activeCont = elem.obj;
		currScene = elem.obj.idnam;
		if (elem.obj.idnam == "news") {
			m.activeId = 1;
			m.focusedId = 1;
		}
		if (elem.obj.idnam == "shows") {
			m.activeId = 2;
			m.focusedId = 2;
		}
		if (elem.obj.idnam == "series") {
			m.activeId = 3;
			m.focusedId = 3;
		}
		m.setActive();
		GLOBALS.focusmgr.focusObject(elem.obj.idnam + "-list-"+ activeCont.focusedId);
		return true;
	}
	if (elem.obj.idnam == "sports") {
		GLOBALS.focusmgr.focusObject("sports-list");
	}
	if (elem.obj.idnam == "episodes") {
		activeCont = elem.obj;
		currScene = elem.obj.idnam;
		// if(elem.obj.subCat)
		GLOBALS.focusmgr.focusObject("episodes-" + elem.obj.subCat);
		return true;
	}
	if (elem.obj.idnam == "epg") {
		activeCont = elem.obj;
		currScene = elem.obj.idnam;
		m.activeId = 4;
		m.focusedId = 4;
		m.setActive();
		GLOBALS.focusmgr.focusObject("epg-list");
		return true;
	}
	if (elem.obj.idnam == "radio") {
		GLOBALS.focusmgr.focusObject("radio-list");

	}
	// GLOBALS.focusmgr.focusObject(elem.obj.idnam);
}

/**
 * Opens Video player. Creates the Video player instance and moves focus on the time bar on player buttons.
 */
SceneManager.prototype.openVideoPlayer = function (type, source) {


	if (GLOBALS.focusmgr.getObject("rss-ticker")) {
		var obj = GLOBALS.focusmgr.getObject("rss-ticker");
		obj.elem.style.visibility = "hidden";
	}

	if (GLOBALS.focusmgr.getObject("24plus-dayselector") && type != "mute") {
		var obj = GLOBALS.focusmgr.getObject("24plus-dayselector");
		obj.elem.style.visibility = "hidden";

	}

	//this.setBackground("rgb(61,69,163)");
	if (GLOBALS.pageId != 28 && GLOBALS.pageId != 27 && GLOBALS.pageId != 33 && type != "mute") {
		for (var i = 0; i < this.sceneStack.length; i++) {

			if (document.getElementById("scene" + i)) document.getElementById("scene" + i).style.display = 'none';

		}
	}



	if (GLOBALS.HbbPlayer == "active") {
		if (source) {
			lalert(source);
			GLOBALS.focusmgr.allObjects["controls"] = controls;
			GLOBALS.focusmgr.focusObject("controls", true);
			this.createAVPlayer(source);
			controls.initialize();

		}
		return true; //HbbPlayer
	}


	if (!GLOBALS.videoplayer) {
		GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, type);
		if (type) GLOBALS.videoplayer.oncase = type;
		GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
		//lalert("[openVideoPlayer] type: "+type);
	}
	if (GLOBALS.pageId != 28 && GLOBALS.pageId != 27 && GLOBALS.pageId != 33 && type != "mute") {

		GLOBALS.focusmgr.focusObject("videoplayer");
	}
}

SceneManager.prototype.createAVPlayer = function (url) {
	var player;

	player = document.createElement("object");
	player.setAttribute("type", "video/mp4");
	player.setAttribute("data", url);

	document.body.appendChild(player);

	player.setFullScreen(true);
	player.play(1);
}

/**
 * Closes Video player and loads last scene. 
 */
SceneManager.prototype.closeVideoPlayer = function () {


	GLOBALS.videoplayer = null;
	if (GLOBALS.focusmgr.getObject("24plus-dayselector")) {

		var obj = GLOBALS.focusmgr.getObject("24plus-dayselector");
		//llog("4. [SceneManager.prototype.closeVideoPlayer] 24plus case");
		obj.elem.style.visibility = "visible";
	}

	if (GLOBALS.focusmgr.getObject("rss-ticker")) {
		var obj = GLOBALS.focusmgr.getObject("rss-ticker");
		obj.elem.style.visibility = "visible";

	}
	if (document.getElementById("scene" + (this.sceneStack.length - 1))) document.getElementById("scene" + (this.sceneStack.length - 1)).style.display = "block";
	//this.setBackground("rgb(61,69,163)");

	this.showLastScene();
	GLOBALS.scenemgr.enableMute();
	//this.goBack();
}

SceneManager.prototype.setBackground = function (bgColor) {
	/*if(GLOBALS.focusmgr.getObject("videoplayer")) this.container.style.background = "#4f4f4f";
	else this.container.style.background = "#ffffff";*/
	this.container.style.background = bgColor;
}



var vodBtns = [{
		"name": "back",
		"state": "enabled",
		"on": "img/buttons/control_back_hover2.png",
		"off": "img/buttons/control_back2.png"
	},
	// {
	// 	"name": "subtitles",
	// 	"state": "enabled",
	// 	"on": "img/subs_button_on.png",
	// 	"off": "img/subs_button.png"
	// },
	{
		"name": "rewind",
		"state": "enabled",
		"on": "img/buttons/Control_3_HoverBtn.png",
		"off": "img/buttons/Control_3_Btn.png"
	},
	{
		"name": "play_pause",
		"state": "enabled",
		"onPause": "img/buttons/Control_1_HoverBtn.png",
		"offPause": "img/buttons/Control_1_Btn.png",
		"onPlay": "img/buttons/Control_Play_HoverBtn.png",
		"offPlay": "img/buttons/Control_Play_Btn.png"
	},
	{
		"name": "fast_forward",
		"state": "enabled",
		"on": "img/buttons/Control_4_HoverBtn.png",
		"off": "img/buttons/Control_4_Btn.png"
	},
];

var bigbrotherBtns = [{
	"name": "fullscreen",
	"state": "enabled",
	"on": "img/fullscreen_active.png",
	"off": "img/fullscreen.png"
}];


/**
 * Represents the Video Player object. In HbbTV applications there can be only one video player object , thus one source loaded each time. When we interchange between videos we actually load a different source on the same video object. More than one videos at the same time cannot exist with the current standard. eg on Mosaic that it seems that 5 videos are playing simultaneously, actually it is one multiplexed video of 5 streams in one.<br/>
 * Inner variable "oncase" indicates the current open service, <br/>
 * 
 * The "oncase" variable defines different actions on the key events. <br/>
 * @contsructor
 * @class
 * @param idnam The name identifier for this object.
 * @param playerClass  
 * @param timerClass 
 * @param playerTop 
 * @param timerTop 
 * @param isPlaying Defines if video is instantiated on playong mode.
 * 
 */
function VideoPlayer(idnam, playerClass, timerClass, playerTop, timerTop, isPlaying) {
	this.idnam = idnam;
	this.focusedId = 2;
	this.isPlaying = isPlaying;
	this.vid = null;
	// this.jumpInterval = 240 /*120*/ ;
	this.jumpInterval = 30 ;
	this.addTimer = false;
	this.hideTimer = false;
	this.duration = null;
	this.playerClass = playerClass;
	this.timerClass = timerClass;
	this.playerTop = playerTop;
	this.timerTop = timerTop;
	this.newPlayerTop = playerTop;
	this.newTimerTop = timerTop;
	this.source = null;
	this.parent = null;
	this.timer_cc = 0;
	this.firsttime = true;
	this.justStarted = true;
	this.isStopped = false;
	this.isStarted = false;
	this.timelineWidth = 794;
	this.buckets = null;
	this.bucketId = 0;
	this.syncTimer = null;
	this.fifademo = false;
	this.oncase = ON_VOD;
	this.game = null;
	this.gametime = null;
	this.hasMultStreams = false;
	this.matchid = true;
	this.isFirstTime = true;
	this.ffFirst = true;
	this.hasSubtitles = false;
	this.subslist = null;
	this.runner = null;
	this.thumbContainer = null;
	this.thumbleft = 408;
	this.thumbleftStart = 408;
	this.runnerleft = 408;
	this.runnerleftStart = 408;
	this.barleft = 408;
	this.barleftStart = 408;
	this.bar = null;
	this.thumbslist = null;
	this.activeBucketId = 0;
	this.jumpTimer = null;
	this.fromepList = false;
	this.inTrickMode = false;
	this.todo = '';
	this.ad=false;
}

VideoPlayer.prototype = new BaseObject();

VideoPlayer.prototype.setSubtitlesInfo = function (info) {
	this.subslist = info;
}

/**
 *  Creates the html elements for the structure of the video timer bar.
 *  Video timer bar consists of the player buttons which are enable subtitles, fullscreen, stop, start-pause, rewind, fast forward actions.
 *  @method 
 */
VideoPlayer.prototype.init = function (parent, xpos, ypos) {

	this.parent = parent;
	//	lalert("[VideoPlayer.prototype.init ] oncase : "+this.oncase);
	if (this.oncase == "bigbrother") {
		playerBtns = bigbrotherBtns;
		this.focusedId = 0;
	} else {
		playerBtns = vodBtns;
		this.focusedId = 2;
	}

	if (this.playerClass == "trailer") {
		this.jumpInterval = 10;
		this.oncase = ON_TRAILER;
	}

	this.timerClass = (this.playerClass != "trailer") ? this.timerClass + " fullHD" : this.timerClass;
	if (GLOBALS.pageId == 24 || GLOBALS.pageId == 26) {
		this.playerClass = "athletics";
		this.timerClass = "athletics";
	}
	if (GLOBALS.pageId == 28 || GLOBALS.pageId == 27) {
		this.playerClass = "formula1";
		this.timerClass = "formula1";
	}
	if (GLOBALS.pageId == 33) {
		this.playerClass = "ronald-garros";
		this.timerClass = "ronald-garros";
	}
	document.getElementById("player-container").setAttribute("class", (this.playerClass != "trailer") ? this.playerClass + " fullHD" : this.playerClass);
	if (GLOBALS.pageId == 28 || GLOBALS.pageId == 27) document.getElementById("player-container").setAttribute("class", "formula1");
	if (GLOBALS.pageId == 33) document.getElementById("player-container").setAttribute("class", "ronald-garros");
	var videoTimer = document.createElement("div");
	videoTimer.className = this.timerClass;
	videoTimer.id = "basic-videotimer";
	var playerControl = createClassDiv(0, 4, "player_control");
	parent.appendChild(videoTimer);
	this.baseInit(videoTimer);
	this.register();
	this.buttons = [];

	this.elem.style.opacity = 1;


	var inner = createClassDiv("", "", "inner");

	if (this.playerClass != "trailer") {
		//	document.getElementById("wait").style.display = "block";
		this.elem.style.display = "none";
		//document.getElementById("player-container").style.display = "none";
	}

	if (this.playerClass != "trailer") {
		this.labelVid = createClassDiv(0, 0, "labelVid");
		document.getElementById("appscreen").appendChild(this.labelVid);
	}

	document.getElementById("player-container").style.top = this.playerTop + "px";
	document.getElementById("basic-videotimer").style.top = this.timerTop + "px";


	var img;
	var cnt = 0;
	for (var i = 0; i < playerBtns.length; i++) {
		img = document.createElement("img");
		if (!playerBtns[i]) continue;
		if (playerBtns[i].state == "disabled") continue;

		if (playerBtns[i].name == "subtitles") img.addClass("subsicon");

		if (playerBtns[i].name == "play_pause") { //if(i == 1){
			if (this.isPlaying) {
				img.setAttribute("src", playerBtns[i].onPause);
			} else {
				img.setAttribute("src", playerBtns[i].onPlay);
			}
		} else {
			img.setAttribute("src", playerBtns[i].off);
		}
		img.setAttribute("id", playerBtns[i].name);
		playerControl.appendChild(img);
		this.buttons[cnt] = img;
		cnt++;
	}

	inner.appendChild(playerControl);
	this.duration = createClassDiv(0, 0, "duration");
	this.runner = createClassDiv(202, 18, "runner");
	if (NEW_FEATURE) this.thumbContainer = createClassDiv(202, 18, "thumb-container");
	this.bar = createClassDiv(202, 2, "bar");
	var barimg = document.createElement("img");
	barimg.src = "img/timeline.png";
	this.bar.appendChild(barimg);
	var innerspan = document.createElement("span");
	this.runner.appendChild(innerspan);
	//this.timebar = createClassDiv(0,0,"timebar");
	var timeline = createClassDiv( /*171*/ 202, 7, "basic-timeline");
	var time = createClassDiv(630, 4, "time");
	timeline.appendChild(this.duration);
	inner.appendChild(this.runner);
	if (NEW_FEATURE) this.elem.appendChild(this.thumbContainer);
	inner.appendChild(this.bar);
	//timeline.appendChild(timebar);
	this.title = createClassDiv(83, 59, "video-title");
	inner.appendChild(this.title);
	inner.appendChild(timeline);
	inner.appendChild(time);
	this.timer1 = createClassDiv("", "", "timer1");
	this.timer2 = createClassDiv("", "", "timer2");
	inner.appendChild(this.timer1);
	inner.appendChild(this.timer2);
	var outer = createClassDiv("", "", "outer");
	outer.appendChild(inner);
	this.elem.appendChild(outer);
	this.setFocused();

	this.elem.style.opacity = 1;
	this.elem.style.display = "block";
	this.setTimerBarsStyle(408, true);
	this.runner.style.top = "-4px";
	this.runner.style.left = "408px";
	this.bar.style.left = "408px";
	this.bar.style.top = "20px";

	if (NEW_FEATURE) {
		this.thumbContainer.style.top = "110px";
		this.thumbContainer.style.left = "408px";
	}

	if (this.oncase == "bigbrother") {
		this.elem.removeClass("fullHD");
		this.elem.addClass("small");
	}

	this.elem.addClass("modplayer");
}



VideoPlayer.prototype.setLabelVid = function (label) {
	this.labelVid.innerHTML = "<span>" + label + "</span>";
	this.title.innerHTML = label;
}

VideoPlayer.prototype.scroll = function (diff) {

	this.newPlayerTop = Math.round(this.newPlayerTop + diff);
	this.newTimerTop = Math.round(this.newTimerTop + diff);
	document.getElementById("player-container").style.top = this.newPlayerTop + "px";
	document.getElementById("basic-videotimer").style.top = this.newTimerTop + "px";
}

VideoPlayer.prototype.resetPos = function () {
	if (document.getElementById("player-container")) document.getElementById("player-container").style.top = this.playerTop + "px";
	if (document.getElementById("basic-videotimer")) document.getElementById("basic-videotimer").style.top = this.timerTop + "px";
	this.newPlayerTop = this.playerTop;
	this.newTimerTop = this.timerTop;
}

VideoPlayer.prototype.setStopImg = function (stopimg) {
	document.getElementById("stop-img").innerHTML = '<img src="' + stopimg + '" />';
	document.getElementById("stop-img").style.display = "none";
}

/**
 * Set the source of the video player object
 * @method
 */
VideoPlayer.prototype.setSource = function (source) {
	this.isRadio = false;
	if (GLOBALS.dev)
		console.log(source);
	if (typeof source == 'string') {
		this.source = source;
		this.isFirstTime = false;
		return;
	}
	this.source = source.media_item_link;
	if(source.category){
		this.category = source.category;
		this.title = source.title;
		this.episode = source.media_item_title;
	}else if (GLOBALS.lastMoves) {
		var splitPath = GLOBALS.lastMoves.split("/");
		if (GLOBALS.focusmgr.getObject("show-detail")) {
			this.category = GLOBALS.focusmgr.getObject("show-detail").category;
			this.title = splitPath[0];
			this.episode = splitPath[1];
		} else {
			this.category = splitPath[0];
			this.title = splitPath[1];
		}
	}

	this.isFirstTime = false;
}


VideoPlayer.prototype.createThumbsList = function (data) {
	try {
		var items = JSON.parse(data);
	} catch (e) {}


	this.thumbslist = items;

}

/**
 * Creates the html video object to load the source. 
 * @method
 * @param type sets the type of the object (mp4, mpeg-dash, mpeg)
 * @mosaic boolean to indicate if the source is a mosaic or not 
 */
VideoPlayer.prototype.start = function (type, mosaic) {
	var ag = navigator.userAgent.toUpperCase(), re = /Chrome\/(\d\d).*sony/i, m = ag.match(re), sonyChrome = (m ? parseInt(m[1]) : false);
	if (sonyChrome)
		debug('chrome '+ sonyChrome);
	if (this.elem) this.elem.style.opacity = 1;
	if (this.elem) this.elem.style.display = "block";

	GLOBALS.lastPlayId = 0;
	var islive = this.source.indexOf('.2ts') > 0;
	if (islive)
		type = 'video/mpeg';
	this.islive = islive;
	if (1) {
		var srv=['195.226.218.10','195.226.218.160','195.226.218.163'];
		var server=srv[ Math.floor(Math.random() * 3) ];
		this.source = this.source.replace('cdn.smart-tv-data.com', server);
		this.source = this.source.replace('abr.smart-tv-data.com', server);
	}

	var me = this;
	this.newPlayerTop = this.playerTop;
	this.newTimerTop = this.timerTop;
	debug('start video ' + this.source + " ("+ this.oncase +"), title: "+ (this.title?this.title:"noTitle"));

	var inner = '<video id="video" src="' + this.source + '" controls="" autoplay=""></video>';
	if (GLOBALS.brtyp) inner = '<object type="video/mp4"  id="video" data="' + this.source + '"></object>';
	if (type) inner = '<object type=' + type + '  id="video" data="' + this.source + '"></object>';

	if (type == "mpeg-dash") {
		if (GLOBALS.brtyp) inner = '<object  type="application/dash+xml"  id="video" data="' + this.source + '"></object>';
		else inner = '<video id="video" type="application/dash+xml" src="' + this.source + '" controls="" autoplay=""></video>';
	}

	if (type == "video/mpeg") {
		if (GLOBALS.brtyp) inner = '<object  type="video/mpeg"  id="video" data="' + this.source + '"></object>';
		else inner = '<video id="video" type="video/mpeg" src="' + this.source + '" controls="" autoplay=""></video>';
	}

	if (document.getElementById('mybroadcast')) {
		var dvb = document.getElementById('mybroadcast');
		try {
			dvb.stop();
		} catch (e) {}
		try {
			dvb.release();
		} catch (e) {}
	}

	if (document.getElementById("player-container")) {
		document.getElementById("player-container").innerHTML = inner;
		document.getElementById("player-container").style.display = "block";
	}

	if (islive) {
		document.getElementById("fast_forward").style.display = "none";
		document.getElementById("rewind").style.display = "none";
		document.getElementById("play_pause").style.marginLeft = "105px";
	} else {
		document.getElementById("fast_forward").style.display = "inline";
		document.getElementById("rewind").style.display = "inline";
		document.getElementById("play_pause").style.marginLeft = "40px";
	}
	if(this.isRadio){
		document.getElementById("player-bg-container").addClass("radio");
		document.getElementById("basic-videotimer").addClass("radio");
	}
	if (document.getElementById("player-bg-container") && !this.ad)
		document.getElementById("player-bg-container").style.display = "block";

	var vid = document.getElementById('video');
	if (this.addTimer) clearInterval(this.addTimer);

	this.addTimer = setInterval(function () {
		me.getTimeInfo()
		duration = Math.floor(vid.playTime / 1000);
	}, 1000);

	vid.onPlayStateChange = null;
	vid.onPlayStateChange = function(st, err) {
		if (me.oncase != ON_VOD)
			return;
		var state = vid.playState, error = (vid.error ? vid.error.code : 0);
		if (typeof state == 'undefined') {
			state = st;
			error = (err ? err.code : 0);
		}
		/*debug('state '+ state);
		if (state==1 && sonyChrome < 43 && GLOBALS.setVidPos) {
			if (GLOBALS.brtyp) {
				debug("brtyp true vid pos "+ GLOBALS.setVidPos + ' state '+ vid.playState);
				GLOBALS.posi = GLOBALS.setVidPos;
				vid.seek(parseInt(GLOBALS.posi)*1000);
			} else {
				debug("brtyp false "+ GLOBALS.setVidPos);
				GLOBALS.posi = GLOBALS.setVidPos;
				vid.currentTime = GLOBALS.posi;
			}
			GLOBALS.setVidPos = 0;
		}*/

		if (GLOBALS.smid && !me.ad) {
			sendSmid(me, state, error);
		}
	}
	if (GLOBALS.smid && this.oncase == ON_VOD && !this.ad ) {
		debug('start smid timer');
		this.smidTimer = setInterval(function () {
			if (me.isPlaying) {
				var vid = document.getElementById('video');
				if(!vid) return;
				sendSmid(me, vid.playState, 0);
			} else {
				debug('clear smidTimer');
				clearInterval(this.smidTimer);
			}
		}, 30000);
	}

	if (vid && this.isPlaying) {

		try {
			vid.play(1);
			if (this.oncase == ON_FIFA) {
				try {

					this.jumpTo(Math.floor(this.gametime));
				} catch (e) {}
			}

			this.isPlaying = true;
			this.isStopped = false;

		} catch (e) {}
	}

	var me = this;

	this.isStarted = true;
	var me = this;
	if (!this.ad) {
		window.setTimeout(function () {
			me.showBar()
		}, 3000);
	}

	if (NEW_FEATURE) {
		this.getThumbnails();
	}


	if (GLOBALS.channelId == "ott") {
		document.getElementById("basic-videotimer").style.display = "none";
	}
	if (this.ad)
		document.getElementById("basic-videotimer").style.display = "none";

	if (this.ad)
		this.closeBar();
	if (!this.islive && !this.ad && ENABLE_MIDDLE && !GLOBALS.middleTimer) {
		GLOBALS.videoplayer.todo = me.source;
		GLOBALS.middleTimer = setInterval( function() { middlerollVideo(GLOBALS.show); },  20 * 60 * 1000);//XXX
	}
}
VideoPlayer.prototype.closeBar = function () {
	clearTimeout(this.hideTimer);
	this.hideTimer = setTimeout(function () {
		this.openBar = false;
		var obj = document.getElementById("basic-videotimer");
		if(obj && obj.style){
			obj.style.display = 'none';
			obj.style.opacity = 0;
		}
		this.focusedId = 2;
	}, 5000);
}

VideoPlayer.prototype.setMuted = function () {

	var ag = navigator.userAgent.toUpperCase();
	//if(ag.indexOf("LG") > 0 || ag.indexOf("LG") == 0 ) return true;

	this.elem.style.display = "none!important";
	document.getElementById("player-container").style.display = "none";
	document.getElementById("player-bg-container").style.display = "none";
	if (document.getElementById("basic-videotimer")) {
		document.getElementById("basic-videotimer").style.display = "none";
		document.getElementById("basic-videotimer").addClass("muted");
	}
	this.isPlaying = true;
	this.playPause();
}
VideoPlayer.prototype.unsetMuted = function () {
	this.elem.style.display = "block!important";
	document.getElementById("player-container").style.display = "block";
	document.getElementById("player-bg-container").style.display = "block";
	document.getElementById("basic-videotimer").style.display = "block";
	document.getElementById("basic-videotimer").removeClass("muted");
	this.isPlaying = false;
	this.playPause();
}
VideoPlayer.prototype.setTitle = function (title) {

	this.title.innerHTML = title;
}


VideoPlayer.prototype.setFocusedId = function (focusedid) {
	this.focusedId = focusedid;
}

VideoPlayer.prototype.getBtnImage = function (value, on) {

	var ret = "";
	for (var i = 0; i < playerBtns.length; i++) {
		if (!playerBtns[i]) continue;
		if (playerBtns[i].name == value) {
			if (on) {
				ret = playerBtns[i].on;
				break;
			} else {
				ret = playerBtns[i].off;
				break;
			}
		}
	}
	return ret;
}

VideoPlayer.prototype.setFocused = function (otherobj, focus) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (this.focusedId == i) {
				//if(playerBtns[i].name == "play_pause"){//if(i == 1 ) {
				if (this.buttons[i].id == "play_pause") {
					if (this.isPlaying) this.buttons[i].setAttribute("src", playerBtns[2].onPause);
					else this.buttons[i].setAttribute("src", playerBtns[2].onPlay);
				} else this.buttons[i].setAttribute("src", /*playerBtns[i].on*/ this.getBtnImage(this.buttons[i].id, true));
			} else {
				//if(playerBtns[i].name == "play_pause"){//if(i == 1 ) {
				if (this.buttons[i].id == "play_pause") {
					if (this.isPlaying) this.buttons[i].setAttribute("src", playerBtns[2].offPause);
					else this.buttons[i].setAttribute("src", playerBtns[2].offPlay);
				} else this.buttons[i].setAttribute("src", /*playerBtns[i].off*/ this.getBtnImage(this.buttons[i].id, false));
			}
		} else {
			if (this.buttons[i].id == "play_pause") {
				//if(playerBtns[i].name == "play_pause"){//if(i == 1 ) {
				if (this.isPlaying) this.buttons[i].setAttribute("src", playerBtns[2].offPause);
				else this.buttons[i].setAttribute("src", playerBtns[2].offPlay);
			} else this.buttons[i].setAttribute("src", /*playerBtns[i].off*/ this.getBtnImage(this.buttons[i].id, false));
		}
	}
}


VideoPlayer.prototype.handleKeyPress = function (keyCode) {
	if (this.ad && !GLOBALS.dev) return;
	//if(keyCode === VK_RED || keyCode === VK_GREEN || keyCode === VK_YELLOW || keyCode === VK_BLUE) return true;
	this.showBar();

	if (keyCode === VK_RED) {
		if (GLOBALS.focusmgr.getObject("detail")) {
			var obj = GLOBALS.focusmgr.getObject("detail");
			if (obj.trailer) return true;
		}
		this.onRed();
	}
	if (keyCode === VK_GREEN) {
		if (GLOBALS.pageId == 27 || (GLOBALS.pageId == 28)) {

			this.fullScreen();
			GLOBALS.focusmgr.focusObject("formula1-feeds");
			return true;
		}
		if (GLOBALS.pageId == 33) {
			this.fullScreen();
			GLOBALS.focusmgr.focusObject("ronald-garros-feeds");
			return true;
		}

		if (GLOBALS.focusmgr.getObject("detail")) {
			var obj = GLOBALS.focusmgr.getObject("detail");
			if (obj.trailer) return true;
		}
		this.onGreen();

		return true;
	}
	if (keyCode === VK_YELLOW) {
		if (GLOBALS.focusmgr.getObject("detail")) {
			var obj = GLOBALS.focusmgr.getObject("detail");
			if (obj.trailer) return true;
		}
		this.onYellow();
		return true;
	}
	if (keyCode === VK_BLUE) {
		if (GLOBALS.focusmgr.getObject("detail")) {
			var obj = GLOBALS.focusmgr.getObject("detail");
			if (obj.trailer) return true;
		}

		if (this.elem.hasClass("fullHD")) this.onRed();
		else this.onBlue();
		return true;
	}



	switch (keyCode) {
		case VK_1:
			if (this.ad) {
				this.stop();
			} else {
				GLOBALS.videoplayer.todo = this.source;
				middlerollVideo();
			}
			break;
		case VK_PAUSE:
		case VK_PLAY:
			this.focusedId = 2;
			this.playPause();
			this.setFocused(this.idnam, true);
			break;
		case VK_FAST_FWD:
			if (this.islive) break;
			this.focusedId = 3;
			this.fastForward();
			this.trickModePause();
			this.setFocused(this.idnam, true);
			break;
		case VK_REWIND:
			if (this.islive) break;
			this.focusedId = 1;
			this.rewind();
			this.trickModePause();
			this.setFocused(this.idnam, true);
			break;
		case VK_RIGHT:
			if(this.isRadio) break;
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
			this.setFocused(this.idnam, true);
			break;
		case VK_LEFT:
			if(this.isRadio) break;
			this.handleVKLeft();

			break;
		case VK_DOWN:
			this.handleVKDown();
			break;
		case VK_ENTER:
			if(this.isRadio){

				break;
			}

			if (!IN_V2 && this.playerClass == "trailer" && this.isStarted == false) {
				var vid = document.getElementById('video');
				if (!vid) this.start();
				this.isStarted = true;
			}
			//switch(playerBtns[this.focusedId].name){//switch(this.focusedId){

			switch (this.buttons[this.focusedId].id) { //switch(this.focusedId){
				case "subtitles":
					llog("Subtitle Button");
					this.openSubsMenu();
					break;
				case "fullscreen":
					this.fullScreen();
					break;
				case "play_pause":
					llog("Play Pause Button");
					this.playPause();
					break;
				case "stop":
					llog("Stop Button");
					this.stop();
					break;
				case "rewind":
					if (this.islive) break;
					llog("Rewind Button");
					this.rewind();
					// this.trickModePause();
					break;
				case "fast_forward":
					if (this.islive) break;
					llog("Fast Forward Button");
					this.fastForward();
					// this.trickModePause();
					break;
				case "back":
					llog("Back Button");
					if (GLOBALS.action == "mercedes") {
						//location.href = 'http://skai.smart-tv-data.com/?menu=sidebar';
						//else location.href = '../?menu=sidebar';
						break;
					}
					this.handleVKBack();
					break;
			}
			break;
		case VK_UP:
			this.showBar();
			break;
		case VK_BACK:
			var bg = document.getElementById("player-bg-container");
			if (this.oncase == "bigbrother" && bg.hasClass("fullHD"))
				this.fullScreen();
			else {
				if (GLOBALS.action == "mercedes") {
					//location.href = 'http://skai.smart-tv-data.com/?menu=sidebar';
					//else location.href = '../?menu=sidebar';
					break;
				}
				this.handleVKBack();
			}
			break;
		default:

			break;
	}
}

VideoPlayer.prototype.handleVKLeft = function () {

	switch (this.oncase) {
		case ON_TRAILER:
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				GLOBALS.focusmgr.focusObject("detail");
				break;
			}
			this.setFocused(this.idnam, true);

			break;
		default:
			this.focusedId--;
			if (this.focusedId < 0) this.focusedId = 0;
			this.setFocused(this.idnam, true);
			break;
	}
}
VideoPlayer.prototype.handleVKBack = function () {
	if (document.getElementById("subs-container")) {
		document.getElementById("subs-container").innerHTML = "";
	}
	clearInterval(GLOBALS.lbannerTimer);
	clearTimeout(GLOBALS.lbannerTimerFirst);
	clearTimeout(GLOBALS.adTimer);
	if (GLOBALS.middleTimer)
		clearInterval(GLOBALS.middleTimer);
	GLOBALS.middleTimer = null;

	this.close();
	GLOBALS.scenemgr.closeVideoPlayer();
	GLOBALS.scenemgr.setRF();

	if (GLOBALS.focusmgr.getObject("search-results-list")) {
		GLOBALS.focusmgr.focusObject("search-results-list")
		return true;
	}
	console.log(activeCont);
	if (activeCont.idnam == "home-cont")
		GLOBALS.focusmgr.focusObject("home-list-"+ activeCont.focusedId);
	else if (keyLists.indexOf(activeCont.idnam) != -1)
		GLOBALS.focusmgr.focusObject(activeCont.idnam + "-list-"+ activeCont.focusedId);
	else if (activeCont.idnam == "episodes")
		GLOBALS.focusmgr.focusObject("episodes-" + activeCont.subCat);
	else if (activeCont.idnam == "lexeis")
		GLOBALS.focusmgr.focusObject("lexeis-" + activeCont.focusedId);
	else if (activeCont.idnam == "bigbrother" || activeCont.idnam == "stream") {
		GLOBALS.focusmgr.focusObject("episodes-list");
		if (activeCont.idnam == "summer")
			GLOBALS.focusmgr.focusObject("summer-list");
	}
	//if (activeCont.idnam == "sports") GLOBALS.focusmgr.focusObject("sports-list");
	return true;
}

VideoPlayer.prototype.handleVKDown = function () {
	switch (this.oncase) {
		case "bigbrother":
			if (!this.elem.hasClass("fullHD")) {
				var o = GLOBALS.focusmgr.getObject("episodes-list");
				if (o.items.length > 0)
					GLOBALS.focusmgr.focusObject("episodes-list");
			}
			break;
		case ON_TABS:
			GLOBALS.focusmgr.focusObject("camera-tabs");
			break;
		default:
			if (this.playerClass == "trailer") {
				GLOBALS.focusmgr.focusObject("detail");
			}
			//this.setInvisible();
			this.showBar();
			break;
	}
}


VideoPlayer.prototype.close = function () {
	if (GLOBALS.action == "mercedes") {
		//location.href = 'http://skai.smart-tv-data.com/?menu=sidebar';
		//else location.href = '../?menu=sidebar';
	}
	if (document.getElementById("player-bg-container")) document.getElementById("player-bg-container").style.display = "none";
	if (document.getElementById("player-container")) document.getElementById("player-container").style.display = "none";
	if (document.getElementById("subs-container")) document.getElementById("subs-container").style.display = "none";

	/*if(this.playerClass != "trailer" && this.playerClass != "formula1" && this.playerClass != "ronald-garros") document.getElementById("appscreen").removeChild(this.labelVid);
	if(GLOBALS.focusmgr.getObject("24plus-horizontallists")) GLOBALS.focusmgr.getObject("24plus-horizontallists").label24plus.innerHTML = "";
	*/
	if (document.getElementById('video')) {
		var vid = document.getElementById('video');
		devmode("[VideoPlayer.prototype.close] vid stop");
		try {
			vid.stop();
		} catch (e) {}
		//try {vid.release();}catch (e) {}
		try {
			vid.pause();
		} catch (e) {}
		try {
			vid.data = '';
		} catch (e) {}
		try {
			vid.src = '';
		} catch (e) {}
	}
	if (this.addTimer) clearInterval(this.addTimer);
	if (this.smidTimer) {
		clearInterval(this.smidTimer);
	}
	this.isPlaying = false;
	document.getElementById('player-container').innerHTML = '';
	document.getElementById('stop-img').innerHTML = '';
	//this.elem.style.display = 'none';
	this.unregister();
	try {
		if (this.elem) this.parent.removeChild(this.elem);
	} catch (e) {}
	llog("4. [VideoPlayer.prototype.close] Br1");
}

function sendSmid(me, state, error) {
	var xhr = new XMLHttpRequest(), o = {};
	o.url = GLOBALS.item.url;
	o.category = GLOBALS.item.category;
	o.title = GLOBALS.item.show_title;
	o.episode = GLOBALS.item.title;
	o.smid = GLOBALS.smid;
	o.state = state;
	o.error = error;
	o.ua = navigator.userAgent;
	if (state == STATE_PLAYING && GLOBALS.lastVidId)
		o.lastid = GLOBALS.lastVidId;
	if (GLOBALS.dev) {
		console.log(o);
		//debug('sendSmid '+ GLOBALS.smid);
		//debug(JSON.stringify(o));
		return;
	}
	var data = JSON.stringify(o), url = 'smidlog.php';
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	debug('send state '+ state +' for '+ o.title +(error ? ' error '+ error : ''));
	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200) {
				var j = JSON.parse(this.responseText);
				debug('Got response :'+ JSON.stringify(j));
				if (state == STATE_PLAYING && j['success']) {
					if (!GLOBALS.lastPlayId)
						GLOBALS.lastPlayId = j['id'];
					else
						GLOBALS.lastVidId = j['id'];
					debug('set last video id '+ j['id']);
				}
				if (state != STATE_PLAYING) {
					GLOBALS.lastVidId = 0;
					GLOBALS.lastPlayId = 0;
				}
			} else {
				debug('status '+this.status);
			}
		}
	}
	xhr.send(data);
}
VideoPlayer.prototype.recalculateTimer = function () {
	var duration, posi, vid = document.getElementById("video");
	var obj = this.elem.getElementsByClassName('time')[0],
		bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];
	if (vid) {
		if (GLOBALS.brtyp) {
			duration = Math.floor(vid.playTime / 1000);
			GLOBALS.posi = Math.floor(vid.playPosition / 1000);
		} else {
			duration = Math.floor(vid.duration);
			GLOBALS.posi = Math.floor(vid.currentTime);
		}

	}

	if (vid) {
		if (duration === Infinity)
			duration = 0;
		if (obj && duration > 0 && GLOBALS.posi <= duration) {
			//bar.style.width= Math.floor(this.timelineWidth/duration*GLOBALS.posi)+'px';
			obj.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + ' <span id="lower">/ ' + this.toHHMMSS(duration) + '</span>';

			this.timer1.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset);
			this.timer2.innerHTML = this.toHHMMSS(duration - (GLOBALS.posi + GLOBALS.offset));

			this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + '</span>';
			this.runnerleft = this.runnerleftStart + Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));
			this.runner.style.left = this.runnerleft + 'px';
			if (NEW_FEATURE) {
				this.thumbleft = this.thumbleftStart + Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));
				this.thumbContainer.style.left = this.thumbleft + 'px';
			}


			this.duration.style.width = Math.floor(this.timelineWidth / duration * GLOBALS.posi + GLOBALS.offset) + 'px';
			this.barleft = this.barleftStart + Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));
			this.bar.style.left = this.barleft + 'px';
			llog("[VideoPlayer.prototype.recalculateTimer] barleft : " + this.bar.style.left);

			GLOBALS.posi += 1;
			this.videoSeek(1);


		}
	}
}

VideoPlayer.prototype.setTimerBarsStyle = function (fromleft, isFullScreen) {
	this.barleftStart = fromleft;
	this.runnerleftStart = fromleft;


	if (isFullScreen) {
		this.runner.style.top = "-4px";
		//this.runner.style.left = "408px";
		//this.bar.style.left = "408px";
		this.bar.style.top = "20px";


	} else {
		this.runner.style.top = "18px";
		//this.runner.style.left = "202px";
		//this.bar.style.left = "202px";
		this.bar.style.top = "2px";
	}

}

VideoPlayer.prototype.fullScreen = function () {
	if (this.isStopped) {

		return true;
	}

	var obj = document.getElementById("player-container");
	var timer = document.getElementById("basic-videotimer");
	var subs = document.getElementById("subs-container");
	var bg = document.getElementById("player-bg-container");

	if (!obj.hasClass("fullHD")) {


		this.setTimerBarsStyle(408, true);
		if (GLOBALS.pageId == 27 || (GLOBALS.pageId == 28 && GLOBALS.f1_live == false) || GLOBALS.pageId == 33) {
			//timer.removeClass("formula1");
			this.timerClass = "basic-videotimer fullHD";
		}

		obj.className = this.playerClass + " fullHD";
		if (GLOBALS.pageId == 28 || GLOBALS.pageId == 27 || GLOBALS.pageId == 33) {

			obj.className = "fullHD";
			obj.style.zIndex = "1";
		}
		timer.className = this.timerClass /*+ " bottom"*/ ;
		if (this.oncase == "bigbrother") {
			timer.addClass("bbstream");
			bg.addClass("fullHD");
			this.focusedId = 0;
		}
		//if(subs) subs.className = "subs-container fullHD";
		if (subs) subs.className = "subs-container";
		this.elem.addClass("fullHD");
		if (document.getElementById("subs-container")) document.getElementById("subs-container").addClass("fullscreen");
		var me = this;
		this.showBar();
		//this.hideTimer = window.setTimeout(function (){me.setInvisible()}, 8000);
	} else {
		this.setTimerBarsStyle(202, false);
		obj.className = this.playerClass;
		if (this.timeClass) timer.className = this.timerClass;
		this.elem.removeClass("fullHD");

		this.resetPos();
		if (this.oncase == "bigbrother") {
			bg.removeClass("fullHD");
			this.elem.className = "small bbstream";
			timer.className = "basic-videotimer bbstream small";
			obj.className = "player-container bbstream";
		}
	}
	this.recalculateTimer();
}
VideoPlayer.prototype.trickModePause = function () {
	var vid = document.getElementById('video');
	try {
		vid.play(0);
	} catch (e) {}
	try {
		vid.pause();
	} catch (e) {}

	this.isPlaying = false;
	var src = 'img/buttons/Control_Play_HoverBtn.png';

	for (var i = 0; i < this.buttons.length; i++) {
		if (this.buttons[i].id == "play_pause") {
			this.buttons[i].src = src;
			break;
		}
	}
}
VideoPlayer.prototype.trickModePlay = function () {

	var vid = document.getElementById('video');
	try {
		vid.play(1);
	} catch (e) {}
	this.isPlaying = true;
	var src = 'img/buttons/Control_1_Btn.png';
	for (var i = 0; i < this.buttons.length; i++) {
		if (this.buttons[i].id == "play_pause") {
			this.buttons[i].src = src;
			break;
		}
	}
	if (GLOBALS.focusmgr.getObject("thumbs-list")) {
		setTimeout(function () {
			var o = GLOBALS.focusmgr.getObject("thumbs-list");
			o.elem.style.display = "none";
		}, 8000);
	}

}
VideoPlayer.prototype.setPlayPause = function (src) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (this.buttons[i].id == "play_pause") {
			this.focusedId = i;
			this.buttons[i].src = src;
			break;
		}
	}
	return;
}
VideoPlayer.prototype.playPause = function () {
	this.isStopped = false;
	var vid = document.getElementById('video');
	document.getElementById("stop-img").style.display = "none";

	/*var playpauseBtnId = null;
	for(var i=0; i< playerBtns.length; i++){
		if(playerBtns[i].name == "play_pause") {
			playpauseBtnId = i;
			break;
		}
	}*/

	if (this.isPlaying) {
		var src = 'img/buttons/Control_Play_HoverBtn.png';
		this.setPlayPause(src);

		try {
			vid.play(0);
		} catch (e) {}
		try {
			vid.pause();
		} catch (e) {}
		this.isPlaying = false;
	} else {
		var src = 'img/buttons/Control_1_HoverBtn.png';
		this.setPlayPause(src);

		try {
			vid.play(1);
			this.isPlaying = true;
		} catch (e) {}
	}

}

VideoPlayer.prototype.stop = function () {
	if (this.isStopped) {
		return;
	}

	var vid = document.getElementById("video"), me = this;
	if (this.ad) {
		this.ad = false;
		this.isPlaying = true;
		this.isStopped = false;
		this.firsttime = true;
		debug('stop video');
		try {
			vid.stop(0);
		} catch (e) {}
		try {
			vid.pause();
		} catch (e) {}
		try {
			vid.data = '';
		} catch (e) {}
		try {
			vid.src = '';
		} catch (e) {}

		if (this.addTimer) clearInterval(this.addTimer);
		if (this.smidTimer) clearInterval(this.smidTimer);

		if (this.todo) {
			this.setSource(this.todo);
			debug('set video URL');
		}

		if (GLOBALS.adLoop) {
			var ts = (new Date()).getTime()/1000;
			if (ts > GLOBALS.ad.end)
				GLOBALS.adLoop = false;
			this.middleRollTime = 0;
			GLOBALS.adsCnt++;
			middlerollVideo(GLOBALS.show);
			return;
		}
		if (this.middleRollTime) {
			debug('time '+ GLOBALS.videoplayer.middleRollTime);
			GLOBALS.setVidPos = GLOBALS.videoplayer.middleRollTime;
			this.middleRollTime = 0;
			GLOBALS.middleRollDone = 1;
			if (!GLOBALS.middleTimer)
				GLOBALS.middleTimer = setInterval( function() { middlerollVideo(GLOBALS.show); }, 10 * 60 * 1000);
		}
		if (this.todo) {
			debug('start video');
			this.start();
			GLOBALS.focusmgr.focusObject("videoplayer", true);
		} else if (this.oncase == ON_VOD) {
			this.close();
			GLOBALS.scenemgr.closeVideoPlayer();
		}
		return;
	}
	if (GLOBALS.middleTimer)
		clearInterval(GLOBALS.middleTimer);
	GLOBALS.middleTimer = null;

	if (this.isStopped) {
		return;
	}
	clearTimeout(this.hideTimer);
	clearInterval(GLOBALS.lbannerTimer);
	clearTimeout(GLOBALS.lbannerTimerFirst);
	clearTimeout(GLOBALS.adTimer);

	if (ENABLE_POSTROLL && !GLOBALS.adLoop) {
		this.todo=null;
		postrollVideo(GLOBALS.show);
		return;
	}
	try {
		vid.stop(0);
	} catch (e) {}
	try {
		vid.pause();
	} catch (e) {}

	this.isStopped = true;
	this.isPlaying = false;
	this.elem.style.display = "block";


	clearTimeout(this.hideTimer);

	this.focusedId = 1;
	this.setFocused();

	switch (this.oncase) {

		case ON_VOD:
			llog("[VideoPlayer.prototype.handleVKBack] ON VOD");

			this.close();
			GLOBALS.scenemgr.closeVideoPlayer();
			break;

		default:
			break;
	}

}

VideoPlayer.prototype.updateCurrentThumbList = function () {
	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		x = Math.floor(vid.playPosition);
	} else {
		x = Math.floor(vid.currentTime);
	}

	var t = msToTime(x);

	for (var k = 0; k < this.thumbslist.length; k++) {
		if (t <= this.thumbslist[k].to && t >= this.thumbslist[k].from) {
			this.activeBucketId = k;
			break;
		}
	}

}
VideoPlayer.prototype.rewind = function () {
	this.inTrickMode = true;
	this.trickModePause();
	if (GLOBALS.focusmgr.getObject("subtitles-menu")) {
		var subsO = GLOBALS.focusmgr.getObject("subtitles-menu");
		subsO.close();
		document.getElementsByClassName("subs-menu-container")[0].style.visibility = "hidden";
		document.getElementById("subs-container").innerHTML = "";
	}
	var ag = navigator.userAgent.toUpperCase();

	clearInterval(this.addTimer);
	clearTimeout(this.hideTimer);
	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		duration = Math.floor(vid.playTime / 1000);
		GLOBALS.posi = Math.floor(vid.playPosition / 1000);
	} else {
		duration = Math.floor(vid.duration);
		GLOBALS.posi = Math.floor(vid.currentTime);
	}

	if (NEW_FEATURE) this.updateCurrentThumbList();

	if (ag.indexOf("VESTEL") < 0 && ag.indexOf("SHARP") < 0) {
		var me = this;
		if (!this.jumpTimer) {
			try {
				this.jumpTimer = setInterval(function () {
					me.virtualFF(-60, duration)
				}, 100);
			} catch (e) {
				llog("[VideoPlayer.prototype.rewind] FAILS to set Interval " + e);
			}
		}
	} else {
		devmode2("Trick mode Video seek " + this.jumpInterval);

		if (duration > this.jumpInterval && duration <= 180) this.jumpInterval = 60;
		if (duration <= 60) this.jumpInterval = 20;
		this.videoSeek(this.jumpInterval * (-1));
	}

	/*
	var list = GLOBALS.focusmgr.getObject("thumbs-buckets");
	var o = GLOBALS.focusmgr.getObject("bucket-"+list.focusedId);
	if(!GLOBALS.jumpTimer) GLOBALS.jumpTimer = setInterval(function(){list.animThumbsRight()}, 10);
	*/
	this.showBar();

	//this.videoSeek(this.jumpInterval*(-1));
}

VideoPlayer.prototype.rewind22 = function () {
	this.startTrickMode(-1);
}
VideoPlayer.prototype.fastForward22 = function () {
	this.startTrickMode(1);
}
VideoPlayer.prototype.startTrickMode = function (offset) {

	var obj = this.elem.getElementsByClassName('time')[0],
		bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];

	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		duration = Math.floor(vid.playTime / 1000);
		GLOBALS.posi = Math.floor(vid.playPosition / 1000);
	} else {
		duration = Math.floor(vid.duration);
		GLOBALS.posi = Math.floor(vid.currentTime);
	}


	if (obj && duration > 0 && (GLOBALS.posi + GLOBALS.offset) <= duration) {
		var margin = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));

		if ((GLOBALS.posi + GLOBALS.offset) < 0) { //for rewind

			return;
		}

		//bar.style.width= Math.floor(this.timelineWidth/duration*GLOBALS.posi)+'px';
		obj.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + ' <span id="lower">/ ' + this.toHHMMSS(duration) + '</span>';
		this.timer1.innerHTML = this.toHHMMSS((GLOBALS.posi + GLOBALS.offset));
		this.timer2.innerHTML = this.toHHMMSS(Math.floor(duration - (GLOBALS.posi + GLOBALS.offset)));
		this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + '</span>';
		this.runnerleft = this.runnerleftStart + margin;
		if (NEW_FEATURE) {
			this.thumbleft = this.thumbleftStart + Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));
			this.thumbContainer.style.left = this.thumbleft + 'px';
			this.syncthumb(((GLOBALS.posi + GLOBALS.offset) * 1000));
		}
		this.duration.style.width = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset)) + "px";
		this.runner.style.left = this.runnerleft + 'px';

		this.barleft = this.barleftStart + margin;
		this.bar.style.left = this.barleft + 'px';

		GLOBALS.offset = GLOBALS.offset + (1 * offset);

		var me = this;
		GLOBALS.jumpTimer = setTimeout(function () {
			me.startTrickMode(-1)
		}, 100);

		if (GLOBALS.posi + GLOBALS.offset == duration) return;

	}
}
VideoPlayer.prototype.releaseTrickMode = function () {

    var o = GLOBALS.focusmgr.getObject("videoplayer");
    if (o && o.jumpTimer) {

        var vid = document.getElementById("video");
        if (vid) {
            if (GLOBALS.brtyp) {
                duration = Math.floor(vid.playTime / 1000);
            } else {
                duration = Math.floor(vid.duration);
            }

        }


        if (!GLOBALS.focusmgr.getObject("thumbs-list")) {
            llog("video duration before trick mode: " + GLOBALS.posi);
            GLOBALS.posi += GLOBALS.offset;
            if (GLOBALS.posi > duration) GLOBALS.posi = duration;
            llog("video duration on release: " + GLOBALS.posi);
            //o.videoSeek(parseInt(GLOBALS.posi));
            vid.seek(GLOBALS.posi * 1000);
        }

        if (GLOBALS.focusmgr.getObject("thumbs-list")) {
            var tl = GLOBALS.focusmgr.getObject("thumbs-list");
            var timecode = tl.buttons[tl.focusedId].getElementsByClassName("timecode")[0].innerHTML;
            var ret = timecode.split(":");
            var hours = parseInt(ret[0]) * 60 * 60;

            var minutes = parseInt(ret[1]) * 60;
            var seconds = parseInt(ret[2]);
            var totalTime = hours + minutes + seconds;
            GLOBALS.posi = parseInt(totalTime);
            vid.seek(GLOBALS.posi * 1000);
        }

        GLOBALS.offset = 0;
        /*
        o.hideTimer = window.setTimeout(function () {
            o.setInvisible()
        }, 7000);
        */
        clearInterval(o.jumpTimer);
        o.jumpTimer = null;

        o.bucketId = 0;
        o.addTimer = setInterval(function () {
            o.getTimeInfo();
        }, 1000);
        o.trickModePlay();
    }
}
VideoPlayer.prototype.fastForward = function () {
	this.inTrickMode = true;
	this.trickModePause();

	var ag = navigator.userAgent.toUpperCase();

	if (GLOBALS.focusmgr.getObject("subtitles-menu")) {
		var subsO = GLOBALS.focusmgr.getObject("subtitles-menu");
		subsO.close();
		document.getElementsByClassName("subs-menu-container")[0].style.visibility = "hidden";
		document.getElementById("subs-container").innerHTML = "";
	}

	clearInterval(this.addTimer);
	clearTimeout(this.hideTimer);

	var vid = document.getElementById("video");
	if (GLOBALS.brtyp) {
		duration = Math.floor(vid.playTime / 1000);
		GLOBALS.posi = Math.floor(vid.playPosition / 1000);
	} else {
		duration = Math.floor(vid.duration);
		GLOBALS.posi = Math.floor(vid.currentTime);
	}

	if (NEW_FEATURE) this.updateCurrentThumbList();

	if (ag.indexOf("VESTEL") < 0 && ag.indexOf("SHARP") < 0) {
		var me = this;
		llog("[VideoPlayer.prototype.fastForward]");
		if (!this.jumpTimer) {
			devmode2("[VideoPlayer.prototype.fastForward] NO jumpTimer ")
			try {
				this.jumpTimer = setInterval(function () {
					me.virtualFF(60, duration)
				}, 100);
			} catch (e) {
				devmode2("[VideoPlayer.prototype.fastForward] FAILS to set Interval " + e);
			}
		}
	} else {

		devmode2("[VideoPlayer.prototype.fastForward 1. ] video duration : " + duration);
		if (duration > this.jumpInterval && duration <= 180) this.jumpInterval = 60;
		if (duration <= 60) this.jumpInterval = 20;
		devmode2("[VideoPlayer.prototype.fastForward 2. ] jump interval : " + this.jumpInterval);
		this.videoSeek(this.jumpInterval);
	}
	this.showBar();
	//this.videoSeek(this.jumpInterval);
}

VideoPlayer.prototype.jumpTo = function (ms) {
	ms = parseInt(ms);
	if (ms < 0) ms = 0;
	llog("[VideoPlayer.prototype.jumpTo] ms : ", ms);
	var vid = document.getElementById("video");
	try {
		vid.seek(ms);
	} catch (e) {}
}

VideoPlayer.prototype.videoSeek = function (offset) {
	try {
		var lang, posi, vid = document.getElementById("video");
		if (GLOBALS.brtyp) {
			lang = Math.floor(vid.playTime / 1000);
			posi = Math.floor(vid.playPosition / 1000);

		} else {
			lang = Math.floor(vid.duration);
			posi = Math.floor(vid.currentTime);

		}

		videopos = posi + offset;

		if (videopos < 0)
			videopos = 0;
		if (videopos > lang)
			videopos = 0;
		llog("[VideoPlayer.prototype.videoSeek] videopos: " + videopos);
		vid.seek(videopos * 1000);
	} catch (e) {
		llog("[VideoPlayer.prototype.videoSeek] " + e);
	}
}

function msToTime(duration) {
	var milliseconds = parseInt((duration % 1000) / 100),
		seconds = parseInt((duration / 1000) % 60),
		minutes = parseInt((duration / (1000 * 60)) % 60),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	// return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
	return hours + ":" + minutes + ":" + seconds;
}



VideoPlayer.prototype.virtualFF = function (offset, duration) {
	llog("[VideoPlayer.prototype.virtualFF] CALL TRICKMODE");

	var obj = this.elem.getElementsByClassName('time')[0],
		bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];

	//llog("[VideoPlayer.prototype.virtualFF] barleftStart : "+ this.barleftStart);


	if (obj && duration > 0 && (GLOBALS.posi + GLOBALS.offset) <= duration) {
		llog("[VideoPlayer.prototype.virtualFF] BR1");


		var margin = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));

		if ((GLOBALS.posi + GLOBALS.offset) < 0) { //for rewind

			return;
		}

		//bar.style.width= Math.floor(this.timelineWidth/duration*GLOBALS.posi)+'px';
		obj.innerHTML = this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + ' <span id="lower">/ ' + this.toHHMMSS(duration) + '</span>';
		this.timer1.innerHTML = this.toHHMMSS((GLOBALS.posi + GLOBALS.offset));
		this.timer2.innerHTML = this.toHHMMSS(Math.floor(duration - (GLOBALS.posi + GLOBALS.offset)));
		this.duration.style.width = Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset)) + "px";
		this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi + GLOBALS.offset) + '</span>';
		this.runnerleft = this.runnerleftStart + margin;
		if (NEW_FEATURE) {
			this.thumbleft = this.thumbleftStart + Math.floor(this.timelineWidth / duration * (GLOBALS.posi + GLOBALS.offset));
			this.thumbContainer.style.left = this.thumbleft + 'px';
			this.syncthumb(((GLOBALS.posi + GLOBALS.offset) * 1000));
		}

		this.runner.style.left = this.runnerleft + 'px';

		this.barleft = this.barleftStart + margin;
		this.bar.style.left = this.barleft + 'px';

		GLOBALS.offset = GLOBALS.offset + (1 * offset);


		llog("[VideoPlayer.prototype.virtualFF] NEW OFFSET : " + GLOBALS.offset);

		if (GLOBALS.posi + GLOBALS.offset == duration) return;

	}
}
VideoPlayer.prototype.enableTrickMode = function (offset, duration) {
	this.virtualFF(offset, duration);
	return true;
}
VideoPlayer.prototype.displayThumb = function (time) {
	//llog("[VideoPlayer.prototype.displayThumb] Thumbslist : ", this.thumbslist);
	var t = msToTime(time);
	if (t > this.thumbslist[this.activeBucketId].to) this.activeBucketId++;

}

VideoPlayer.prototype.syncthumb = function (time) {
	var t = msToTime(time);
	if (t > this.thumbslist[this.activeBucketId].to || t < this.thumbslist[this.activeBucketId].from) this.updateCurrentThumbList();
	var list = this.thumbslist[this.activeBucketId].list;
	for (k = 0; k < list.length; k++) {
		//llog("[VideoPlayer.prototype.syncthumb] t:"+t+" - timecode:"+list[k].timecode+"");
		if (list[k].timecode == t) {
			//	llog("[VideoPlayer.prototype.syncthumb] thumbnail : ", list[k].imagePath);
			this.thumbContainer.innerHTML = "<div><div><b>" + list[k].timecode + "</b></div><img src='" + list[k].imagePath + "' /></div>";
			break;
		}
	}
}


VideoPlayer.prototype.getTimeInfo = function () {
	if (this.oncase != ON_MOSAIC) {
		var posi, x, lang,
			vid = document.getElementById("video"),
			obj = this.elem.getElementsByClassName('time')[0],
			bar = this.elem.getElementsByClassName('basic-timeline')[0].getElementsByClassName('duration')[0];
		if (!vid) return;

		if (GLOBALS.brtyp) {
			lang = Math.floor(vid.playTime / 1000);
			posi = Math.floor(vid.playPosition / 1000);
			GLOBALS.posi = Math.floor(vid.playPosition / 1000);
			x = Math.floor(vid.playPosition);
		} else {
			lang = Math.floor(vid.duration);
			posi = Math.floor(vid.currentTime);
			GLOBALS.posi = Math.floor(vid.currentTime);
			x = Math.floor(vid.currentTime);
			if (0 && !GLOBALS.middleRollDone && GLOBALS.posi == 10 && !this.ad) {
				debug('start middle roll');
				this.todo = this.source;
				middlerollVideo();
			}
		}

		if (vid.playState == 5) {
			devmode("[VideoPlayer.prototype.getTimeInfo(STOP- playstate finished)] duration: " + lang + ", position: " + posi);
			this.stop();
			return;
		}

		var bucketNotFound = true;
		document.getElementById("subs-container").style.visibility = "visible";
		if (this.hasSubtitles) {
			if (GLOBALS.focusmgr.getObject("subtitles-menu")) {
				if (GLOBALS.focusmgr.getObject("subtitles-menu")) {
					var o = GLOBALS.focusmgr.getObject("subtitles-menu");
					if (o.buckets != null) {
						while (bucketNotFound) {
							var t = msToTime(x);
							if (t > o.buckets[this.bucketId].to) this.bucketId++;
							else bucketNotFound = false;

						}
						o.syncdata(x, this.bucketId);
					}
				}
			}

		}


		if (NEW_FEATURE) {
			//keep updating the thumbnail
			var t = msToTime(x);
			/*for(var k = 0; k < this.thumbslist.length; i++){
				if(t > this.thumbslist[this.activeBucketId.to]) this.activeBucketId++;
				else if (t< this.thumbslist[this.activeBucketId].from ) this.activeBucketId--;
			}
			if(this.activeBucketId < 0) this.activeBucketId = 0;
			if(this.activeBucketId > this.thumbslist.length-1) this.activeBucketId = this.thumbslist.length-1;
			//if(t > this.thumbslist[this.activeBucketId].to) this.activeBucketId++;	
			*/
			this.syncthumb(x);

		}

		if (obj && lang > 0) {
			//bar.style.width= Math.floor(this.timelineWidth/lang*GLOBALS.posi)+'px';
			obj.innerHTML = this.toHHMMSS(GLOBALS.posi) + ' <span id="lower">/ ' + this.toHHMMSS(lang) + '</span>';
			this.timer1.innerHTML = this.toHHMMSS(GLOBALS.posi);
			this.timer2.innerHTML = this.toHHMMSS(Math.floor(lang - GLOBALS.posi));

			this.runner.innerHTML = '<span id="lower">' + this.toHHMMSS(GLOBALS.posi) + '</span>';
			this.runnerleft = this.runnerleftStart + Math.floor(this.timelineWidth / vid.duration * GLOBALS.posi);
			this.runner.style.left = this.runnerleft + 'px';
			this.duration.style.width = Math.floor(this.timelineWidth / lang * GLOBALS.posi) + "px";
			this.barleft = this.barleftStart + Math.floor(this.timelineWidth / vid.duration * GLOBALS.posi);
			this.bar.style.left = this.barleft + 'px';
			//llog("[VideoPlayer.prototype.getTimeInfo] posi: ", this.toHHMMSS(GLOBALS.posi));
		}
	} // if not mosaic

	this.showPlayState();
}

VideoPlayer.prototype.checkBBState = function () {
	var vid = document.getElementById("video");
	if (this.oncase == "bigbrother") {
		if (vid.playState == "connecting" || vid.playState == "buffering") {
			document.getElementById("bbstate").addClass("bbnot");
		} else document.getElementById("bbstate").removeClass("bbnot");
	}
}
VideoPlayer.prototype.showPlayState = function () {

	var vid = document.getElementById("video");
	var txt = "";
	if (GLOBALS.brtyp) {
		switch (vid.playState) {
			case 0:
				txt = "stopped";
				break;
			case 1:
				txt = "playing";
				if (GLOBALS.setVidPos) {
					window.setTimeout(function () {
						if (GLOBALS.brtyp) {
							debug("[onstatechange] vid pos "+ GLOBALS.setVidPos + ' state 1');
							GLOBALS.posi = GLOBALS.setVidPos;
							var done = false, retries = 4, tm = GLOBALS.setVidPos*1000;
							trySeek();

							function trySeek() {
								done = vid.seek(tm);
								debug('done '+ done +' try '+ retries);
								retries--;
								if (!done && retries > 0)
									setTimeout(trySeek, 100);
							}
						} else {
							debug("brtyp false "+ GLOBALS.setVidPos);
							GLOBALS.posi = GLOBALS.setVidPos;
							vid.currentTime = GLOBALS.posi;
						}
						GLOBALS.setVidPos = 0;
					}, 200);
				}
				if (this.oncase != ON_MOSAIC && this.isFirstTime) {

					this.elem.style.opacity = 1;
					this.elem.style.display = "block";
					this.showBar();
					this.isFirstTime = false;

				}
				document.getElementById("player-bg-container").style.display = "none";
				// devmode2("STATUS PLAYING ");
				//  document.getElementById("player-container").style.display = "block";
				if (this.gametime && this.oncase == ON_FIFA) {
					try {
						this.jumpTo(Math.floor(this.gametime));
						this.gametime = null;

					} catch (e) {}
				}

				if (this.firsttime && !this.ad) {
					devmode2("STATUS PLAYING ");
					this.elem.style.display = "block";
					this.firsttime = false;
				}



				break;
			case 2:
				txt = "pause";
				break;
			case 3:
				txt = "connecting";
				document.getElementById("player-bg-container").style.display = "block";
				if (this.isFirstTime) this.elem.style.display = "none";



				break;
			case 4:
				txt = "buffering";
				if (this.oncase == ON_MOSAIC) {
					document.getElementById("player-bg-container").style.display = "block";
				}
				if (this.oncase != ON_TRAILER) {
					document.getElementById("player-bg-container").style.display = "block";
					//document.getElementById("player-container").style.display = "none";
					if (this.isFirstTime) this.elem.style.display = "none";
				}

				break;
			case 5:
				txt = "finished";
				/*if(GLOBALS.pageId == 28){
					var o = GLOBALS.focusmgr.getObject("formula1-feeds");
					o.setSelected();
					break;
				}*/
				//	document.getElementById("player-container").style.display = "none";
				//EVI WAS REMOVED 	this.elem.style.display = "none";
				if (this.oncase == ON_TABS) {
					this.isPlaying = true;
					var obj = GLOBALS.focusmgr.getObject("camera-tabs");
					obj.play();
					//llog("Br1");
					//	document.getElementById("player-container").style.display= "none";
				}
				//EVI TODO Below that was removed otherwise play tab in sequence failed... check rest players on other apps..
				if (this.oncase != ON_TABS && this.oncase != ON_MOSAIC && !this.da) {
					document.getElementById("player-bg-container").style.display = "none";
					//	clearInterval(this.addTimer);
				}

				//BUG Frank remove hir
				//this.stop();
				//this.close();
				//GLOBALS.scenemgr.closeVideoPlayer();

				break;

			case 6:
				txt = "error";
				break;
		}
	} else
		document.getElementById("player-bg-container").style.display = "none";
	if (this.oncase == "bigbrother") {
		this.checkBBState();
	}
}

VideoPlayer.prototype.toHHMMSS = function (sec_num) {
	var sec_num = parseInt(sec_num, 10);
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var time = hours + ':' + minutes + ':' + seconds;
	return time;
}


VideoPlayer.prototype.showBar = function () {
	if (this.ad) return;
	if (this.oncase == ON_MOSAIC || GLOBALS.pageId == 19) {
		if (this.hideTimer) clearTimeout(this.hideTimer);
		if (this.addTimer) clearInterval(this.addTimer);
		if (document.getElementById("basic-videotimer")) {
			var obj = document.getElementById("basic-videotimer");
			obj.style.display = "none";
		}
		return;
	}


	var ag = navigator.userAgent.toUpperCase();
	if (ag.indexOf("VESTEL") > 0 || ag.indexOf("SHARP") > 0) {
		if (this.addTimer) clearInterval(this.addTimer);
		var me = this;
		this.addTimer = setInterval(function () {
			me.getTimeInfo()
		}, 1000);
	}
	llog("show bar i open basic videotimer");
	var basicTimer = document.getElementById("basic-videotimer");
	if(basicTimer){
		basicTimer.style.display = 'block';
		basicTimer.style.opacity = 1;
	}



	if (this.hideTimer) clearTimeout(this.hideTimer);
	this.timer_cc = 0;
	var me = this;
	this.hideTimer = window.setTimeout(function () {
		me.setInvisible()
	}, 5000);

}

VideoPlayer.prototype.setInvisible = function () {

	if (this.oncase == ON_MOSAIC || GLOBALS.pageId == 19) return;
	if (GLOBALS.channelId == "ott") {
		if (document.getElementById("basic-videotimer")) document.getElementById("basic-videotimer").style.display = "none";
		return;
	}
	if (GLOBALS.focusmgr.getObject("subtitles-menu")) {
		var subsO = GLOBALS.focusmgr.getObject("subtitles-menu");
	}


	if (this.hideTimer) clearTimeout(this.hideTimer);
	var obj = document.getElementById("player-container");
	if (!obj) return;
	if (!obj.hasClass("fullHD")) {
		return;
	}
	this.timer_cc++;
	var o, obj = document.getElementById("basic-videotimer");
	if (!obj) return;
	//this.focusedId = 2;
	this.setFocused(this.idnam, true);
	obj.style.display = 'block';
	o = parseFloat(obj.style.opacity);
	if (isNaN(o)) o = 1;
	//o-=0.1;
	//o=o.toFixed(1);
	//obj.style.opacity=o;
	if (subsO && subsO.elem) subsO.elem.style.opacity = o;
	//if(o<=0 || this.timer_cc>9){
	obj.style.display = 'none';
	// this.timer_cc=0;
	// obj.style.opacity='0.7';
	// if(document.getElementsByClassName("subs-menu-container")[0]) document.getElementsByClassName("subs-menu-container")[0].style.visibility = "hidden";
	if (document.getElementById("subs-container")) document.getElementById("subs-container").innerHTML = "";
	if (subsO) {
		subsO.close();
		GLOBALS.focusmgr.focusObject("videoplayer");
	}
	return;
}



function startRF() {
	return;
}

function stopRF() {
	var tvbild = document.getElementById("tvbild");
	tvbild.style.display = "none";
}


function getNewChannel(sid) {
	return 0;
}

function loadScene(pageid) {

	var e, i, parent = document.getElementById("appscreen");
	parent.style.display = "none";
	GLOBALS.hidemgr.setHidden(false);
	GLOBALS.pageId = parseInt(pageid);
	if (!GLOBALS.scenemgr) GLOBALS.scenemgr = new SceneManager();
	GLOBALS.scenemgr.baseInit(GLOBALS.pageId);
}

function initApp() {
	if(GLOBALS.useRef){
		// Monitor instance must be accessible in the application. 
		// If Monitor implementation is not included, empty interface does nothing but must be present
		if( typeof Monitor == "undefined"){
			Monitor = new monitor( null );
		}
	}
	var n = parseInt(getCookie('user_id'));
	if (!isNaN(n))
		GLOBALS.userId = n;

	if(GLOBALS.useDrm){
		document.getElementById("ondev").innerHTML += " TEST DRM";
		document.getElementById("ondev").style.display = "block";
	}

	var pageid = 46;
	moves("Άνοιγμα Εφαρμογής");
	var req = createHttpRequest('runapp.php', function (ret) {
		req = null;
	});
	if (smarttv_id)
		devmode2('Smart id: '+ smarttv_id);
	devmode2(navigator.userAgent);
	GLOBALS.smid = smarttv_id;
	if (location.host == "127.0.0.1" || location.host == "localhost" || location.host == "smarttv.anixa.tv") {
		GLOBALS.dev = 1;
		//LOG=1;
		document.getElementById("log-message").style.display = "block";
		if (!GLOBALS.smid) {
			GLOBALS.smid = 12;
			smarttv_id=12;
		}
		ENABLE_LOGIN=1;
	}



	rikmenu= [
		{
			"name": "Αρχική",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "home"
		},
		{
			"name": "Σειρές",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "series"
		},
		{
			"name": "Δελτία Ειδήσεων",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "deltia"
		},
		
		{
			"name": "Ενημέρωση",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "news"
		},
		{
			"name": "Ψυχαγωγία",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "shows"
		},
		{
			"name": "Πολιτισμός",
			"active": true,
			"image_on":"",
			"image_off":"",
			"classname":"culture"
		},
		{
			"name": "Αθλητικά",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "sports"
		},
		{
			"name": "Παιδικά",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "child"
		}/*,
		{
			"name": "LIVE",
			"active": true,
			"image_on":"",
			"image_off":"",
			"classname":"live"
		},*//*,
		
		{
			"name": "Είσοδος",
			"active": true,
			"image_on": "",
			"image_off": "",
			"classname": "srch"
		}*/

			
		// {
		//     "name": "",
		//     "image_on": "",
		//     "image_off": "",
		//     "classname": "lexeis"
		// },
		/*
    {
	"name": "Όροι Χρήσης",
	"image_on": "",
	"image_off": "",
	"classname": "info"
    }*/
		// {
		//     "name": "",
		//     "image_on": "",
		//     "image_off": "",
		//     "classname": "bigbrother"
		// }
	];
	if (SHOW_BB) {
		var info = {
			"name": "",
			"image_on": "",
			"image_off": "",
			"classname": "bigbrother"
		};
		skaimenu.push(info);
	}
	if (SHOW_MENU_INFO) {
		var info = {
			"name": "Όροι Χρήσης",
			"image_on": "",
			"image_off": "",
			"classname": "info"
		};
		skaimenu.push(info);
	}

	debug('profile: '+ JSON.stringify(profile));
	try {
		/*
		if (document.getElementById('mybroadcast')) {
			var vid = document.getElementById('mybroadcast');
			vid.type = 'video/mpeg';
			vid.data = 'http://stream.anixe.net/live/skai/mpeg.2ts';
			vid.play(1);
		}
		*/
		document.getElementById('mybroadcast').bindToCurrentChannel();
		document.getElementById('mybroadcast').stop();
	} catch (e) {};


	document.getElementById("tvbild").style.visibility = "visible";
	initHbbTV(FocusManager.KEYSET_ENABLED);
	GLOBALS.timediffLocal = GLOBALS.timediffUTC = 0;
	GLOBALS.hidemgr = new HideManager("hidemsg", "appscreen");


	try {
		var elm = document.getElementById('appmgr');
		var app = elm.getOwnerApplication(document);
		app.privateData.keyset.setValue(0x01 + 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x100 + 0x400);
	} catch (e) {};

	GLOBALS.timehelper = new TimeHelper();
	GLOBALS.focusmgr.handleGlobalKey = function (keyCode) {
		if (keyCode === VK_RED && !GLOBALS.noclose) {
			if (!GLOBALS.allowbroadcast && !GLOBALS.focusmgr.hidden) {
				try {
					window.close();
				} catch (e) {}
			} else {
				initHbbTV(FocusManager.KEYSET_ENABLED);

			}
			return true;
		}
		if (GLOBALS.focusmgr.hidden) {
			return false;
		}
		if (keyCode === VK_BLUE && GLOBALS.allowbroadcast) {

			closeApp();
			return true;
		}
		if (keyCode === VK_BACK) {

			try {
				if (GLOBALS.destroyonback) {

					document.getElementById("appmgr").getOwnerApplication(document).destroyApplication();
					return true;
				}
				if (GLOBALS.closeonback) {

					window.close();
					return true;
				}
			} catch (ignore) {}
		}
		return false;
	};
	GLOBALS.timehelper.init(function () {
		var hiddenList = document.createElement("ul");
		hiddenList.id = "videoList";
		hiddenList.style.display = 'none';
		document.getElementById("appscreen").appendChild(hiddenList);
		document.getElementById("appscreen").appendChild(createClassDiv(0, 25, "top-sepdiv"));
		var indexDiv = createClassDiv(66, 30, "index");
		document.getElementById("appscreen").appendChild(indexDiv);
		showApplication();
	});
	document.getElementById("appscreen").style.display = "none";
	var dd = new Date().toISOString().split('T'), hh = dd[1].split(':'), h = new Date().getHours();
	var dthm = parseInt(dd[0].replace(/-/g, '') + h + hh[1]);
	if (dthm > 202507281000)
		ENABLE_LOGIN=0;

	var me = this;
	var url = 'menu.php?'+Math.random();
	this.req = createHttpRequest(url, function (ret) {
		me.req = null;
		menu = JSON.parse(ret);
		if (ENABLE_LOGIN) {
			var a = {
				"name": 'Είσοδος',
				"image_on": "",
				"active": true,
				"image_off": "",
				"classname": "signup"
			};
			skaimenu.unshift(a);
			menu.unshift(a);
		}

		if (ENABLE_CONSENT) {
			/* FOR TESTING - DELETE FOR PRODUCTION */
			deleteCookie("cookie_consent");
			if(getCookie("cookie_consent") != ""){
				loadScene(pageid);
			} else {

				var consentFrame = new ConsentFrame("consentFrame");
				consentFrame.init(document.body,"","");
			}
		} else
			loadScene(pageid);

		if (GLOBALS.dev){
			/*if(!getCookie('SkaiMsgrId')){
				GLOBALS.popup = new ChatPopup('popup');
				GLOBALS.popup.init(document.body, 0, 0);
				GLOBALS.popup.intro();
			}*/
		}
	});

}

function loadPageAfterMuteIsEnabled() {
	GLOBALS.scenemgr.baseInit(GLOBALS.pageId);
}


function createColButton(parent, x, col, captiontxt) {
	if (!parent) {
		parent = document.getElementById("appscreen");
	}
	var e = createClassDiv(x, 654, "colbuttontxt");
	e.innerHTML = captiontxt;
	e.appendChild(createClassDiv(false, false, "colbutton" + col));
	parent.appendChild(e);
}

function restartApp() {

}

function closeApp() {
	var tvbild = document.getElementById("tvbild");
	tvbild.innerHTML = '<object id="mybroadcast"  type="video/broadcast"></object>';
	if (document.getElementById('mybroadcast')) {
		try {
			var dvb = document.getElementById('mybroadcast');
			dvb.bindToCurrentChannel();
		} catch (e) {}
	}

	return false;

}

function runApplication(appid, appurl, params) {
	closeApp();
	return;

}

function phpDebug(txt) {
	try {} catch (e) {}
}

function mydebug(txt) {
	var elem = document.getElementById("debug");
	if (elem) {
		elem.innerHTML = textHtmlEncode(txt, true);
	}
}
