/*
 * HbbTV App for skai - https://www.skaitv.gr/
 * (C) 2020 - Real TV
 * started at 10/02/2020
 *
 */
var activeCont = infotop = privacyTop = newsShowId = currScene = 0, lastVid=null, LBANNER_CATS = ['French League LIVE'];
var onpc = /Firefox/i.test(navigator.userAgent);
var newsarray = [], ENABLE_PREROLL = true;
if (GLOBALS.dev)
	LBANNER_CATS.push('Γαλλικό Πρωτάθλημα Ποδοσφαίρου');
LBANNER_CATS.push('Big Brother Live');
function getSchedule() {
	var schedule = GLOBALS.scenemgr.live.schedule;
	var ts = (new Date()).getTime()/1000, ret = [];

	for (var i = 0;i < schedule.length;i++) { //check for schedule
		var sc = schedule[i];
		//if (i<2)
			//ret.push(sc);
		if (sc.start <= ts && sc.end > ts) {
			ret.push(sc);
		}
	}
	//ret.push(schedule[0]);
	return ret;
}
function getScheduleAll() {
	var schedule = GLOBALS.scenemgr.live.schedule, ret=[];
	var ts = (new Date()).getTime()/1000;
	for (var i = 0;i < schedule.length;i++) { //check for schedule
		var sc = schedule[i];
		if (sc.end > ts && sc.start > ts) {
			ret.push(sc);
		}
	}
	return ret;
}
function getScheduleNext() {
	var schedule = GLOBALS.scenemgr.live.schedule;
	var ts = (new Date()).getTime()/1000;

	for (var i = 0;i < schedule.length;i++) { //check for schedule
		var sc = schedule[i];
		if (sc.end > ts) {
			return sc;
		}
	}
	return null;
}
function getNextAd(ads) {
	if (!ads || !ads.length)
		return;
	var ts = (new Date()).getTime()/1000;

	for (var i = 0;i < ads.length;i++) {
		var ad = ads[i];
		if (ad.end > ts) {
			return ad;
		}
	}
	return null;
}

function getVersion() {
    var version = "",
        useragent = navigator.userAgent.toLowerCase();
    if (navigator.userAgent.indexOf('AppleWebKit/535.20') != -1) return ("1.2.1");
    var arr = useragent.split("hbbtv/");
    if (arr.length > 1) {
        version = arr[1].substr(0, 5);
    }
    return version;
}
var radioStreams = {
    show:"radio",
    shows:[
    /*{
        id:1,
        title:"Skai LiveHD",
        subtitle:"",
	    menu_icon: 'img/radio/skai-livehd.png',
        media_item_link :"https://stream3.anixe.net/live/skai/mpeg.2ts",
        bg:"./img/radio/skairadio_bg.jpg",
        controller:"skailive_controller"
    },
    {
        id:1,
        title:"Christmas Skai Radio",
        subtitle:"",
	    menu_icon: 'img/radio/xmas.jpg',
        media_item_link :"http://cdn5.smart-tv-data.com/skai/xmasradio-skai/mpeg.2ts",
        bg:"./img/radio/xmas_bg.jpg",
        controller:"xmas_controller"
    },*/{
        id:2,
        title:"Skai 100.3",
        subtitle:"",
	    menu_icon: 'img/radio/skai.jpg',
        media_item_link :"http://cdn5.smart-tv-data.com/skai/skai/mpeg.2ts",
        bg:"./img/radio/skairadio_bg.jpg",
        controller:"skairadio_controller"
    },
    {
        id:3,
        title:"Sport-FM 94.6",
        subtitle:"",
	    menu_icon: 'img/radio/sportfm.jpg',
        media_item_link :"http://cdn5.smart-tv-data.com/skai/SportFM/mpeg.2ts",
        bg:"./img/radio/sportfm_bg.jpg",
        controller:"sportfm_controller"
    },
    {
        id:4,
        title:"Menta 88",
        subtitle:"",
	    menu_icon: 'img/radio/menta.jpg',
        media_item_link :"http://cdn5.smart-tv-data.com/skai/Menta88/mpeg.2ts",
        bg:"./img/radio/menta_bg.jpg",
        controller:"menta_controllers"
    },
    {
        id:5,
        title:"Pepper 96.6",
        subtitle:"",
	    menu_icon: 'img/radio/pepper.jpg',
        media_item_link :"http://cdn5.smart-tv-data.com/skai/Pepper966/mpeg.2ts",
        bg:"./img/radio/pepper_bg.jpg",
        controller:"pepper_controller"
    },
    {
        id:6,
        title:"Happy 104",
        subtitle:"",
	    menu_icon: 'img/radio/happy.jpg',
        media_item_link :"http://cdn5.smart-tv-data.com/skai/Happy104/mpeg.2ts",
        bg:"./img/radio/happy_bg.jpg",
        controller:"happy_controller"
    }
    ]
};

function VideoPreview(idnam) {
    this.idnam = idnam;
    this.prevsource = "";
}
VideoPreview.prototype = new BaseObject();
VideoPreview.prototype.init = function(parent,xpos,ypos) {
    this.playerType = "oipf";
    this.firstPreview = 1;
    //GLOBALS.scenemgr.initVideoPlayer();
    console.log("UA",navigator.userAgent);
    debug("UA:"+navigator.userAgent);
    if (!navigator.userAgent.includes("HbbTV")) 
        this.playerType = "html5";
    console.log("type:",this.playerType);
    debug("selected "+this.playerType+" player");
    
    var dvb = document.getElementById("mybroadcast");
    if(this.playerType == "oipf"){
        try{
        dvb.bindToCurrentChannel();
        dvb.stop();
        }catch(e){}
    }
    if(dvb) dvb.style.display = "none";
    this.container = document.createElement("div");
    this.container.id = "previewcont";
    this.bg = document.createElement("img");
    this.bg.id = "showbg";
    this.video = $('<object type="video/mp4"  id="videopreview" ></object>')[0];
    console.log("videopreview this.video", this.video);
    if(this.playerType == "html5"){
        this.video = document.createElement("video");
        this.video.id = "videopreview";
        this.video.muted = true;
    }
    //this.video.id = this.idnam;
    //this.elem.type = "video/mp4";
    this.shadow = document.createElement("div");
    this.shadow.id = "videoshadow";
    this.container.appendChild(this.bg);
    this.container.appendChild(this.video);
    this.container.appendChild(this.shadow);
    if(GLOBALS.ui == 2){
        this.container.addClass("full");
    }
    parent.appendChild(this.container);
    var me = this;

    
    if(GLOBALS.ui == 3)
        this.video.style.display = "none";

    //if(this.video) this.pause();
}
VideoPreview.prototype.pause = function(){
    if(GLOBALS.ui == 3 || !this.video) return;
    debug("pausing video preview");
   this.video.style.transition = "none";
    //debug("THIS VIDEO : "+JSON.stringify(this.video));
    if(this.playerType == "oipf"){
        this.video.stop();
    }else {
        this.video.pause();
    }
    this.video.style.opacity = 0;
    this.video.style.display = "none";
}
VideoPreview.prototype.play = function(){
    
    if(GLOBALS.ui == 3) return;
    debug("playing video preview again");
    this.video.style.opacity = 0;
    if(this.playerType == "oipf"){
        this.video.play(1);
    }else{
        this.video.play();
    }
    this.video.style.display = "block";
    //this.video.style.transition = "opacity 0.5s ease-in-out";
    this.video.style.opacity = 1;



               
}

VideoPreview.prototype.setSource = function(source){


    if(this.firstPreview){
        this.pause();
        this.firstPreview = 0;
    }
    if(this.prevsource == source) {
        return ;
    }
    this.prevsource = source;

    if (this.video && source == this.video.data || GLOBALS.ui == 3) return;
    var dvb = document.getElementById("mybroadcast");
    try {
        dvb.bindToCurrentChannel();
        debug('stop RF');
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
    var me = this;
    if(this.video){
        this.video.style.opacity = 0;
        this.video.onPlayStateChange = function(state) {
            debug("onPlayStateChange "+ me.video.playState);

            if (me.video.playState === 1) { 
                me.video.style.transition = "opacity 2s ease-in-out";
                me.video.style.opacity = 1;
                //me.container.style.transition = "opacity 2s ease-in-out";
                //me.container.style.opacity = 1;

                me.video.style.display = "block";
            /*     setTimeout(function () {
                    debug('start fading out');
                  me.video.style.opacity = 0;
                 //me.container.style.opacity = 0;
                  me.video.addEventListener("transitionend", function () {
                    debug('stop VideoPreview');
                    GLOBALS.videopreview.pause();
                    //me.container.style.display = "none";
                    me.video.style.display = "none";
                  });

                }, 10000); */
            }
            if (me.video.playState == 5){
                me.video.style.opacity = 0;
                me.video.style.display = "none";
            }

        }   

        debug("setting source: "+source);   
        if(me.playerType == "oipf"){
            me.video.data = source;
            
                me.video.play(1);
           
        }else{
            me.video.pause();
            me.video.src = source;
            me.video.load();





            me.video.oncanplay = function () {
                me.video.style.display = "block";
                me.video.style.transition = "opacity 2s ease-in-out";
                me.video.style.opacity = 1;
                
                me.video.style.display = "block";
                me.video.play(); 



                
            };
            me.video.onended = function() {
                me.video.style.opacity = 0;
                me.video.style.display = "none";
            }


        }
    }

}


/*
 * --- Skai Object ---
 * Initial container for home page, will also load JSON.
 * Functions:
 *  - init: init app, load JSON URL
 *  - parseJSON: parse JSON file and init menu
 *  - setRF: start RF channel
 */

function PopUp(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
}
PopUp.prototype = new BaseObject();
PopUp.prototype.init = function (parent, xpos, ypos) {
    var e = createClassDiv("", "", "popup");
    this.parent = parent;
    this.parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

    this.outer = createClassDiv("", "", "outer");
    this.elem.appendChild(this.outer);
    var text = createClassDiv("", "", "text hor");
    text.innerHTML = "<p><h3>Πριν ξεκινήσουμε</h3> Ανοίγοντας αυτή την εφαρμογή αποδέχεστε τους όρους χρήσης που επιτρέπουν την καταμέτρηση του αριθμού των χρηστών που περιηγούνται στην εφαρμογή. Αυτό επιτρέπει τη βελτίωση της εμπειρίας χρήστης μέσα από τη συλλογή των δεδομένων αυτών. Στις Ρυθμίσεις μπορείτε να επεξεργαστείτε τα Cookies και να τα τροποποιήσετε όποτε το επιθυμείτε.</p>";
    this.outer.appendChild(text);
    this.btns = createClassDiv("", "", "buttons hor");
    this.outer.appendChild(this.btns);

    var inner = createClassDiv("", "", "inner");
    inner.innerHTML = "Αποδέχομαι";
    this.btns.appendChild(inner);
    this.buttons[0] = inner;

    var inner = createClassDiv("", "", "inner");
    inner.innerHTML = "Δεν Αποδέχομαι";
    this.btns.appendChild(inner);
    this.buttons[1] = inner;

    var inner = createClassDiv("", "", "inner");
    inner.innerHTML = "Όροι Χρήσης";
    this.btns.appendChild(inner);
    this.buttons[2] = inner;
}
PopUp.prototype.setFocused = function (otherobj, focus) {

    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            this.elem.style.display = "block";
            if (i == this.focusedId) this.buttons[i].addClass("focused");
            else this.buttons[i].removeClass("focused");
        } else this.buttons[i].removeClass("focused");
    }
}
PopUp.prototype.handleKeyPress = function (keycode) {
    if (keycode === VK_RED) {
        this.onRed();
    }
    switch (keycode) {
        case VK_RIGHT:
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
            this.setFocused(this.idnam, true);
            break;
        case VK_LEFT:
            this.focusedId--;
            if (this.focusedId < 0) this.focusedId = 0;
            this.setFocused(this.idnam, true);
            break;
        case VK_ENTER:
            if (this.focusedId == 0) {
                this.elem.style.display = "none";
                setCookie("std_anx", 'ok', 7);
                setCookie("stk_anx", 'ok', 7);
                GLOBALS.focusmgr.focusObject("home-list", true);
                break;
            } else if (this.focusedId == 1) {
                this.elem.style.display = "none";
                setCookie("std_anx", 'off', 7);
                setCookie("stk_anx", 'off', 7);
                goRed('http://78.46.91.85/home/index.php?s=' + GLOBALS.channelId);
                break;
            } else if (this.focusedId == 2) {
                goRed('info-skai.html?s=' + GLOBALS.channelId);
            }
            break;
        default:
            break;
    }
}


function Skai(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
}

Skai.prototype = new BaseObject();
Skai.prototype.init = function (parent, xpos, ypos) {
	var cont = createClassDiv("", "", "skai-list");
	this.parent = parent;
	this.parent.appendChild(cont);
	this.baseInit(cont);
	this.register();
	this.buttons = [];

	var me = this;
    //var url = 'http://skai.smart-tv-data.com/json/'+ (GLOBALS.dev ? 'l':'json') +'.php?cat=home-cont';
	
    // EVI Load Rik home json - Τελευταία Επεισόδια
    //var url = 'http://rik.smart-tv-data.com/json/new/home.json';

    var url = './getHomeJson.php';
    this.req = createHttpRequest(url, function (ret) {
		me.req = null;
		var JSONData = JSON.parse(ret);
     //   llog("Rik Home Data");
      //  llog(JSONData);
		me.createHome(JSONData);
        //me.createHome(JSONData.elems);
	});

    if(GLOBALS.ui == 2){

        GLOBALS.PREVIEW = true; 
        GLOBALS.videopreview = new VideoPreview("videopreview");
        GLOBALS.videopreview.init(document.getElementById('appscreen'),0,0);
    }

	if (GLOBALS.action == 'sports') {
		setTimeout(function () {
			moves('Sports live stream');
			me.loadJson("sports", 0);
		}, 1000);
	}

	this.createAd();
}

Skai.prototype.createAd = function () {
    if(!DAI) return;
    if ((getVersion() == "1.1.1" || getVersion() == "1.2.1") && navigator.userAgent.toUpperCase().indexOf('FIRETV') == -1)
        GLOBALS.brtyp = true;
    else
        GLOBALS.brtyp = false;
    if(GLOBALS.brtyp) return;
    this.ad = document.createElement("video");
    this.ad.id = "ad";
    //this.ad.src = "https://mediaserve.ert.gr/bpk-vod/vodext/default/20220317kairos/20220317kairos/index.mpd";
    //this.ad.src = "https://dash.akamaized.net/dashif/ad-insertion-testcase1/batch5/counter/a/ad-insertion-testcase1.mpd";
    this.ad.src = "http://93.190.254.166/vod/emma-testsieger-10s-2022-preview.mp4/manifest.mpd";
    this.ad.type = 'application/dash+xml';
    if(location.host == "127.0.0.1" || location.host == "localhost") this.ad.src = "https://static.videezy.com/system/resources/previews/000/052/918/original/21.mp4";
    this.ad.preload = "auto";
   // this.ad.autoplay = "true";
    document.getElementById("broadcast_ad").appendChild(this.ad);
    var me = this;
    //devmode2(this.ad.duration);
    this.ad.addEventListener('ended', function(e){
        devmode2("ad ended");
        me.stopAd();
    }, false);

    this.ad.addEventListener("timeupdate", function(e){
        //if(GLOBALS.adPlaying && me.ad.paused) devmode2("Current Time: "+me.ad.currentTime+" - Duration: "+me.ad.duration);
        //if(me.ad.currentTime >= me.ad.duration){
        if(me.ad.duration - me.ad.currentTime <= 0.5 || me.ad.currentTime / me.ad.duration > 0.97){
            devmode2("ad ended - alternate");
            me.stopAd();
        }/*else if(0 && GLOBALS.adPlaying){
            if(document.getElementById("broadcast_ad").style.display == "none"){
               me.showAd();
            }
        }*/
    },false);
    this.ad.addEventListener('canplay',function(e){
        devmode2("ad canplay");
    },false);
    this.ad.addEventListener('canplaythrough',function(e){
        devmode2("ad canplaythrough");
    },false);
    this.ad.load();
   // this.ad.pause();
    var me = this;
    this.bufferTimer = setInterval(function () {
        me.checkBuffer()}, 1000);
    document.getElementById("broadcast_ad").addClass("rf-div");
}

Skai.prototype.checkBuffer = function(){
    
    //if(parseInt(this.ad.buffered.end(0) >= 28) this.ad.pause();
    devmode2("[Buffer] Start: " + this.ad.buffered.start(this.ad.buffered.length-1) + " End: " + this.ad.buffered.end(this.ad.buffered.length-1));
}
/*Skai.prototype.showAd = function () {
    if (document.getElementById('mybroadcast')) {
        var dvb = document.getElementById('mybroadcast');
        try {
            dvb.stop();
        } catch (e) {}
        try {
            dvb.release();
        } catch (e) {}
    
        document.getElementById("tvbild").style.display = "block";
        document.getElementById("broadcast_ad").style.display = "block";
        
    }

}*/
Skai.prototype.playAd = function () {
    if(GLOBALS.brtyp || !DAI) return;
    if(GLOBALS.adPlaying){
        this.stopAd();
        return;
    }
    GLOBALS.adPlaying = true;
    this.ad.style.display = "block";
    document.getElementById("broadcast_ad").style.visibility = "visible";

        /*
        var dvb = document.getElementById('mybroadcast');
    try {
        dvb.stop();
    } catch (e) {
        devmode2("failed to stop broadcast");
    }
    */

    try{
        this.ad.play();
    } catch (e) {}
    //document.getElementById("tvbild").style.display = "none";
}

Skai.prototype.stopAd = function () {
    if(!GLOBALS.adPlaying) return;
    if (this.bufferTimer) clearInterval(this.bufferTimer);
    if(GLOBALS.brtyp || !DAI) return;
        var me = this;
    GLOBALS.adPlaying = false;
        devmode2("stopAd");

    document.getElementById("broadcast_ad").style.visibility = "hidden";
    //this.ad.style.display = "none";

    //document.getElementById("tvbild").style.display = "block";
    //GLOBALS.scenemgr.setRF();
        var dvb = document.getElementById("mybroadcast");
        try {
                dvb.bindToCurrentChannel();
        } catch (e) {
                devmode2("failed to bindToCurrentChannel");
        }

    try{
        this.ad.pause();
        this.ad.src = '';
        this.ad.load();
            this.ad.remove();
    }catch(e){
            devmode2("failed to stop ad");
    }

        setTimeout(function() {
                me.createAd();
        }, 2000);
}



Skai.prototype.createHome = function (data) {
	var e = new Cont("home-cont", true, data), nextSc = getScheduleNext();
	//e.firsttime=1;
	e.keycheck=1;
	GLOBALS.scenemgr.addScene(e);
	GLOBALS.scenemgr.showCurrentScene("");
	if (data.show_bg_image_hbbtv)
		e.bg.style.backgroundImage = "url(" + data.shows[0].show_bg_image_hbbtv + ")";
	else if (0 && nextSc && nextSc.bg_icon) { // XXX not now?
		e.bg.style.backgroundImage = "url(" + nextSc.bg_icon + ")";
	}
	activeCont = GLOBALS.focusmgr.getObject("home-cont");
	GLOBALS.scenemgr.setRF();

	if (GLOBALS.action == 'breaking') {
		var item = {}, source = 'http://cdn5.smart-tv-data.com/skai/livenews/mpeg.2ts';
		item.show_title = 'Live News';
		item.title = 'Live News';
		item.category = 'Live News';
		GLOBALS.item = item;
		item.url = source;
		item.thumb = null;

		GLOBALS.action ='';
		setTimeout(function () {
			GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, item.category, 0, item.thumb, null);
		}, 1000);
	}
}
Skai.prototype.createLive = function (data) {
    llog("[Skai.prototype.createLive] data:");
    llog(data);
    var e = new Cont("live", false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    activeCont = GLOBALS.focusmgr.getObject("live");
}

Skai.prototype.createShowsList = function (data, listname) {
    var e = new Cont(listname, false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    activeCont = GLOBALS.focusmgr.getObject(listname);
}

Skai.prototype.createNews = function (data) {
    var e = new Cont("news", false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    activeCont = GLOBALS.focusmgr.getObject("news");
}
Skai.prototype.createEpisodes = function (data, subCat) {
    if (subCat == "lexeis") var e = new Cont("lexeis", true, data, subCat);
    else var e = new Cont("episodes", true, data, subCat);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    if (subCat == "lexeis") {
        activeCont = GLOBALS.focusmgr.getObject("lexeis");
        var m = GLOBALS.scenemgr.top;
        m.style.visibility = "hidden";
        document.getElementById("tvbild").style.display = "none";
        if (document.getElementById('mybroadcast')) {
            var dvb = document.getElementById('mybroadcast');
            try {
                dvb.stop();
            } catch (e) {}
            try {
                dvb.release();
            } catch (e) {}
        }

    } else activeCont = GLOBALS.focusmgr.getObject("episodes");
}
Skai.prototype.createShows = function (data) {
    var e = new Cont("shows", false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    //e.elem.style.backgroundImage = "url(" + data.show.bg + ")";
    activeCont = GLOBALS.focusmgr.getObject("shows");
}
Skai.prototype.createDoc = function (data) {
    var e = new Cont("doc", false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    activeCont = GLOBALS.focusmgr.getObject("doc");
}
Skai.prototype.createSeries = function (data) {
    var e = new Cont("series", false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    activeCont = GLOBALS.focusmgr.getObject("series");
}
Skai.prototype.createSports = function (data) {
    var e = new Cont("sports", false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    //e.elem.style.backgroundImage = "url("+ this.live.bg_icon +")";
    activeCont = GLOBALS.focusmgr.getObject("sports");
}
Skai.prototype.createRadio = function () {
    var e = new Cont("radio", false, radioStreams);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    //e.elem.style.backgroundImage = "url("+ this.live.bg_icon +")";
    activeCont = GLOBALS.focusmgr.getObject("radio");
}
Skai.prototype.createSummerCinema = function (data) {
    var e = new Cont("summer", false, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    e.elem.style.backgroundImage = "url(" + data.show.bg + ")";
    activeCont = GLOBALS.focusmgr.getObject("summer");
}
Skai.prototype.createEPG = function () {
    var e = new Cont("epg", false);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    e.elem.style.backgroundImage = "url(img/bg/epg.jpg)";
    activeCont = GLOBALS.focusmgr.getObject("epg");
}
Skai.prototype.createBigBrother = function (data) {
    var e = new Cont("bigbrother", true, data);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    e.elem.style.backgroundImage = "url(img/bg/bigbrother.jpg)";
    activeCont = GLOBALS.focusmgr.getObject("bigbrother");
    var m = GLOBALS.scenemgr.top;
    m.style.visibility = "hidden";
    document.getElementById("tvbild").style.display = "none";
    if (document.getElementById('mybroadcast')) {
        var dvb = document.getElementById('mybroadcast');
        try {
            dvb.stop();
        } catch (e) {}
        try {
            dvb.release();
        } catch (e) {}
    }
}
Skai.prototype.createStream = function () {
    var e = new Cont("promo", true);
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    activeCont = GLOBALS.focusmgr.getObject("promo");

    var m = GLOBALS.scenemgr.top;
    m.style.visibility = "hidden";
    document.getElementById("tvbild").style.display = "none";
    if (document.getElementById('mybroadcast')) {
        var dvb = document.getElementById('mybroadcast');
        try {
            dvb.stop();
        } catch (e) {}
        try {
            dvb.release();
        } catch (e) {}
    }
	var track = new Image;
	track.src = 'http://ad.doubleclick.net/ddm/trackimp/N1003055.152583SKAI.GR/B25849745.305339454;dc_trk_aid=498294691;dc_trk_cid=151736949;ord='+ Math.floor(Math.random()*1000000) +';dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ltd=?';
	//track.src = 'http://tps.doubleverify.com/visit.jpg?ctx=18796203&cmp=25849745&sid=6594941&plc=304601995&adsrv=1&btreg=&btadsrv=&crt=&tagtype=video&dvtagver=6.1.img&';
	var source = "img/mercedes60sec.mp4";
	GLOBALS.scenemgr.openVideoPlayer(ON_VOD, source);
	if (!GLOBALS.focusmgr.getObject("videoplayer")) {
		GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
		GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
	}
	GLOBALS.videoplayer.setSource(source);
	GLOBALS.videoplayer.setTitle("Mercedes");
	GLOBALS.videoplayer.start();
}
Skai.prototype.createSearch = function () {
    var e = new Search("search");
    GLOBALS.scenemgr.addScene(e);
    GLOBALS.scenemgr.showCurrentScene("");
    //e.elem.style.backgroundImage = "url(img/bg/epg.jpg)";
    activeCont = GLOBALS.focusmgr.getObject("search");
    GLOBALS.focusmgr.focusObject("keyboard_gr", true);
}
Skai.prototype.createUser = function () {
	if (0 && GLOBALS.userId) {
		var o = GLOBALS.scenemgr.sidemenu.skaiMObj, el = o.loginitem;
		o.focusedId=1;
		deleteCookie('user_id');
		el.innerHTML = 'Είσοδος';
		GLOBALS.userId=0;
	} else {
		GLOBALS.scenemgr.sidemenu.hide();
		if (GLOBALS.userId) {
			var e = new User("logged");
			GLOBALS.scenemgr.addScene(e);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = GLOBALS.focusmgr.getObject("logged");
		} else {
			var e = new User("signup");
			GLOBALS.scenemgr.addScene(e);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = GLOBALS.focusmgr.getObject("signup");
			if (GLOBALS.focusmgr.getObject("keyboard_en_sm"))
				GLOBALS.focusmgr.focusObject("keyboard_en_sm", true);
		}
	}
}


//http://rik.smart-tv-data.com/json/new/news.json
//http://rik.smart-tv-data.com/json/new/ent.json
//http://rik.smart-tv-data.com/json/new/sports.json

Skai.prototype.loadJson = function (idnam, id, epSubcat, activeListId) {
    var me = this;
    //var url = 'http://rik.smart-tv-data.com/json/new/' + idnam + '.json';
var isEpisodes = false;
if(idnam == 'episodes') {
    if(epSubcat == 'shows') epSubcat = 'ent';
    
    var url ="getHomeJson.php?cat="+epSubcat;
    isEpisodes = true;
} 
else var url = "getHomeJson.php?cat="+idnam;
    

    this.req = createHttpRequest(url, function (ret) {
        me.req = null;
        var JSONData = JSON.parse(ret);
        if(isEpisodes){
            var allshows = JSONData;
            var currentshow= allshows[activeListId];
            me.createEpisodes(currentshow, epSubcat);
            return true;
        }
        switch (idnam) {
            case "home-cont":
                me.createHome(JSONData.elems);
                break;
            case "live":
                var elems = JSONData.elems;
                me.createLive(elems);
                break;
            case "series":
                me.createShowsList(JSONData, "series");
                break;
            case "deltia":
                me.createShowsList(JSONData, "deltia");
                break;
            case "culture":
               me.createShowsList(JSONData, "culture");
                break;
            case "child":
               me.createShowsList(JSONData, "child");
                break;
            case "news":
               me.createShowsList(JSONData, "news");
                break;
            case "ntokimanter":
                me.createDoc(JSONData.elems);
                break;
            case "ent":
                me.createShows(JSONData);
                break;
            case "series":
                me.createSeries(JSONData.elems);
                break;
            case "sports":
                me.createSports(JSONData);
    			break;
            case "episodes":
                me.createEpisodes(JSONData.elems, epSubcat);
                break;
            default:
                break;
        }
    });
}

var sidebar = [{
        "name": "SKAI",
        "icon_on": "./img/rik-logo.png",
        "icon_off": "./img/rik-logo.png"
    },

    //{"name": "24news", "icon_on": "", "icon_off": ""},
    /*  {
        "name": "BigBrother",
        "icon_on": "img/bigbrother.png",
        "icon_off": "img/bigbrother.png"
    },
*/
];
var selectedshows = {
    'home-cont': {
        'showindex': 3,
        'selected': 2
    },
    'news': {
        'showindex': 0,
        'selected': 0
    },
    'shows': {
        'showindex': 3,
        'selected': 1
    },
    'series': {
        'showindex': 1,
        'selected': 0
    }
};

function SubMenu(idnam, submenu) {
    this.idnam = idnam;
    this.focusedId = 0;
    this.activeId = 0;
    this.submenu = submenu;
    this.seperator = 7;
}
SubMenu.prototype = new BaseObject();
SubMenu.prototype.init = function (parent, xpos, ypos) {
 
	var e = createClassDiv("", "", "submenu");
	this.parent = parent;
	this.items = [];
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
    if(NEW_RADIO) this.seperator = 9;
	this.outer = createClassDiv(0, 45, "outer");
	this.elem.appendChild(this.outer);

	for (var i = 0; i < this.submenu.length; i++) {
		var m = this.submenu[i];
		if (!m['active'])
			continue;
		var inner = createClassDiv("", "", "inner");
		var menuelemicon = createClassDiv("", "", "menuelemicon"), sub = this.submenu[i];

		if (0 && i == this.seperator) {
			inner.addClass('seperator');
		}

		if (sub.classname == "bigbrother" || sub.classname == "lexeis")
			menuelemicon.addClass("big");

		if (i > this.seperator) {
			var icon = document.createElement("img"), sub = this.submenu[i];
			icon.src = sub.image_on;
			if (sub.name == 'radio2' || sub.name == 'radio1')
				icon.style.width = '100px';
			if (sub.name == 'radio1')
				icon.style.height = '100px';
			inner.addClass('img');
			inner.appendChild(icon);
			inner.style.display = 'none';
		} else {
			var icon = createClassDiv("", "", "icon");
			icon.addClass(sub.classname);
			menuelemicon.appendChild(icon);
			inner.appendChild(menuelemicon);

			if (sub.classname == 'signup' && GLOBALS.userId)
				sub.name = 'Big Brother';

			var text = createClassDiv("", "", "text");
			if(sub.name == "Cinema")
				text.style.fontSize = "16px";
			text.innerHTML = sub.name;
			inner.appendChild(text);
			if (sub.classname == 'signup')
				this.loginitem = text;

			if (sub.classname == "bigbrother" || sub.classname == "lexeis") {
				inner.addClass("minusleft");
			}
		}

		this.outer.appendChild(inner);
		this.buttons.push(inner);
		this.items.push(m);
	}
    if (getCookie("SkaiMsgrId")) {
        var msgrMenu = {
            "name": "msgr",
            "active": true,
            "image_on": "img/skaimessengerlogo_sm.png",
            "image_off": "",
            "classname": "msgr"
        };

        var inner = createClassDiv("", "", "inner");
        var menuelemicon = createClassDiv("", "", "menuelemicon")
        var icon = createClassDiv("","","icon");
        icon.addClass("msgr");
        icon.id = "msgr";
        menuelemicon.appendChild(icon);
        inner.appendChild(menuelemicon);
        var text = createClassDiv("", "", "text");
        text.innerHTML = 'Απεγγραφή';
        inner.appendChild(text);
        this.outer.appendChild(inner);
        this.buttons.push(inner);
        this.items.push(msgrMenu);

    }
}
SubMenu.prototype.setActive = function () {
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.activeId) {
                this.buttons[i].addClass("active");
            } else {
                if (this.buttons[i].hasClass("active")) this.buttons[i].removeClass("active");
            }
        } else {
            if (this.buttons[i].hasClass("active")) this.buttons[i].removeClass("active");
        }
    }

}
SubMenu.prototype.setFocused = function (otherobj, focus) {
    var o = GLOBALS.focusmgr.getObject("side-bar");
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) {
                this.buttons[i].addClass("focused");
                if(GLOBALS.PREVIEW){
                 var me = this;
                
                if(GLOBALS.previewTimer) clearTimeout(GLOBALS.previewTimer);
                GLOBALS.previewTimer = null;
                GLOBALS.previewTimer = setTimeout(function(){
                    var idnam = me.items[me.focusedId].classname;
                    //EVI
                    if(idnam == "seires") idnam = 'series';
                    if(idnam == "doc") idnam = "ntokimanter";
                    if(idnam){
                        // var url = 'http://skai.smart-tv-data.com/json/'+ (GLOBALS.dev ? 'l':'json') +'.php?cat=' + idnam;
                         var url = 'http://rik.smart-tv-data.com/json/new/' + idnam + '.json';
                        var isEpisodes = false;
                        if(idnam == 'shows') idnam = 'ent';
                        if(idnam == 'episodes') {
                            if(epSubcat == 'shows') epSubcat = 'ent';
                            
                            var url ="getHomeJson.php?cat="+epSubcat;
                            isEpisodes = true;
                        } 
                        else var url = "getHomeJson.php?cat="+idnam;

                            console.log(url);
                            this.req = createHttpRequest(url, function (ret) {
                                me.req = null;
                                var JSONData = JSON.parse(ret);
                                if(JSONData) {
                                   // var elems = JSONData.elems;
                                   // var elems = JSON.parse(JSONData);
                                    var elems = JSONData;
                                    

                                    if(elems){
                                    
                                        /*if( elems.lists && elems.lists[0] && ((typeof elems.lists[0].shows !=='undefined') || (typeof elems.lists[0].episodes !== 'undefined'))){
                                           
                                            if(elems.lists[0].shows && elems.lists[0].shows[0]) var item = elems.lists[0].shows[0];
                                            else {
                                                if(elems.lists[0].episodes && elems.lists[0].episodes.length > 0) var item = elems.lists[0].episodes[0];
                                                else if(elems.lists[1] && elems.lists[1].shows && elems.lists[1].shows.length > 0) var item = elems.lists[1].shows[0];
                                            }
                                            */
                                        llog('elems on submenu focused');
                                        var item = elems[0];
                                        llog(item);

                                            if(!item) {
                                                console.log('no item found in json data for this subitem');
                                                return;
                                            }
                                            console.log("cur item ", item);
                                            if(item.episode)
                                                GLOBALS.videopreview.setSource(item.episode);
                                            else if(item.mp4)
                                                GLOBALS.videopreview.setSource(item.mp4);
                                            else if(item.video)
                                                GLOBALS.videopreview.setSource(item.video);
                                            else if(item.media_item_link)
                                                GLOBALS.videopreview.setSource(item.media_item_link);
                                            else if (item.episodes)
                                            {
                                                var episodes = [];
                                                for (var date in item.episodes) {
                                                  if (item.episodes.hasOwnProperty(date)) {
                                                    episodes.push({
                                                      mp4: item.episodes[date], 
                                                    });
                                                  }
                                                }
                                                var firstEp = episodes[0].mp4;
                                                GLOBALS.videopreview.setSource(firstEp);
                                            }
                                            var imgToShow = item.img;
                                        }
                                        GLOBALS.previewTimer = null;
                                         GLOBALS.videopreview.bg.src = "http://rik.smart-tv-data.com/"+imgToShow;
                                    /*}*/
                                }else GLOBALS.videopreview.pause();
                            });
                        
                    
                    }
                }, 500);
                }//END OF PREVIEW

            }
            else this.buttons[i].removeClass("focused");
            o.open();

        } else {
            this.buttons[i].removeClass("focused");
            o.close();

        }
    }

    this.setActive();
}
SubMenu.prototype.handleKeyPress = function (keycode) {
    if (keycode === VK_RED) {
        this.onRed();
    }
    if (keycode === VK_GREEN) {
        this.onGreen();
        return true;
    }
    if (keycode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keycode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    switch (keycode) {
	    case VK_1:
		    window.location.href = "http://smarttv.anixa.tv/skai/?menu=sidebar";
            //"http://smarttv.anixa.tv/skai/index.php?menu=sidebar";
            break;
	    case VK_2:
		    //window.location.href = "http://skai.smart-tv-data.com/skai-dev/index.php?menu=sidebar&sd=skai&sskaisd";
            //window.location.href = "http://smarttv.anixa.tv/centertv/";
            if(GLOBALS.dev) window.location.href = "http://smarttv.anixa.tv/fingerprint_test/";
            break;
	    case VK_3:
		    if(GLOBALS.dev) window.location.href = "http://smarttv.anixa.tv/bluesky/DEV/home/?s=skaisd";
            break;
        case VK_4:
            if(GLOBALS.dev) window.location.href = 'https://smarttv.anixa.tv/ReferenceApplication/src/catalogue/'; //window.location.href = "http://smarttv.anixa.tv/cretetv/";
            break;
        case VK_5:

            if(GLOBALS.dev) window.location.href = "http://smarttv.anixa.tv/skai/index.php?ui=2"; //window.location.href = "http://smarttv.anixa.tv/enatv/";
            break;
         case VK_6:
            if(GLOBALS.dev) window.location.href = "http://smarttv.anixa.tv/creat/";
            break;
	    case VK_7:
		    if (GLOBALS.dev) {
			    var item = {}, source = 'https://skaimotion.siliconweb.com/skaivod/drm/smil:itwfcdn/skaitv/2181190-Z7j8G540161Ks17.smil/manifest.mpd';
			    var lu = 'https://playready.ezdrm.com/cency/preauth.aspx?pX=2B3DA1';
			    item.show_title = 'DRM demo';
			    item.title = 'DRM demo';
			    item.category = 'DRM demo';
			    GLOBALS.item = item;
			    item.url = source;
			    item.thumb = null;

			    GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, 'test', 0, item.thumb, lu);
		    }
		    break;
	    case VK_8:
		    if (GLOBALS.dev) {
			    var item = {}, source = 'https://cdn4.smart-tv-data.com/vid_ert/ert/71014887627ade9b77f7c897a02228df.mp4/manifest.mpd';
			    var laUrl = 'https://playready.ezdrm.com/cency/preauth.aspx?pX=ADE846'
			    item.show_title = 'DRM demo';
			    item.title = 'DRM demo';
			    item.category = 'DRM demo';
			    GLOBALS.item = item;
			    item.url = source;
			    item.thumb = null;

			    GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, 'test', 0, item.thumb, laUrl);
		    }
		    break;
        case VK_9:
		    if(GLOBALS.dev) window.location.href = "http://smarttv.anixa.tv/skai/home/?s=skaihd";
            break;
        case VK_UP:
            this.focusedId--;
		    if (this.focusedId == this.seperator)
			    this.focusedId--;
            if (this.focusedId < 0) this.focusedId = 0;
            this.setFocused(this.idnam, true);
            break;
        case VK_DOWN:
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) {
                this.focusedId = this.buttons.length - 1;
            }
            this.setFocused(this.idnam, true);
            break;
        case VK_ENTER:
            var o = GLOBALS.focusmgr.getObject("side-bar");
            o.close();
            this.activeId = this.focusedId;
		    if (activeCont.idnam == 'radio1' || activeCont.idnam == 'radio2') {
			    var vid = document.getElementById('video');
			    if (vid) {
				    try {
					    vid.stop();
					    this.isPlaying = false;
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
			    }
			    document.getElementById("tvbild").style.display = "block";
			    GLOBALS.scenemgr.setRF();
		    }
            this.handleRequest();
            break;
        case VK_RIGHT:
            var o = GLOBALS.focusmgr.getObject("side-bar");
            o.close();
            GLOBALS.scenemgr.obtainFocus();
            break;
        case VK_0:
            goRed("http://smarttv.anixa.tv/skai/?menu=sidebar&hbbplayer=active&s="+GLOBALS.channelId);
            break;
        default:
            break;
    }
}

SubMenu.prototype.getContName = function (){

}

SubMenu.prototype.handleRequest = function () {
	if (!activeCont || typeof activeCont == 'undefined' || typeof activeCont.idnam == 'undefined')
		return;

	var o = GLOBALS.focusmgr.getObject("skai");
	document.getElementsByClassName("sidebar")[0].style.visibility = "visible";
	var name = this.items[this.focusedId].classname;
	switch (name) {
		case 'home':
			moves("Αρχική");
			if (activeCont.idnam.indexOf('home-cont') != -1){
               
				break;
            }
			while(GLOBALS.scenemgr.sceneStack.length > 2){
                
				GLOBALS.scenemgr.goBack();
            }
            
			var o = GLOBALS.focusmgr.getObject(activeCont.idnam);
			o.buttons[o.focusedId].elem.style.display = 'none';
			if(o.buttons[o.focusedId+1])
				o.buttons[o.focusedId+1].elem.style.display = 'none';
			var l = GLOBALS.focusmgr.getObject("home-list-0");
			o.focusedId = l.focusedId = 0;
			o.outertop = 0;
			o.buttons[0].elem.style.display = 'block';
			if(o.buttons[1]) o.buttons[1].elem.style.display = 'block';

			GLOBALS.focusmgr.focusObject("home-list-0", true);
			break;
		case 'live':
			moves("Live");
			if (activeCont.idnam == "live")
				break;
			o.loadJson("live", 0);
			
            break;
		case 'news':
			moves("Ενημέρωση");
			if (activeCont.idnam == "news")
				break;
			o.loadJson("news", 0);
			break;
        case 'series':
            moves("Σειρές");
            if (activeCont.idnam == "series")
                break;
            o.loadJson("series", 0);
            break;
        case 'deltia':
            moves("Δελτία Ειδήσεων");
            if (activeCont.idnam == "deltia")
                break;
            o.loadJson("deltia", 0);
            break;
        case 'culture':
            moves("Πολιτισμός");
            if (activeCont.idnam == "culture")
                break;
            o.loadJson("culture", 0);
            break;
        case 'child':
            moves("Παιδικά");
            if (activeCont.idnam == "child")
                break;
            o.loadJson("child", 0);
            break;
		case 'doc':
			moves("Ντοκιμαντέρ");
			if (activeCont.idnam == "ntokimanter")
				break;
			o.loadJson("ntokimanter", 0);
			break;
		case 'sports':
			moves("Αθλητικά");
			if (activeCont.idnam == "sports")
				break;
			o.loadJson("sports", 0);
			break;
		case 'shows':
			moves("Ψυχαγωγία");
			if (activeCont.idnam == "shows")
				break;
			o.loadJson("ent", 0);
			break;
		case 'seires':
			moves("Σειρές");
			if (activeCont.idnam == "series")
				break;
			o.loadJson("series", 0);
			break;
        case 'cinema':
         //moves("Cinema");
            if (activeCont.idnam == "cinema")
                break;
            o.loadJson("cinema", 0);
            break;
		case 'radioNew':
			if(NEW_RADIO){
				moves("Live Radio");
				if (activeCont.idnam == "radio_new")
					break;
				o.createRadio();
				break;
			}
			moves("Live radio Skai");
			if (activeCont.idnam == "radio1")
				break;
			var radio = new Radio("radio1");
			GLOBALS.scenemgr.addScene(radio);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = radio;
			break;
			/*case 6:
	    moves("Πρόγραμμα");
	    if (activeCont.idnam == "epg")
		break;
	    o.createEPG();
	    break;*/
		case 'signup':
			//moves("Είσοδος");//XXX
			if (activeCont.idnam == "signup")
				break;
			o.createUser();
			break;
		case 'srch':
			moves("Αναζήτηση");
			if (activeCont.idnam == "search")
				break;
			o.createSearch();
			break;

		case 'radio2':
			moves("Live radio SporFM");
			if (activeCont.idnam == "radio2")
				break;
			var radio = new Radio("radio2");
			GLOBALS.scenemgr.addScene(radio);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = radio;
			break;
        case 'msgr':
            deleteCookie("SkaiMsgrId");
            GLOBALS.currentUserId = GLOBALS.currentUser = null;
            goRed(window.location.href);
            return;
			/*case 6:
	    moves("Big Brother");
	    if (activeCont.idnam == "bigbrother")
		break;
	    document.getElementsByClassName("sidebar")[0].style.visibility = "hidden";
	    var bbId = 67280;
	    o.loadJson("bigbrother", bbId);
	    llog(GLOBALS.scenemgr.sceneStack);
	    break;
	    */
		default:
			break;
	}
}

function SideBar(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
    this.activeId = 0;
}
SideBar.prototype = new BaseObject();
SideBar.prototype.init = function (parent, xpos, ypos) {
    var e = createClassDiv("", "", "sidebar");

    this.parent = parent;
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];
    this.elem.addClass("closed");
    this.outer = createClassDiv(0, 36, "outer");
    this.elem.appendChild(this.outer);

    for (var i = 0; i < sidebar.length; i++) {
        var inner = createClassDiv("", "", "inner");
        var icon = document.createElement("img");
        icon.src = sidebar[i].icon_off;
        inner.appendChild(icon);
        this.outer.appendChild(inner);
        this.buttons[i] = inner;
    }

    //skai submenu object
console.log(menu);
    this.skaiMObj = new SubMenu("submenu-0", (rikmenu));
    this.skaiMObj.init(this.buttons[0], "", "");
}
SideBar.prototype.open = function () {
    
	this.elem.style.width = "295px";
	//GLOBALS.scenemgr.sceneStack[GLOBALS.scenemgr.sceneStack.length - 1].obj.elem.style.left = "190px";
    //GLOBALS.scenemgr.sceneStack[GLOBALS.scenemgr.sceneStack.length - 1].obj.elem.style.opacity = "0.4";
	for (var i = 0; i < this.buttons.length; i++) {
		if (i == this.focusedId){
			this.buttons[i].addClass("focused");

        }
		else
			this.buttons[i].removeClass("focused");
	}
	this.elem.addClass("open");
	this.elem.removeClass("closed");
	if (document.getElementsByClassName("basic-menu-container")[0])
		document.getElementsByClassName("basic-menu-container")[0].addClass("open");
	var els = document.getElementsByClassName("inner");
	if(!NEW_RADIO){
		els[8].style.display = 'block';
		els[9].style.display = 'block';
	}
}
SideBar.prototype.close = function () {
    
	this.elem.style.width = "174px";
	//GLOBALS.scenemgr.sceneStack[GLOBALS.scenemgr.sceneStack.length - 1].obj.elem.style.left = "0px";
    //GLOBALS.scenemgr.sceneStack[GLOBALS.scenemgr.sceneStack.length - 1].obj.elem.style.opacity = "1";
	for (var i = 0; i < this.buttons.length; i++) {
		this.buttons[i].removeClass("focused");
	}
	this.elem.removeClass("open");
	this.elem.addClass("closed");
	if (document.getElementsByClassName("basic-menu-container")[0])
		document.getElementsByClassName("basic-menu-container")[0].removeClass("open");
	var els = document.getElementsByClassName("inner");
	if(!NEW_RADIO){
		els[8].style.display = 'none';
		els[9].style.display = 'none';
	}
}
SideBar.prototype.hide = function () {
	this.elem.style.display = "none";
}
SideBar.prototype.show = function () {
	this.elem.style.display = "block";
}

/*
 * --- Menu Object ---
 * Display menu, add every menu item in buttons array. Also key handler, focus etc.
 * Functions:
 *  - init: init and create menu items
 *  - setFocused: focus menu item
 *  - openSearch: open search page
 *  - handleKeyPress: handle key press
 */
function Menu(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
    this.activeId = 0;
}
Menu.prototype = new BaseObject();
Menu.prototype.init = function (parent, xpos, ypos) {

    var e = createClassDiv("", "", "skai-menu");
    this.parent = parent;
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];

    for (i = 0; i < skaimenu.length; i++) {

        var item = createClassDiv("", "", "menu-item");
        if (skaimenu[i].name == "Αρχική") {
            var image = document.createElement("img");
            image.src = "img/logo.png";
            image.style.width = "75px";
            item.appendChild(image);
        } else if (skaimenu[i].name == "Αναζήτηση") {
            var image = document.createElement("img");
            image.src = "img/search.png";
            image.style.width = "23px";
            item.appendChild(image);
        } else
            item.innerHTML = skaimenu[i].name;
        this.buttons.push(item);
        e.appendChild(item);
    }

    var item8 = createClassDiv("", "", "menu-icon");
    item8.id = 7;
    item8.style.paddingLeft = "5px";
    item8.style.paddingRight = "5px";
    var im = document.createElement('img');
    im.src = "img/bigbrother.png";
    item8.appendChild(im);
    this.buttons.push(item8);
    e.appendChild(item8);

    this.setActive();
}
Menu.prototype.setFocused = function (otherobj, focus) {

    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) {
                this.buttons[i].addClass("focused");
            } else {
                if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
            }
        } else {
            if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
        }
    }

}
Menu.prototype.setActive = function () {

    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.activeId) {
                this.buttons[i].addClass("active");
            } else {
                if (this.buttons[i].hasClass("active")) this.buttons[i].removeClass("active");
            }
        } else {
            if (this.buttons[i].hasClass("active")) this.buttons[i].removeClass("active");
        }
    }

}
Menu.prototype.handleKeyPress = function (keyCode) {
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
    switch (keyCode) {
	    case VK_1:
		    window.location.href = "http://smarttv.anixa.tv/skai/index.php?menu=sidebar";
		    break;

        case VK_RIGHT:
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) {
                this.focusedId = this.buttons.length - 1;
                break;
            }
            this.setFocused(this.buttons[this.focusedId], true);
            break;
        case VK_LEFT:
            this.focusedId--;
            if (this.focusedId < 0) {
                this.focusedId = 0;
                break;
            }
            this.setFocused(this.buttons[this.focusedId], true);
            break;
        case VK_DOWN:
            if (activeCont.idnam == "search") {
                var o = GLOBALS.focusmgr.getObject("search-keyboard", true);
                GLOBALS.focusmgr.focusObject(o.ktab_idnam, true);
                break;
            }
            if (activeCont.idnam == "epg")
                GLOBALS.focusmgr.focusObject("epg-dayselect");
            else if (activeCont.idnam == "episodes")
                GLOBALS.focusmgr.focusObject("episodes-" + activeCont.subCat);
            else {
                //lalert(activeCont.idnam);
                GLOBALS.focusmgr.focusObject(activeCont.idnam);
            }
            break;
        case VK_ENTER:
            this.activeId = this.focusedId;
            this.setActive();
            var o = GLOBALS.focusmgr.getObject("skai");
            switch (this.focusedId) {
                case 0:
                    if (activeCont.idnam == "home-cont")
                        break;
                    o.loadJson("home-cont", 0);
                    break;
                case 1:
                    if (activeCont.idnam == "news")
                        break;
                    o.loadJson("news", 0);
                    break;
                case 3:
                    if (activeCont.idnam == "series")
                        break;
                    o.loadJson("series", 0);
                    break;
                case 4:
                    if (activeCont.idnam == "epg")
                        break;
                    o.createEPG();
                    break;
                case 5:
                    if (activeCont.idnam == "search")
                        break;
                    o.createSearch();
                    break;
                case 6:
                    if (activeCont.idnam == "bigbrother")
                        break;
                    o.createBigBrother();
                    break;
            }
            break;
        case VK_BACK:
            if (GLOBALS.scenemgr.sceneStack.length == 2)
                break;
            if (currScene == "bigbrother") {
                var m = GLOBALS.scenemgr.top;
                m.style.visibility = "visible";
                document.getElementById("tvbild").style.display = "block";
                GLOBALS.scenemgr.setRF();
            }
            GLOBALS.scenemgr.goBack();
            break;
        default:
            break;
    }
}

/*
 * --- Cont Object ---
 * Container for show page with title, description, last video, videos list.
 * Functions:
 *  - init: init container and horizontal list
 *  - setFocused: set focus inside page
 *  - initEpisodes: init episodes list
 *  - initEPG: init EPG
 *  - handleKeyPress: handle keys
 *  - scrollToFocused: scroll to focused object
 *  - setBgImg: load background iomage
 */
function Cont(idnam, listType, data, subCat) {
    this.idnam = idnam;
    this.listType = listType;
    this.focusedId = 0;
    this.data = data;
    this.subCat = subCat;
    this.outertop = 0;
}

Cont.prototype = new BaseObject();
Cont.prototype.init = function (parent, xpos, ypos, title) {

llog("[Cont.prototype.init] data:");
     llog(this.data);
	var cont = createClassDiv("", "", "list-container");
	cont.id = this.idnam;
	parent.appendChild(cont);
	this.baseInit(cont);
	this.register();
	this.buttons = [];
	this.bg = createClassDiv("","","background");
    if(GLOBALS.PREVIEW) this.bg.style.display = "none";
	this.elem.appendChild(this.bg);
	currScene = this.idnam;
	if (this.idnam == "epg")
		this.initEPG(this.elem, "", "");
	else if (this.idnam == "episodes")
		this.initEpisodes(this.elem, "", "");
	else if (this.idnam == "summer")
		this.initCinema(this.elem, "", "");
    else if (this.idnam == "cinema")
        this.initEpisodes(this.elem, "", "");
	else if (this.idnam == "lexeis")
		this.initLexeis(this.elem, "", "");
	else if (this.idnam == "bigbrother")
		this.initBigBrother(this.elem, "", "");
	else if (this.idnam == "stream")
		this.initStream(this.elem, "", "");
	//else if (this.idnam == "sports")
		//this.initSports(this.elem, "", "");
	else if (this.idnam == "radio") {
		this.initRadio(this.elem, "", "");
	} else if (keyLists.indexOf(currScene) != -1) {
		var info = createClassDiv("", "", "start-info");
		var titl = createClassDiv("", "", "start-info-title");
		var dat = createClassDiv("", "", "start-info-data"), ind = 0;
		var logo = document.createElement("img");
		logo.id = 'bg-logo';

		info.appendChild(logo);
		this.outer = createClassDiv("", "", "outer");
		this.outer.style.height = "100%";
		this.outer.style.width = "100%";
		this.elem.appendChild(this.outer);
		info.appendChild(titl);
		info.appendChild(dat);
		this.elem.appendChild(info);

		if (currScene == 'live') {
            llog("LIVE data");
            
            llog(this.data);
			var list = this.data.lists[0], eps = [], sc = getSchedule(), nextSc = getScheduleNext(), all = getScheduleAll();
			var live = GLOBALS.scenemgr.live, schedule = live.schedule;
			//var sports = GLOBALS.focusmgr.getObject("sports");
			this.nextSc = nextSc;

			//sports.elem.style.backgroundImage = "url("+ (nextSc && nextSc.bg_icon ? nextSc.bg_icon : live.bg_icon) +")";
			//this.bg.style.visibility = "hidden";
			if (sc.length) {
				for (var j = 0;j < sc.length;j++) {
					var title = sc[j].title, ep = {};
					ep.id = (j+1);
					ep.title = title;
					ep.live = 1;
					ep.category = 'Αθλητικά';
					ep.episode = title;
					ep.descr = sc[j].descr;
					ep.media_item_title = title;
					ep.show_title = ep.title;
					ep.img = sc[j].menu_icon;
					ep.bg = (nextSc && nextSc.bg_icon ? nextSc.bg_icon : sc[j].bg_icon);
					ep.show_bg_image_hbbtv = sc[j].bg_icon;
					ep.ads = sc[j].ads;

					ep.media_item_link = sc[j]['stream-url'];
					//ep.media_item_link = 'http://skaitvhybrid1.skai.gr/GrCyTargeting/Gr/Bahar/BAHAR_S01E032_NEWa.mp4';
					ep.url = ep.media_item_link;
					this.data.lists[0].shows.push(ep);
				}
				this.live = 1;
			}
			for (var j = 0;j < all.length;j++) {
				var title = all[j].title, ep = {};
				ep.id = (j+1);
				ep.title = title;
				ep.descr = all[j].descr;
				ep.scheduled = 1;
				ep.category = 'Αθλητικά';
				ep.episode = title;
				ep.media_item_title = title;
				ep.show_title = ep.title;
				ep.img = all[j].menu_icon;
				ep.bg = (nextSc && nextSc.bg_icon ? nextSc.bg_icon : all[j].bg_icon);
				ep.show_bg_image_hbbtv = all[j].bg_icon;
				ep.ads = all[j].ads;

				this.data.lists[0].shows.push(ep);
			}
		}

		
        // EVI - this must be changed because home json of RIK does not have lists

        
        var idlist = 'home-list-';
         if (currScene != 'home-cont')
                idlist = currScene+'-list-';

       
            if(currScene == 'home-cont'){ 
                    //var episodes = JSON.parse(this.data);
                   var episodes = this.data;
                   // console.log("Episodes");
                   console.log(episodes);

                    var l = new HorizontalList(idlist+ind, 0, episodes);
                    //logo is not needed , we have only episodes not shows.
                  //  l.data = JSON.parse(this.data);
                    l.data = this.data;
                    l.parentObj = this;
                    l.initEpisodes(this.outer, "", "");
                    this.buttons.push(l);
                    

            }else{
               

               llog('Create horizontal list ');
                        //EVI load menu category
                       //thisdata = JSON.parse(this.data);
                       thisdata = this.data;

                        var l = new HorizontalList(idlist + ind, 1, thisdata);
                        l.data = thisdata;
                        l.parentObj = this;
                        l.itemheight = 266;
                        this.bg.addClass('bg-vertical-width');
                        llog("create horizontal list of shows :" + (idlist +ind) );
                        l.initShows(this.outer, "", "");
                        this.buttons.push();
                        GLOBALS.focusmgr.focusObject(idlist+"0", true);
                }

        /*for (var i = 0; i < thisdata.length; i++) {
			var list = thisdata[i];
			//var onlyShows = parseInt(list.only_shows);
		//	var radio = parseInt(list.radio);
        	var idlist = 'home-list-', sc=[], episodes= currScene=='live'?list.shows:JSON.parse(list.episodes);
			if (currScene != 'home-cont')
				idlist = currScene+'-list-';

//alert(episodes.length);
			if (!episodes.length)
				continue;


			var l = new HorizontalList(idlist+ ind, !onlyShows, (onlyShows ? list.shows : episodes));
			ind++;
			if (currScene == 'live' && i == 1)
				l.radio=1;
			//l.logo = logo;
			l.infoTitle = titl;
			l.infoData = dat;
			l.data = list;
			l.parentObj = this;
			if (onlyShows) {
				l.itemheight = 266;
				l.initShows(this.outer, "", "");
			} else {
				l.itemheight = 190;
				l.initEpisodes(this.outer, "", "");
			}
			this.buttons.push(l);
		}*/   
		
	} else {

		var info = createClassDiv("", "", "start-info");
		var titl = createClassDiv("", "", "start-info-title");
		//titl.innerHTML = "<strong>" + this.data.show.title + "</strong>";
		titl.innerHTML = "<strong>" + this.data.title + "</strong>";
        var dat = createClassDiv("", "", "start-info-data");
		info.appendChild(titl);
		info.appendChild(dat);

		this.elem.appendChild(info);

		var botover = createClassDiv("", "", "bottom-overlay");
		this.elem.appendChild(botover);

		if (this.listType) {
			var list;
			if (this.idnam == "home-cont")
				list = new HorizontalList("home-list", true, this.data.episodes);
			else
				list = new HorizontalList(this.idnam + "-list", true, this.data.episodes);
			list.data = this.data;
			list.cat = this.data.cat;
			list.initEpisodes(this.elem, "", "");
		} else {
			var list = new HorizontalList(this.idnam + "-list", false, this.data.shows);
			list.cat = this.data.cat;
			list.parentObj = this;
			list.initShows(this.elem, "", "");
			list.data = this.data;
		}

		GLOBALS.focusmgr.focusObject(this.idnam + "-list", true);
	}
}
Cont.prototype.initBigBrother = function (parent, xpos, ypos, title) {
    var cont = createClassDiv("", "", "bb-container");
    parent.appendChild(cont);
    this.baseInit(cont);
    this.register();
    this.buttons = [];


    var logo = createClassDiv("", "", "bb-logo");
    var im = document.createElement('img');
    im.src = "img/bblogo.png"
    logo.appendChild(im);
    this.elem.appendChild(logo);
    var episodes = (this.data) ? this.data.episodes : "";
    var list = new HorizontalList("episodes-list", true, episodes);
    list.initEpisodes(this.elem, "", "", "ΕΠΕΙΣΟΔΙΑ");
}
Cont.prototype.initStream = function (parent, xpos, ypos) {
    var cont = createClassDiv("", "", "stream-container");
    parent.appendChild(cont);
    this.baseInit(cont);
    this.register();
    this.buttons = [];

    var stream = createClassDiv("", "", "stream-area");
    this.elem.appendChild(stream);
    this.fscreen = document.createElement('img');
    this.fscreen.src = "img/fullscreen.png";
    this.fscreen.style.zIndex = 1;
    stream.appendChild(this.fscreen);
    this.buttons.push(stream);

    this.openStream();
}
Cont.prototype.openStream = function () {
	GLOBALS.scenemgr.openVideoPlayer(ON_VOD, source);
    if (!GLOBALS.focusmgr.getObject("videoplayer")) {

        GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
        GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
    }
    // var ts = "http://195.226.218.10/skai/dehstream/mpeg.2ts";
    //var ts = "http://skai.smart-tv-data.com/stream.php/v/skai_dehstream_mpeg.2ts";

	var source = "img/mercedes60sec.mp4";
    GLOBALS.videoplayer.setSource(source);
    GLOBALS.videoplayer.title.innerHTML = "Mercedes";
    GLOBALS.videoplayer.start();
}
Cont.prototype.openBigBrother = function () {
    GLOBALS.scenemgr.openVideoPlayer("bigbrother");
    if (!GLOBALS.focusmgr.getObject("videoplayer")) {

        // lalert("[openBigBrother] BR1");
        GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
        GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
    }
    // lalert("[openBigBrother] BR2");
    GLOBALS.videoplayer.oncase = "bigbrother";

    var ts = 'http://cdn1.smart-tv-data.com:8080/stream.php/v/skai_bigbrothersource_mpeg.2ts';
    // var ts = 'http://' + GLOBALS.streamserver + '/skai/bigbrothersource/mpeg.2ts';
    var dash = "http://cdn1.smart-tv-data.com:8080/stream.php/v/skai_bb_manifest.mpd";
    var version = getVersion();

    if (version == "1.4.1" || version == "1.5.1" || version == "#1.2.1") {
        var ag = navigator.userAgent.toUpperCase();
        if (ag.indexOf("VESTEL") > 0 || ag.indexOf("LG") > 0 || ag.indexOf("SAMSUNG") > 0) {
            var source = ts;
            GLOBALS.videoplayer.setSource(source);
            GLOBALS.videoplayer.title.innerHTML = "Big Brother Stream TS";
            GLOBALS.videoplayer.start("video/mpeg");
        } else {
            var source = dash;
            GLOBALS.videoplayer.setSource(source);
            GLOBALS.videoplayer.title.innerHTML = "Big Brother Stream DASH";
            GLOBALS.videoplayer.start("mpeg-dash");
        }
    } else {
        var source = ts;
        GLOBALS.videoplayer.setSource(source);
        GLOBALS.videoplayer.title.innerHTML = "Big Brother Stream TS";
        GLOBALS.videoplayer.start("video/mpeg");
    }
}
Cont.prototype.initLexeis = function (parent, xpos, ypos, title) {
    var cont = createClassDiv("", "", "list-container");
    var titles = ['ΤΗΛΕΤΑΙΝΙΕΣ', 'BEHIND THE SCENES', 'ΕΠΕΙΣΟΔΙΑ'];
    parent.appendChild(cont);
    this.baseInit(cont);
    this.register();
    this.buttons = [];

    var sb = GLOBALS.focusmgr.getObject("side-bar");
    sb.elem.style.visibility = "hidden";
    var image = document.createElement("img");
    image.src = "img/hybrid-icons/skai-logo.svg";
    image.style.width = "100px";
    image.style.top = "35px";
    image.style.left = "60px";
    image.style.position = "absolute";
    this.elem.appendChild(image);

    this.elem.style.backgroundImage = "url(img/8lexeis.jpg)";
    this.elem.style.backgroundRepeat = "no-repeat";
    this.elem.style.backgroundSize = "100% 100%";

    var keys = Object.keys(this.data);
    moves('8 Λέξεις promo');
    keys.shift();

    for (var i = 0; i < keys.length; i++) {
        var list = new HorizontalList("lexeis-" + i, true, this.data[keys[i]]);
        var focusStr = GLOBALS.focusmgr.focusToStr("lexeis-" + i);
        var prefix = GLOBALS.focusmgr.focusToStr(this.subCat);;
        list.initLexeisEpisodes(this.elem, "", "", keys[i]);
        this.buttons.push(list);
    }
    GLOBALS.focusmgr.focusObject("lexeis-0");
}
Cont.prototype.initEpisodes = function (parent, xpos, ypos, title) {

	var cont = createClassDiv("", "", "list-container");
	parent.appendChild(cont);
	this.baseInit(cont);
	this.register();
	this.buttons = [];

	var info = createClassDiv("", "", "start-info");
	info.addClass("epinfo");
	var logo = document.createElement("img");
	logo.id = 'bg-logo';

	info.appendChild(logo);
	var titl = createClassDiv("", "", "start-info-title");
	var dat = createClassDiv("", "", "start-info-data");


    if(this.data.show)
        titl.innerHTML = "<strong>" + this.data.show.title + "</strong>";
    else titl.innerHTML = "<strong>" + this.data.title + "</strong>";
    
	//EVI remove this --- this.bg.style.backgroundImage = "url(" + this.data.show.show_bg_image_hbbtv + ")";
	//EVI in rik json there is no show_bg_image_hbbtb
    this.bg.style.backgroundImage = "url(http://rik.smart-tv-data.com/" +this.data.img+")";

    this.elem.style.backgroundRepeat = "no-repeat";
	this.elem.style.backgroundSize = "100% 100%";

	info.appendChild(titl);
	info.appendChild(dat);
	parent.appendChild(info);

	var botover = createClassDiv("", "", "bottom-overlay");
	this.elem.appendChild(botover);

    llog('Cont initEpisodes ');
    llog(this.data);
    llog(this.data.episodes);

    
    var episodes = [];
    for (var date in this.data.episodes) {
      if (this.data.episodes.hasOwnProperty(date)) {
        episodes.push({
          date: date,
          mp4: this.data.episodes[date], 
          img: this.data.epimg, 
          title: this.data.title,
          channel: (this.data.channel ? this.data.channel : ""),
          info: this.data.info, 
          subtitle: this.data.subtitle
        });
      }
    }
    llog(episodes);

	var list = new HorizontalList("episodes-" + this.subCat, true, episodes);
	list.parentObj = this;
	list.data = this.data;
	list.logo = logo;
	list.infoTitle = titl;
	list.infoData = dat;

	//GLOBALS.cat = this.data.show.cat;
    //GLOBALS.show = this.data.show.title;
    GLOBALS.cat = this.data.sname;
	GLOBALS.show = this.data.title;
    moves(GLOBALS.cat + "/" + GLOBALS.show);
	list.initSideEpisodes(this.elem, "", "");

	if (this.league && this.data.clips) {
		this.buttons[1] = list;
		//clips
		var list = new HorizontalList(this.idnam + "-list-top", true, this.data.clips);
		list.parentObj = this;
		list.top =1;
		list.initSideEpisodes(this.elem, "", "");
		list.data = this.data;
		this.buttons[0] = list;
		GLOBALS.focusmgr.focusObject(this.idnam + '-list-top');
		activeCont = list;
	} else {
		GLOBALS.focusmgr.focusObject("episodes-" + this.subCat);
	}
    this.parent = parent;
    GLOBALS.focusmgr.focusObject(this.idnam, true);
}
Cont.prototype.initCinema = function (parent, xpos, ypos, title) {
    var info = createClassDiv("", "", "start-info");
    var titl = createClassDiv("", "", "start-info-title");
    var dat = createClassDiv("", "", "start-info-data");
    titl.innerHTML = this.data.show.title;
    var s = this.data.show.short_descr.replace('<br>', '');

    dat.innerHTML = s;
    if (dat.innerHTML.length > 180) {
        dat.innerHTML = dat.innerHTML.substring(0, 180) + " ...";
    }

    info.appendChild(dat);

    this.elem.appendChild(info);

    var botover = createClassDiv("", "", "bottom-overlay");
    this.elem.appendChild(botover);

    var list = new HorizontalList("summer-list", true, this.data.episodes);
    list.parentObj = this;
    list.initEpisodes(this.elem, "", "");
    GLOBALS.focusmgr.focusObject("summer-list", true);
}
Cont.prototype.initSports = function (parent, xpos, ypos, title) {
	var info = createClassDiv("", "", "start-info");
	var titl = createClassDiv("", "", "start-info-title");
	var dat = createClassDiv("", "", "start-info-data");
	var live = GLOBALS.scenemgr.live, schedule = live.schedule;
	var sports = GLOBALS.focusmgr.getObject("sports");
	var eps = [], ep = {}, sc = getSchedule(), nextSc = getScheduleNext();
	this.nextSc = nextSc;

	sports.elem.style.backgroundImage = "url("+ (nextSc && nextSc.bg_icon ? nextSc.bg_icon : live.bg_icon) +")";
	this.bg.style.visibility = "hidden";
	if (sc.length) {
		for (var i = 0;i < sc.length;i++) {
			var title = sc[i].stream;
			if (sc[i]['stream-url'].indexOf('diki') > 0)
				title='Η Δίκη στον ΣΚΑΪ'; // we have to add in stream url something like ?diki=1
			
            ep.id = (i+1);
			ep.title = title;
			ep.live = 1;
			ep.category = 'Αθλητικά';
			ep.episode = title;
			ep.media_item_title = title;
			ep.img = sc[i].menu_icon;
			ep.bg = sc[i].bg_icon;
			ep.ads = sc[i].ads;

			ep.media_item_link = sc[i]['stream-url'];
			eps.push(ep);
		}
		this.live = 1;
	} else if (action == 'sports') {
		ep.id = 1;
		ep.title = 'ΣΚΑΪ Sports Live';
		ep.media_item_title = 'Γαλλικό Πρωτάθλημα Ποδοσφαίρου LIVE';
		ep.img = live.menu_icon;

		if (sc)
			ep.img = sc.menu_icon;

		ep.media_item_link = 'http://cdn5.smart-tv-data.com/skai/skaisport/mpeg.2ts';
		//ep.media_item_link = 'http://skaitvhybrid1.skai.gr/GrCyTargeting/Gr/Bahar/BAHAR_S01E032_NEWa.mp4';
		eps.push(ep);
		this.live = 1;
	}
	for (var i = 0; i < this.data.shows.length;i++) {
		var ep = {}, sh = this.data.shows[i];
		ep.id = sh.id;
		ep.title = sh.title;
		ep.media_item_title = sh.title;
		ep.img = sh.menu_icon;
		ep.bg = sh.bg;
		eps.push(ep);
	}

	this.data.episodes = eps;

	this.elem.appendChild(info);
	var botover = createClassDiv("", "", "bottom-overlay");
	this.elem.appendChild(botover);

	var list = new HorizontalList("sports-list", true, this.data.episodes);
	list.parentObj = this;
	list.listType = false;
	list.initEpisodes(this.elem, "", "");
	if (GLOBALS.action == 'sports') {
		GLOBALS.action ='';
		var me = this;
		if (sc.length == 1) {
			setTimeout(function () {
				var ep = me.data.episodes[0];
				ep.category = 'Αθλητικά';
				ep.episode = ep.title;
				GLOBALS.show = ep.title;
				ep.show_title = ep.title;
				GLOBALS.item = ep;
				var path = 'videoplayer/'+ ep.category +'/'+ ep.media_item_title.replace(/\//g, '-');
					moves(path);
					if (typeof ep.media_item_link == 'undefined')
					ep.media_item_link = 'http://cdn5.smart-tv-data.com/skai/skaisport/mpeg.2ts';
					GLOBALS.scenemgr.openVideoPlayer(ON_VOD, source);
					if (!GLOBALS.focusmgr.getObject("videoplayer")) {
						GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
						GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
					}
				if (ENABLE_PREROLL) {
					GLOBALS.videoplayer.todo = ep;
					GLOBALS.videoplayer.ad = true;
					if (typeof prerollVideo !== "undefined") {
						prerollVideo(ep.title);
					}
				} else {
					GLOBALS.videoplayer.setSource(ep);
					GLOBALS.videoplayer.setTitle("Live Sports");
					GLOBALS.videoplayer.start();
					GLOBALS.focusmgr.focusObject("videoplayer", true);
				}
				var ts = (new Date()).getTime()/1000;
				GLOBALS.ad = getNextAd(ep.ads);
				GLOBALS.show = eps[0].title;
				if (GLOBALS.ad && GLOBALS.ad.start) {
					var secs = GLOBALS.ad.start - ts;
					GLOBALS.adLoop = false;
					GLOBALS.adsCnt = 0;
					GLOBALS.adTimer = setTimeout(function() {
						GLOBALS.adLoop = true;
						middlerollVideo(GLOBALS.show);
					}, secs * 1000);
				}
			}, 1000);
		} else if (sc.length > 1) {
			var sel = new SelectSports("selector", me.data.episodes.slice(0, sc.length));
			sel.init(document.body);
		}
	} else if (GLOBALS.action == '4k') {
		var item = {}, source = 'https://stream3.anixe.net/uhd/Best_of_Match_football_4K.mp4';
		item.show_title = '4k demo';
		item.title = '4k demo';
		item.category = '4k demo';
		GLOBALS.item = item;
		item.url = source;
		item.thumb = 'http://cdn2.smart-tv-data.com/thum/skai/Best_of_Match_football_4K.jpg';

		GLOBALS.action ='';
		setTimeout(function () {
			GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, 'test', 0, item.thumb, null);
		}, 1000);
	} else
		GLOBALS.focusmgr.focusObject("sports-list", true);
}
Cont.prototype.initRadio = function (parent, xpos, ypos, title) {
    var radioBG = GLOBALS.focusmgr.getObject("radio");
    var eps = [], ep = {};

    for (var i = 0; i < this.data.shows.length;i++) {
        var ep = {}, sh = this.data.shows[i];
        ep.id = sh.id;
        ep.title = sh.title;
        ep.media_item_title = sh.title;
        ep.img = sh.menu_icon;
        ep.bg = sh.bg;
        eps.push(ep);
    }

    this.data.episodes = eps;


    var botover = createClassDiv("", "", "bottom-overlay");
    this.elem.appendChild(botover);

    var list = new HorizontalList("radio-list", true, this.data.episodes);
    list.parentObj = this;
    list.listType = false;
    list.initEpisodes(this.elem, "", "");
    GLOBALS.focusmgr.focusObject("radio-list", true);
}
Cont.prototype.initEPG = function (parent, xpos, ypos) {
    var epgcontainer = createClassDiv("", "", "epg-container");
    this.parent = parent;
    parent.appendChild(epgcontainer);
    this.baseInit(epgcontainer);
    this.register();
    this.buttons = [];

    var me = this;
   // var url = 'http://skai.smart-tv-data.com/json/json.php?cat=epg';
    this.req = createHttpRequest(url, function (ret) {
        me.req = null;
        var JSONData = JSON.parse(ret);

        var epgday = new DaySelect("epg-dayselect");
        epgday.init(me.elem, "", "", JSONData.elems);
        me.buttons.push(epgday);
    });
}
Cont.prototype.setFocused = function (otherobj, focus) {
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) {
                this.buttons[i].addClass("focused");
                if (this.idnam == "news" || this.idnam == "shows" || this.idnam == "series") this.im.src = "img/play_foc.png";
                if (this.idnam == "bigbrother") this.fscreen.src = "img/fullscreen_active.png";
            } else {
                if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
                if (this.idnam == "news" || this.idnam == "shows" || this.idnam == "series") this.im.src = "img/play.png";
                if (this.idnam == "bigbrother") this.fscreen.src = "img/fullscreen.png";
            }
        } else {
            if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
            if (this.idnam == "news" || this.idnam == "shows" || this.idnam == "series") this.im.src = "img/play.png";
            if (this.idnam == "bigbrother") this.fscreen.src = "img/fullscreen.png";
        }
    }

}
Cont.prototype.handleKeyPress = function (keyCode) {
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
	switch (keyCode) {
		case VK_LEFT:
			if (GLOBALS.menu == "sidebar") {
				if (this.focusedId == 0) {
					var o = GLOBALS.focusmgr.getObject("side-bar");
					GLOBALS.focusmgr.focusObject("submenu-" + o.focusedId, true);
					break;
				}

			}
			if (this.idnam == "home-cont" && this.buttons.length > 1) {
				this.focusedId--;
				if (this.focusedId < 0) this.focusedId = 0;
				this.setFocused(this.idnam, true);
				break;
			}
			break;
		case VK_RIGHT:
			if (this.idnam == "home-cont" && this.buttons.length > 1) {
				this.focusedId++;
				if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
				this.setFocused(this.idnam, true);
			}
			break;
		case VK_UP:
			if (this.idnam == "bigbrother") break;
			if (GLOBALS.menu != "sidebar") GLOBALS.focusmgr.focusObject("menu", true);
			break;
		case VK_DOWN:
			if (this.idnam == "bigbrother") {
				GLOBALS.focusmgr.focusObject("episodes-list", true);
			} else GLOBALS.focusmgr.focusObject(this.idnam + "-list", true);
			break;
		case VK_ENTER:
			if (this.idnam == "bigbrother") break;

			if (this.focusedId != 0) {
				document.getElementsByClassName("sidebar")[0].style.visibility = "hidden";
				var cont = GLOBALS.focusmgr.getObject("skai");
				var bbId = 67280;
				cont.loadJson("bigbrother", bbId);
				break;
			}

			if (this.idnam == "bigbrother")
				if (GLOBALS.videoplayer)
					GLOBALS.videoplayer.fullScreen();

			GLOBALS.scenemgr.openVideoPlayer(ON_VOD);
			if (!GLOBALS.focusmgr.getObject("videoplayer")) {
				GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
				GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
			}
			var list = GLOBALS.focusmgr.getObject(this.idnam + "-list");
			if (this.data.show.title == 'SURVIVOR')
				this.data.show.title = 'SURVIVOR ALL STAR';
			var path = 'videoplayer/'+ this.data.show.title +'/'+ this.data.show.media_item_title.replace(/\//g, '-');
			moves(path);
			GLOBALS.show = this.data.show.title;
				GLOBALS.item = this.data.show;
			if (ENABLE_PREROLL) {
				GLOBALS.videoplayer.todo = lastVid ? lastVid : this.data.show;
				GLOBALS.videoplayer.ad = true;
				if (typeof prerollVideo !== "undefined") {
					prerollVideo(this.data.show.title);
				}
			} else {
				GLOBALS.videoplayer.setSource(lastVid ? lastVid : this.data.show);
				GLOBALS.videoplayer.title.innerHTML = this.data.show.title;
				GLOBALS.videoplayer.start();
			}
			break;
		case VK_BACK:
			if (GLOBALS.scenemgr.sceneStack.length == 2)
				break;
			if (currScene == "bigbrother" || currScene == "stream") {
				var m = GLOBALS.scenemgr.top;
				m.style.visibility = "visible";
				document.getElementsByClassName("sidebar")[0].style.visibility = "visible";
				document.getElementById("tvbild").style.display = "block";
				document.getElementById("player-bg-container").removeClass("bbstream");
				GLOBALS.scenemgr.setRF();
			}
			GLOBALS.scenemgr.goBack();
			break;
		default:
			break;
	}
}

/*
 * --- HorizontalList Object ---
 * List show episodes, scroller etc.
 * Functions:
 *   - initShows: init shows
 *   - initEpisodes: init episodes
 *   - initSideEpisodes: init side episodes
 *   - setFocused: set focus
 *   - loadPoster: load show image
 *   - animScrollerLeft: scroll left animation
 *   - animScrollerRight :scroll right animation
 *   - loadImageRight: load show image
 *   - loadImageLeft:  load show image
 *   - handleKeyPress: handle keys
 */
function HorizontalList(idnam, listType, items) {
    this.idnam = idnam;
    this.listType = listType;
    this.focusedId = 0;
    this.itemmargin = 250;
    this.strecke = 0;
    this.position = 110;
    this.animtimer = false;
    this.pixeltomove = 50;
    this.listHeight = 250;
    this.height = 250;
    this.items = items;
    this.cat = "";
	this.waitForKey=0;
}
HorizontalList.prototype = new BaseObject();
HorizontalList.prototype.initShows = function (parent, xpos, ypos) {
    

    this.itemmargin = (165 + 6);
    this.initPosition = 175;
    this.position = 175;
    if (GLOBALS.menu == "sidebar") this.position = 200 /*137*/ ;
    this.pixeltomove = 20;

    var e = createClassDiv("", "", "movies-category");
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];
    this.parent = parent;

    var cat = createClassDiv("", "", "category");


	if (this.idnam.indexOf('-list-') != -1){
		
        cat.innerHTML = this.data.title;
         if(currScene == "home-cont") cat.innerHTML = "ΤΕΛΕΥΤΑΙΑ ΕΠΕΙΣΟΔΙΑ";
         else {
            var o = GLOBALS.focusmgr.getObject('submenu-0');
             var menuitem = rikmenu[o.focusedId];
            cat.innerHTML = menuitem.name;
        }
    }
	else
		cat.innerHTML = this.cat;
    this.elem.appendChild(cat);

    var w = this.itemmargin;

    this.outer = createClassDiv("", "", "event-list");
    this.elem.appendChild(this.outer);


    
    if(cat.innerHTML == "LIVE"){
        this.items = this.items.lists[0].shows;
    }

    for (var i = 0; i < this.items.length; i++) {
        var inner = createClassDiv("", "", "show");
        w += this.itemmargin;

        var im = document.createElement('img');
	   // im.src = this.items[i].show_mini_img_hbbtv;
        im.src = "http://rik.smart-tv-data.com/" +this.items[i].img;
        im.style.width = "100%";

        inner.appendChild(im);

        var title = createClassDiv("", "", "title");
        title.style.display = "none";
        title.innerHTML = this.items[i].title;
        inner.appendChild(title);
        this.outer.appendChild(inner);
        this.buttons.push(inner);
    }
    this.outer.style.width = w + "px";
    console.log("current scene" + GLOBALS.scenemgr.getCurrentScene().sceneId);
    console.log("focus on list of shows "+ this.idnam);
    GLOBALS.focusmgr.focusObject(this.idnam, true);
}
HorizontalList.prototype.setShowImg = function (x) {
    var url = "";

    switch (this.items[x].id) {
        case 67196: //Ειδήσεις Ι Βραδινό Δελτίο
            dat.push(arr[i]);
            break;
        case 67195: //Ειδήσεις Ι Μεσημβρινό Δελτίο
            dat.push(arr[i]);
            break;
        case 67193: //Αταίριαστοι
            dat.push(arr[i]);
            break;
        case 67221: //Αποτύπωμα
            dat.push(arr[i]);
            break;
        case 67194: //Καλημέρα
            dat.push(arr[i]);
            break;
        case 67207: //Ακραία Φαινόμενα
            dat.push(arr[i]);
            break;
        case 67234: //ECO News
            dat.push(arr[i]);
            break;
        case 67192: //Σήμερα
            dat.push(arr[i]);
            break;
        case 67200: //Αδύναμος Κρίκος
            dat.push(arr[i]);
            break;
        case 67212: //My style Rocks
            dat.push(arr[i]);
            break;
        case 67216: //Καλό Μεσημεράκι
            dat.push(arr[i]);
            break;
        case 67243: //Σήμερα
            dat.push(arr[i]);
            break;
        case 67192: //Σήμερα
            dat.push(arr[i]);
            break;
        case 67192: //Σήμερα
            dat.push(arr[i]);
            break;
        default:
            break;
    }

    return dat;
}
HorizontalList.prototype.createNewsShow = function () {
    var arr = JSONData.elems[0].shows;
    var dat = [];

    for (var i = 0; i < arr.length; i++) {
        switch (arr[i].show) {
            case "Ειδήσεις Ι Βραδινό Δελτίο":
                dat.push(arr[i]);
                break;
            case "Ειδήσεις Ι Μεσημβρινό Δελτίο":
                dat.push(arr[i]);
                break;
            case "Αταίριαστοι":
                dat.push(arr[i]);
                break;
            case "Αποτύπωμα":
                dat.push(arr[i]);
                break;
            case "Καλημέρα":
                dat.push(arr[i]);
                break;
            case "Ακραία Φαινόμενα":
                dat.push(arr[i]);
                break;
            case "ECO News":
                dat.push(arr[i]);
                break;
            case "Αντίστροφη Μέτρηση":
                dat.push(arr[i]);
                break;
                // case "Σήμερα":
                //     dat.push(arr[i]);
                //     break;
            default:
                break;
        }
    }

    return dat;
}
HorizontalList.prototype.createShowsShow = function () {
    var arr = JSONData.elems[3].shows;
    var dat = [];

    for (var i = 0; i < arr.length; i++) {
        switch (arr[i].show) {
            case "Μεσημέρι με τον Γιώργο Λιάγκα":
                dat.push(arr[i]);
                break;
            case "Καλό Μεσημεράκι":
                dat.push(arr[i]);
                break;
            case "My Style Rocks":
                dat.push(arr[i]);
                break;
            case "Ο Πιο Αδύναμος Κρίκος":
                dat.push(arr[i]);
                break;
            case "After Dark":
                dat.push(arr[i]);
                break;
            case "Guess My Age":
                dat.push(arr[i]);
                break;
            case "Boom":
                dat.push(arr[i]);
                break;
            case "Eurogames":
                dat.push(arr[i]);
                break;
            default:
                break;
        }
    }

    return dat;
}
HorizontalList.prototype.createSeriesShow = function () {
    var arr = JSONData.elems[1].shows;
    var dat = [];

    for (var i = 0; i < arr.length; i++) {
        switch (arr[i].show) {
            case "Θα Γίνει Της Πολυκατοικίας":
                dat.push(arr[i]);
                break;
            case "8 Λέξεις":
                dat.push(arr[i]);
                break;
            default:
                break;
        }
    }
    return dat;
}
HorizontalList.prototype.initEpisodes = function (parent, xpos, ypos) {

	this.itemmargin = (267+6);
	this.initPosition = 175;
	this.position = 175;
	this.pixeltomove = 70;


	if (GLOBALS.menu == "sidebar") this.position = 175 /*137*/ ;

	if (currScene == "bigbrother") {
		this.itemmargin = 220;
		this.position = 110;
		this.pixeltomove = 110;

		var e = createClassDiv("", "", "bb-movies-category");
	} else var e = createClassDiv("", "", "movies-category");

	if (currScene == "radio") {
		this.itemmargin = 210;
		this.position = 175;
		this.pixeltomove = 70;
	} else if (this.idnam == 'sports-select')
		e.style.top = '204px';
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;
	this.listHeight = this.itemheight;

	var cat = createClassDiv("", "", "category");


	if (this.idnam.indexOf('-list-') != -1) {

		cat.innerHTML = this.data.title;
         if(currScene == "home-cont") cat.innerHTML = "ΤΕΛΕΥΤΑΙΑ ΕΠΕΙΣΟΔΙΑ";
         else {
            var o = GLOBALS.focusmgr.getObject('submenu-0');
             var menuitem = rikmenu[o.focusedId];
             alert(menuitem.name);
            cat.innerHTML = menuitem.name;
        }
	} else if (this.idnam == 'sports-select') {
		cat.innerHTML = this.data.title;
		cat.style.fontSize = '22px';
		cat.style.left = '141px';
	} else {
		// EVI remove --- 
       
       /* if (currScene == "home-cont" && typeof this.data != 'undefined') cat.innerHTML = this.data.channel;
        if (currScene == "bigbrother") cat.innerHTML = "ΕΠΕΙΣΟΔΙΑ";*/
	}
	this.elem.appendChild(cat);

	var w = this.itemmargin;

	this.outer = createClassDiv("", "", "event-list");
	this.elem.appendChild(this.outer);
	this.elem.style.height = this.listHeight + "px";

	for (var i = 0; i < this.items.length; i++) {
		var inner = createClassDiv("", "", "episode");
		w += this.itemmargin;

		var im = document.createElement('img');
		im.src = "http://rik.smart-tv-data.com/" +  this.items[i].img;
		inner.appendChild(im);
		this.outer.appendChild(inner);
		this.buttons.push(inner);
	}
	if (this.items.length == 0) {
		this.elem.style.width = "640px";
		this.outer.innerHTML = "Δεν υπάρχουν διαθέσιμα επεισόδια.";
		this.outer.style.color = "white";
		GLOBALS.focusmgr.focusObject("videoplayer", true);
		return true;
	}

	this.elem.style.width = (w+w) + "px";
}
HorizontalList.prototype.initSideEpisodes = function (parent, xpos, ypos) {
	this.itemmargin = (267+6);
	this.initPosition = 0;
	this.position = 0;
	this.pixeltomove = 70;


	var e = createClassDiv("", "", "movies-category");
	e.style.left = "175px";
	if (this.top)
		e.style.top = '248px';
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;

	var cat = createClassDiv("", "", "category");
	cat.addClass("sidecat");
	cat.style.left = "0px!important";
	cat.innerHTML = "ΕΠΕΙΣΟΔΙΑ";
	if (this.top) {
		cat.innerHTML = 'HIGHLIGHTS';
	} 
	this.elem.appendChild(cat);

	var w = this.itemmargin;

	this.outer = createClassDiv(0, "", "event-list");
	this.outer.style.left = "0px";
	this.elem.appendChild(this.outer);

	for (var i = 0; i < this.items.length; i++) {
		var inner = createClassDiv("", "", "episode");
		w += this.itemmargin;

		var im = document.createElement('img');
		im.src = "http://rik.smart-tv-data.com/" + this.items[i].img;

		im.style.width = "100%";

		/*var res = this.items[i].start.split(" ");
		var date = new Date(res[0] * 1000);
		var year = date.getFullYear();
		var month = ("0" + (date.getMonth() + 1)).slice(-2);
		var day = ("0" + date.getDate()).slice(-2);*/
		this.items[i].title = this.items[i].date;

		inner.appendChild(im);
		this.outer.appendChild(inner);
		this.buttons.push(inner);
	}
	if (!this.items.length) {
		var inner = createClassDiv("", "", "episode");
		var title = createClassDiv("", "", "title");
		inner.style.backgroundColor = "rgb(184, 252, 245)";
		title.innerHTML = 'No episodes found';
		inner.appendChild(title);
		this.outer.appendChild(inner);
		this.buttons.push(inner);
		w = 1120;
	}

	this.elem.style.width = (w+w) + "px";
}
HorizontalList.prototype.initLexeisEpisodes = function (parent, xpos, ypos, title) {
    this.itemmargin = 280;
    this.position = 0;
    this.pixeltomove = 70;

    var e = createClassDiv("", "", "movies-category");
    e.style.left = "500px";
    e.style.top = "50px";
    e.style.position = "relative";
    e.addClass("lexeis")
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];
    this.parent = parent;

    var cat = createClassDiv("", "", "category");
    cat.addClass("sidecat");
    cat.style.left = "0px!important";
    switch (title) {
        case "episodes":
            cat.innerHTML = "ΕΠΕΙΣΟΔΙΑ";
            break;
        case "clips":
            cat.innerHTML = "ΤΗΛΕΤΑΙΝΙΕΣ";
            break;
        case "trailers":
            cat.innerHTML = "BEHIND THE SCENES";
            break;
        default:
            break;
    }
    this.elem.appendChild(cat);

    var w = this.itemmargin;

    this.outer = createClassDiv(0, "", "event-list");
    this.outer.style.left = "0px";
    this.elem.appendChild(this.outer);

    for (var i = 0; i < this.items.length; i++) {
        var inner = createClassDiv("", "", "episode");
        w += this.itemmargin;

        var im = document.createElement('img');
        im.src = this.items[i].img;
        im.style.width = "100%";

        var titl = createClassDiv("", "", "event-titl");
        switch (title) {
            case "episodes":
                titl.innerHTML = "ΕΠΕΙΣΟΔΙΟ " + this.items[i].episode_number;
                break;
            case "clips":
                var res = this.items[i].media_item_title.split(" | ");
                titl.innerHTML = res[res.length - 1];
                break;
            case "trailers":
                var res = this.items[i].media_item_title.split(" | ");
                titl.innerHTML = res[res.length - 1];
                break;
            default:
                break;
        }

        inner.appendChild(im);
        inner.appendChild(titl);
        this.outer.appendChild(inner);
        this.buttons.push(inner);
    }
    this.elem.style.width = w + "px";
}
HorizontalList.prototype.setFocused = function (otherobj, focus) {
    //console.log("HorizontalList set focused");
    //console.log(this.parent);

    //var ind = "scene"+GLOBALS.scenemgr.getCurrentScene().sceneId;
    //var thisparent = document.getElementById(ind);
    var thisparent = this.parent.parentElement;
    
	//var thisparent = document.getElementById("appscreen");
    if ( thisparent && thisparent.getElementsByClassName("start-info")) {
        if(thisparent.getElementsByClassName('start-info').length > 0){
    		if (0 && this.idnam.indexOf('home-list') != -1)
    			thisparent.getElementsByClassName("start-info")[0].style.display='none';
    		else
    			thisparent.getElementsByClassName("start-info")[0].style.display='block';
        }
	}

	if(focus && this.idnam != "summer-list" && this.idnam !='search-results-list' && this.items.length){
		var item = this.items[this.focusedId], bg = item.img, sc = getScheduleNext(), live = GLOBALS.focusmgr.getObject("live");
		lastVid = item;

bg = "http://rik.smart-tv-data.com/" + bg;
		if (typeof bg == 'undefined') 
            bg= this.data? ("http://rik.smart-tv-data.com/"+this.data[this.focusedId].img):null;
			

            //bg = this.data?this.data.show.show_bg_image_hbbtv:null;
		if (!bg && item.bg)
			bg = ("http://rik.smart-tv-data.com/"+item.bg);

		/*if(this.idnam.indexOf("live-list") != -1 && this.parentObj.focusedId == 1){
			this.parent.style.backgroundImage = 'url("'+ bg+'")';
			this.parentObj.bg.style.visibility = "hidden";
		} else {
			this.parent.style.backgroundImage = '';
			this.parentObj.bg.style.visibility = "visible";
		}*/
		this.parentObj.bg.style.visibility = "visible";
		if (typeof live != 'undefined')
			live.elem.style.backgroundImage = "";

console.log(this.parentObj);
		if (this.idnam.indexOf('home-list') != -1) { //home 
			this.parentObj.bg.style.backgroundImage = 'url("'+ bg+'")';
		} else if (this.idnam.indexOf('live-list') != -1 && (item.live || item.scheduled) && item.category == 'Αθλητικά') {
			this.parentObj.bg.style.visibility = "hidden";
			var nextSc = getScheduleNext(), liv = GLOBALS.scenemgr.live;
			live.elem.style.backgroundImage = "url("+ (nextSc && nextSc.bg_icon ? nextSc.bg_icon : liv.bg_icon) +")";
		} else {
			this.parentObj.bg.style.backgroundImage = 'url("'+ bg+'")';
		}

if(thisparent){
		if(thisparent.getElementsByClassName("start-info-title")) var titl = thisparent.getElementsByClassName("start-info-title")[0];
        
    }
		if(this.infoTitle) this.infoTitle.innerHTML = "<strong>" + (item.title) + "</strong>";
		else if(titl) titl.innerHTML = "<strong>" + (item.title) + "</strong>";

		if ( this.idnam != 'sports-select') {
			if(this.logo){
                if (typeof item.show_logo_hbbtv != 'undefined') {
    				this.logo.style.display ='block';
    				this.logo.src = item.show_logo_hbbtv;
    			} else this.logo.style.display ='none';
            }
		}

		var dat = thisparent.getElementsByClassName("start-info-data")[0];


		if(dat && this.idnam.indexOf('home-list') == -1) {
            
            var s = item.channel? item.channel.toUpperCase()+" - " : "";
			s+=item.subtitle;
             s += "<br/>" + item.info;
			s = s.replace('<br>', '').replace('<b>', '').replace('</b>','');
			//s = "<b>"+item.title + "</b><br/>" + s;
			s = s.length > 180?s.substring(0,180)+" ...":s;
			dat.innerHTML = s;
		}
		//var s = (typeof item.info != 'undefined' ? item.info:item.subtitle);
		var s = item.channel? item.channel.toUpperCase()+" - " : "";
        s += item.subtitle;
        s += "<br/>" + item.info;
        if(typeof s != 'undefined'){

			s = s.replace('<br>', '').replace('<b>', '').replace('</b>','');
			if (s.length > 260) {
				s = smart_substr(s, 260) + " ...";
			}
			if(this.infoData){
                
				this.infoData.innerHTML = s;
			}else if(dat){
               
				dat.innerHTML = s;
			}else {
                console.log('error no datainfo area.');
            }
		}
	}
	for (var i = 0; i < this.buttons.length; i++) {
		if (focus) {
			if (i == this.focusedId) {
				this.buttons[i].addClass("focused");

if(GLOBALS.PREVIEW){
                if(GLOBALS.previewTimer) clearTimeout(GLOBALS.previewTimer);
                GLOBALS.previewTimer = null;
                var me = this;
                var item = this.items[i];
                llog("item for video preview");
                llog(item);
                GLOBALS.previewTimer = setTimeout(function(){
                    if(item.mp4)
                        GLOBALS.videopreview.setSource(item.mp4);
                    else if(item.video)
                        GLOBALS.videopreview.setSource(item.video);
                    else if(item.episode)
                        GLOBALS.videopreview.setSource(item.episode);
                    else if(item.media_item_link)
                        GLOBALS.videopreview.setSource(item.media_item_link);
                    else if (item.episodes)
                    {
                        var episodes = [];
                        for (var date in item.episodes) {
                          if (item.episodes.hasOwnProperty(date)) {
                            episodes.push({
                              mp4: item.episodes[date], 
                            });
                          }
                        }
                        var firstEp = episodes[0].mp4;
                        GLOBALS.videopreview.setSource(firstEp);
                    }
                    
                    GLOBALS.previewTimer = null;
                }, 500);
                var imgToShow = this.items[i].img;
                if(GLOBALS.videopreview.bg) GLOBALS.videopreview.bg.src = "http://rik.smart-tv-data.com/"+ imgToShow;

                }// END OF PREVIEW

			} else {
				if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
			}
		} else {
			if (this.buttons[i].hasClass("focused")) this.buttons[i].removeClass("focused");
		}
	}
}
HorizontalList.prototype.animScrollerLeft = function () {
    /*if (this.strecke >= this.itemmargin) {
        clearTimeout(this.animtimer);
        this.animtimer = false;
        this.strecke = 0;
        this.setFocused(this.idnam, true);

    } else {
        this.position = this.position + this.pixeltomove;
        this.strecke = this.strecke + this.pixeltomove;
        this.outer.style.left = this.position + 'px';
        var me = this;
        this.animtimer = setTimeout(function () {
            me.animScrollerLeft();
        }, 40);
    }*/
    this.setFocused(this.idnam, true);
    this.position = this.position + this.itemmargin;
    this.outer.style.left = this.position + 'px';

}
HorizontalList.prototype.animScrollerRight = function () {

    /*if (this.strecke >= this.itemmargin) {
        clearTimeout(this.animtimer);
        this.animtimer = false;
        this.strecke = 0;

        this.setFocused(this.idnam, true);

    } else {
        this.position = this.position - this.pixeltomove;
        this.strecke = this.strecke + this.pixeltomove;

        this.outer.style.left = this.position + 'px';
        var me = this;
        this.animtimer = setTimeout(function () {
            me.animScrollerRight();
        }, 40);
    }*/
    this.setFocused(this.idnam, true);
    this.position = this.initPosition - this.itemmargin * this.focusedId;
    this.outer.style.left = this.position + 'px';
}

function goRed(url) {
    window.setTimeout(function () {
        /*document*/
        window.location.href = url;
    }, 300);
}

HorizontalList.prototype.handleKeyPress = function (keyCode) {
	/*if (GLOBALS.focusmgr.getObject('home-cont').keycheck) {
		GLOBALS.focusmgr.getObject('home-cont').keycheck = 0;
		GLOBALS.focusmgr.getObject('home-cont').firsttime = 0;
		this.setFocused(this.idnam, true);
		return;
	}*/
	if (this.waitForKey) {
		var item = GLOBALS.item, source = item.media_item_link;
		document.getElementById('bb-card').style.display='none';
		this.waitForKey=0;
		item.url = source;
		item.title = item.media_item_title;
		if (!item.show_title && typeof this.data.show != 'undefined')
			item.show_title = this.data.show.title;

		GLOBALS.item = item;
		GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, item.category, (item.subs && item.subs.length ? item.subs : 0), item.thumb, null);

		if (item.live) {
			var ts = (new Date()).getTime()/1000;
			GLOBALS.ad = getNextAd(item.ads);
			if (GLOBALS.ad && GLOBALS.ad.start && GLOBALS.ad.start > ts) {
				var secs = GLOBALS.ad.start - ts;
				GLOBALS.adLoop = false;
				GLOBALS.adsCnt = 0;
				GLOBALS.adTimer = setTimeout(function() {
					GLOBALS.adLoop = true;
					if (profile.version == 'oipf')
						middlerollVideo(GLOBALS.show);
					else {
						var adBreak={};
						adBreak.ads=1;
						adBreak.position='middleroll';
						GLOBALS.vplayer.getAds(adBreak);
					}
				}, secs * 1000);
			}
		}
		return;
	}
	if (!GLOBALS.brtyp && keyCode === VK_6){
		GLOBALS.focusmgr.getObject("skai").playAd();
	}
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
	switch (keyCode) {
		case VK_0:
			goRed("http://smarttv.anixa.tv/skai/?menu=sidebar&hbbplayer=active&s="+GLOBALS.channelId);
			break;
		case VK_1:
			window.location.href = "http://smarttv.anixa.tv/skai/index.php?menu=sidebar";
			break;
		case VK_7:
            window.location.href = "http://smarttv.anixa.tv/skaiad/index.php?menu=sidebar";
			break;
		case VK_2:
			if (location.host == 'smarttv.anixa.tv' || location.host == 'localhost') {
				var o = GLOBALS.focusmgr.getObject("skai");
				o.createBigBrother();
			}
			break;

		case VK_3:
			if (location.host == 'smarttv.anixa.tv' || location.host == 'localhost')
				goRed("http://hbbtv01p.anixe.net/pub/mediashop/?sd=skaihd")
			break;
		case VK_4:
			if (location.host == 'smarttv.anixa.tv' || location.host == 'localhost')
				window.location.href = "http://hbbtv01p.anixe.net/pub/genius/?sd=skaihd";
			break;
		case VK_5:
			goRed('http://iptvweb.anixe.tv/chris/index8.php');
			break;
		case VK_8:
			if (location.host == 'smarttv.anixa.tv' || location.host == 'localhost') {
				goRed("http://smarttv.anixa.tv/creta/");
			}
			break;
		case VK_9:
			//goRed("http://skai.smart-tv-data.com/info-skai.html?s="+GLOBALS.channelId);
			break;
		case VK_UP:
            
			if (activeCont.idnam == "bigbrother" || activeCont.idnam == "radio") {
				// GLOBALS.focusmgr.focusObject("videoplayer", true);
				break;
			}

			if (activeCont.idnam == "search") {
				GLOBALS.focusmgr.focusObject("keyboard_gr");
				break;
			}
			if (activeCont.idnam == "home-cont" || keyLists.indexOf(activeCont.idnam) != -1) {
				var o = GLOBALS.focusmgr.getObject(activeCont.idnam);
				o.focusedId--;
				if (o.focusedId < 0) {
					o.focusedId = 0;
					break;
				}
				o.outertop += this.listHeight;
				o.buttons[o.focusedId].elem.style.display = 'block';
				if(o.buttons[o.focusedId+2]) o.buttons[o.focusedId+2].elem.style.display = 'none';

				var idlist = 'home-list-';
				if ( activeCont.idnam != 'home-cont')
					idlist = activeCont.idnam +'-list-';
				GLOBALS.focusmgr.focusObject(idlist+ o.focusedId, true);
			}

			if (activeCont.idnam == "lexeis") {
				activeCont.focusedId--;
				if (activeCont.focusedId < 0) {
					activeCont.focusedId = 0;
					break;
				}
				GLOBALS.focusmgr.focusObject(activeCont.idnam + "-" + activeCont.focusedId);
				break;
			} else if (activeCont.league) {
				var obj = GLOBALS.focusmgr.getObject('episodes');
				obj.focusedId--;
				if (obj.focusedId < 0) {
					obj.focusedId = 0;
					break;
				}
				GLOBALS.focusmgr.focusObject(obj.buttons[obj.focusedId].idnam);
				break;
			}

			break;
		case VK_DOWN:
			if (activeCont.idnam == "home-cont" || keyLists.indexOf(activeCont.idnam) != -1) {
				var o = GLOBALS.focusmgr.getObject(activeCont.idnam);
				o.focusedId++;
				if (o.focusedId > o.buttons.length - 1) {
					o.focusedId = o.buttons.length - 1;
					break;
				}
				o.buttons[o.focusedId].elem.style.display = 'block';
				if(o.buttons[o.focusedId + 1]) o.buttons[o.focusedId + 1].elem.style.display = 'block';
				o.buttons[o.focusedId-1].elem.style.display = 'none';
				o.outertop -= this.listHeight;

				var idlist = 'home-list-';
				if ( activeCont.idnam != 'home-cont')
					idlist = activeCont.idnam +'-list-';
				GLOBALS.focusmgr.focusObject(idlist+ o.focusedId, true);
			}
			if (activeCont.idnam == "lexeis") {
				activeCont.focusedId++;
				if (activeCont.focusedId > activeCont.buttons.length - 1) {
					activeCont.focusedId = activeCont.buttons.length - 1;
					break;
				}
				GLOBALS.focusmgr.focusObject(activeCont.idnam + "-" + activeCont.focusedId);
				break;
			}
			if (activeCont.league) {
				var obj = GLOBALS.focusmgr.getObject('episodes');
				obj.focusedId++;
				if (obj.focusedId > obj.buttons.length - 1) {
					obj.focusedId = obj.buttons.length - 1;
					break;
				}
				GLOBALS.focusmgr.focusObject(obj.buttons[obj.focusedId].idnam);
				break;
			}
			break;
		case VK_RIGHT:
			if (this.animtimer) break;
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				break;
			}
			newsShowId = this.focusedId;

			if (this.idnam == 'radio-list' || this.idnam == 'sports-select')
				this.setFocused(this.idnam, true);
			else
				this.animScrollerRight();
			break;
		case VK_LEFT:
			if (this.animtimer) break;
			this.focusedId--;
			if (this.focusedId < 0) {
				this.focusedId = 0;
				if (GLOBALS.menu == "sidebar" && this.idnam != 'sports-select') {
					if (currScene == "bigbrother" || currScene == "lexeis") break;
					var o = GLOBALS.focusmgr.getObject("side-bar");
					GLOBALS.focusmgr.focusObject("submenu-" + o.focusedId, true);
				}
				break;
			}
			newsShowId = this.focusedId;
			if (this.idnam == 'radio-list' || this.idnam == 'sports-select')
				this.setFocused(this.idnam, true);
			else
				this.animScrollerLeft();
			break;
		case VK_ENTER:
            llog(this.listType+' '+ this.idnam);
			debug(this.listType+' '+ this.idnam);
			var live = GLOBALS.focusmgr.getObject("live"), item = this.items[this.focusedId];
            
			if( this.idnam == "radio-list" || this.radio){
                if(GLOBALS.PREVIEW) GLOBALS.videopreview.pause();

				var radio = new Radio("radioPlayer");
				radio.radioIndex = this.focusedId;
				GLOBALS.scenemgr.addScene(radio);
				GLOBALS.scenemgr.showCurrentScene("");
				activeCont = radio;
				break;
			}
            llog("horizontal list VK_ENTER item");
            llog(item);
            
			if (item.mp4 || item.episode || (this.listType && typeof item.media_item_link != 'undefined') || ((this.idnam == 'sports-select' || this.idnam.indexOf('home-list') > 0) || item.live)) {
				if (GLOBALS.dev && item.id == 8) {
					location.href=item.media_item_link;
					return;
				}
				if (item.id == 2 && !GLOBALS.userId) { // big brother
					GLOBALS.focusmgr.getObject("skai").createUser();
					return;
				}
				if (typeof item == 'undefined')
					return;
				var source = item.media_item_link;
				if (this.idnam == 'sports-select') {
					document.body.removeChild(this.parentObj.elem);
				}
				if (item.id == 2 && item.title.indexOf('Big') != -1) {
					this.waitForKey =1;
					GLOBALS.item = item;
					if (!document.getElementById('bb-card')) {
						var im = document.createElement('img');
						im.id = 'bb-card';
						im.src = 'img/bb-card3.jpg';
						im.style.width = "100%";
						im.style.zIndex=100;
						im.style.position='absolute';
						document.getElementById("appscreen").appendChild(im);
					} else
						document.getElementById('bb-card').style.display='block';
					return;
				}
				if(GLOBALS.useRef){
                  llog('play video');
                  llog(item);
                  //      if(source === 'undefined'){
                    if(item.mp4) source = item.mp4;
                    else if(item.episode) source = item.episode;
              //    }
					item.url = source;
					item.title = item.media_item_title;
					if (!item.show_title && typeof this.data.show != 'undefined')
						item.show_title = this.data.show.title;

					if(item.sub){
						var subs = [], sub = {};
						sub.lang='GR';
						sub.file = "/skai" + item.sub;
						subs.push(sub);
						item.subs = subs;
					}
					var lu = null;
					if (parseInt(item.media_item_link_drm_flag) == 1) {
						lu = 'https://playready.ezdrm.com/cency/preauth.aspx?pX=2B3DA1';
						item.url = item.media_item_link_drm_dash;
					}
					GLOBALS.item = item;
                    if(GLOBALS.PREVIEW) GLOBALS.videopreview.pause();

					GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, item.category, (item.subs && item.subs.length ? item.subs : 0), item.thumb, lu);

					if (item.live) {
						var ts = (new Date()).getTime()/1000;
						GLOBALS.ad = getNextAd(item.ads);
						if (GLOBALS.ad && GLOBALS.ad.start && GLOBALS.ad.start > ts) {
							var secs = GLOBALS.ad.start - ts;
							GLOBALS.adLoop = false;
							GLOBALS.adsCnt = 0;
							GLOBALS.adTimer = setTimeout(function() {
								GLOBALS.adLoop = true;
								if (profile.version == 'oipf')
									middlerollVideo(GLOBALS.show);
								else {
									var adBreak={};
									adBreak.ads=1;
									adBreak.position='middleroll';
									GLOBALS.vplayer.getAds(adBreak);
								}
							}, secs * 1000);
						}
					}
					break;
				}
				GLOBALS.scenemgr.openVideoPlayer(ON_VOD, source);
				if (GLOBALS.HbbPlayer == "active") break; //HbbPlayer
				if (!GLOBALS.focusmgr.getObject("videoplayer")) {
					GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
					GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
				}

				if (currScene == "bigbrother") GLOBALS.videoplayer.fromepList = true;
				var title = item.media_item_title?item.media_item_title:item.title;
				//var title = this.buttons[this.focusedId].getElementsByClassName("event-titl")[0].innerHTML;
				title = title.replace(/(<([^>]+)>)/ig, '');
				
				if (item.live) {
                    if(GLOBALS.PREVIEW) GLOBALS.videopreview.pause();

					var ts = (new Date()).getTime()/1000;
					GLOBALS.ad = getNextAd(item.ads);
					if (GLOBALS.ad && GLOBALS.ad.start && GLOBALS.ad.start > ts) {
						var secs = GLOBALS.ad.start - ts;
						GLOBALS.adLoop = false;
						GLOBALS.adsCnt = 0;
						GLOBALS.adTimer = setTimeout(function() {
							GLOBALS.adLoop = true;
							middlerollVideo(GLOBALS.show);
						}, secs * 1000);
					}
				}

				var path = 'videoplayer/', showTitle = item.title;
				if (this.data && this.data.show && typeof this.data.show.title != 'undefined')
					showTitle = this.data.show.title;
				else if (typeof item.show_title != 'undefined')
					showTitle = item.show_title;

				item.category = this.data.title;
				if (!item.show_title)
					item.show_title = showTitle;
				GLOBALS.show = showTitle;
				GLOBALS.item = item;
				if (this.idnam.indexOf('home-list') != -1)
					path += 'ΜΗ ΧΑΣΕΙΣ' +'/'+ item.media_item_title.replace(/\//g, '-');
				else
					path += GLOBALS.cat +'/'+ GLOBALS.show +'/'+ item.media_item_title.replace(/\//g, '-');
				moves(path);
				if (ENABLE_PREROLL) {
					GLOBALS.videoplayer.todo = item;
					GLOBALS.videoplayer.ad = true;
					if (typeof prerollVideo !== "undefined") {
						prerollVideo(showTitle);
					}
				} else {
					GLOBALS.videoplayer.setSource(item);
					GLOBALS.videoplayer.setTitle(title);
					GLOBALS.videoplayer.start();
				}
			} else if ((typeof item.scheduled == 'undefined' || !item.scheduled) && item.id != 1) {
				var cont = GLOBALS.focusmgr.getObject("skai");

				if (item.id == 67280) {
					document.getElementsByClassName("sidebar")[0].style.visibility = "hidden";
					cont.loadJson("bigbrother", 67280);
				} else {

                    llog('Load Shows Episodes');

					cont.loadJson("episodes", item.id, activeCont.idnam, this.focusedId);
				}
			}
			break;
		case VK_BACK:
			if (GLOBALS.scenemgr.sceneStack.length == 2)
				break;
			if (currScene == "bigbrother" || currScene == "lexeis") {
				var m = GLOBALS.scenemgr.top;
				m.style.visibility = "visible";
				document.getElementsByClassName("sidebar")[0].style.visibility = "visible";
				document.getElementById("tvbild").style.display = "block";
				document.getElementById("player-bg-container").removeClass("bbstream");
				GLOBALS.scenemgr.setRF();
			}
			GLOBALS.scenemgr.goBack();
			break;
		default:
			break;
	}
}

/*
 * --- EPGList Object ---
 * Display EPG
 * Functions: 
 *   - init: init EPG
 *   - setFocused: set focus
 *   - animScrollerUp: scroll up animation
 *   - animScrollerDown: scroll down animation
 *   - handleKeyPress: handle keys
 */

function EPGList(idnam) {
    this.idnam = idnam;
    this.focusedId = 1;
    this.position = 0;
    this.itemheight = 110;
    this.strecke = 0;
    this.pixeltomove = 55;
    this.animtimer = false;
}
EPGList.prototype = new BaseObject();
EPGList.prototype.init = function (parent, xpos, ypos, data) {

    var e = createClassDiv("", "", "epg-list");
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.buttons = [];
    this.parent = parent;

    this.data = data;

    var h = this.position;
    for (var i = 0; i < data.length; i++) {
        inner = createClassDiv("", "", "epg-list-item");
        inner.id = "event_" + i;
        h += this.itemheight;

        var evttime = createClassDiv("", "", "epg-event-time");
        evttime.innerHTML = data[i].hour;
        var evtimg = createClassDiv("", "", "epg-event-image");
        var img = document.createElement('img');
        img.id = "evtimg" + i;
        img.src = data[i].img;
        evtimg.appendChild(img);
        var evtinf = createClassDiv("", "", "epg-info");
        var evttitle = createClassDiv("", "", "epg-event-title");
        evttitle.innerHTML = data[i].title;
        evtinf.appendChild(evttitle);
        var evtdescr = createClassDiv("", "", "epg-event-descr");
        evtdescr.id = "evtdescr" + i;
	    var s = data[i].descr.replace('<br>', '');
            s = s.replace('</br>', '');
            s = s.replace('<br>', '').replace('<b>', '').replace('</b>','');
        evtdescr.innerHTML = s;
        if (data[i].descr.length > 250) {

            inner.addClass("extended");
        }
        //  evtdescr.innerHTML = evtdescr.innerHTML.substring(0, 250);
        evtinf.appendChild(evtdescr);
	    if (data[i].rating != "https://media.skaitv.gr/images/20/0/") {
		    var ratTxt = ['Κατάλληλο για όλους', 'Κατάλληλο για άνω των 8 ετών','Κατάλληλο για άνω των 12 ετών','Κατάλληλο για άνω των 16 ετών','Κατάλληλο για άνω των 18 ετών'];
		    var evtrat = createClassDiv("", "", "epg-event-rating");

		    if (data[i].yp) {
			    var im = document.createElement('img');
			    im.src = 'img/yp.png';
			    im.style.marginRight = '16px';
			    evtrat.appendChild(im);
		    }
		    var im = document.createElement('img');
		    im.src = data[i].rating;
		    evtrat.appendChild(im);

		    var regex = /contentrating\/k(\d)\.png/gi;
		    var res = regex.exec(data[i].rating);
		    if (res.length>1) {
			    var n = parseInt(res[1]);
			    if (n > 0) {
				    var span = document.createElement('span');
				    span.style.marginLeft = '16px';
				    span.style.fontSize = '15px';
				    span.style.color = '#fff';
				    span.innerHTML = ratTxt[n-1];
				    evtrat.appendChild(span);
			    }
		    }

		    evtinf.appendChild(evtrat);
	    }


        inner.appendChild(evttime);
        inner.appendChild(evtimg);
        inner.appendChild(evtinf);

        e.appendChild(inner);
        this.buttons[i] = inner;
    }
    this.setLive();
    h += 1000;
    this.elem.style.height = h + "px";
}
EPGList.prototype.setFocused = function (otherobj, focus) {
    for (var i = 0; i < this.buttons.length; i++) {
        var d = document.getElementById("evtdescr" + i);
        if (focus) {

            if (i == this.focusedId) {
                this.buttons[i].addClass("focused");
                d.style.visibility = "visible";
            } else {
                this.buttons[i].removeClass("focused");
                d.style.visibility = "hidden";
            }
        } else {
            this.buttons[i].removeClass("focused");
            d.style.visibility = "hidden";
        }
    }
    return true;
}
EPGList.prototype.setLive = function () {
    var currTime = new Date();
    currTime = currTime.getTime() / 1000;

    var livelabel = createClassDiv("", "", "epg-live-label");
    livelabel.innerHTML = "LIVE";
    for (var i = 0; i < this.buttons.length; i++) {
        var time = this.data[i].ts;
        if (i < this.buttons.length - 1)
            var nexttime = this.data[i + 1].ts;
        else
            var nexttime = this.data[0].ts + 86400000;

        if (currTime >= time && currTime < nexttime)
            this.buttons[i].appendChild(livelabel);
    }
}
EPGList.prototype.animScrollerUp = function () {
    if (this.strecke >= this.itemheight) {
        clearTimeout(this.animtimer);
        this.animtimer = false;
        this.strecke = 0;
        this.setFocused(this.idnam, true);

    } else {
        this.position = this.position + this.pixeltomove;
        this.strecke = this.strecke + this.pixeltomove;
        this.elem.style.top = this.position + 'px';
        var me = this;
        this.animtimer = setTimeout(function () {
            me.animScrollerUp();
        }, 40);
    }
}
EPGList.prototype.animScrollerDown = function () {
    if (this.strecke >= this.itemheight) {
        clearTimeout(this.animtimer);
        this.animtimer = false;
        this.strecke = 0;

        this.setFocused(this.idnam, true);

    } else {

        this.position = this.position - this.pixeltomove;
        this.strecke = this.strecke + this.pixeltomove;

        this.elem.style.top = this.position + 'px';
        var me = this;
        this.animtimer = setTimeout(function () {
            me.animScrollerDown();
        }, 40);
    }
}
EPGList.prototype.handleKeyPress = function (keycode) {
    if (keycode === VK_RED) {
        this.onRed();
    }
    if (keycode === VK_GREEN) {
        this.onGreen();

        return true;
    }
    if (keycode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keycode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    switch (keycode) {
        case VK_LEFT:
            if (GLOBALS.menu == "sidebar") {
                var o = GLOBALS.focusmgr.getObject("side-bar");
                GLOBALS.focusmgr.focusObject("submenu-" + o.focusedId, true);
            }
            break;
        case VK_DOWN:
            if (this.animtimer) break;
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
            else this.animScrollerDown();
            this.setFocused(this.idnam, true);
            break;
        case VK_UP:
            if (this.animtimer) break;
            this.focusedId--;
            if (this.focusedId < 0) {
                this.focusedId = 0;
                GLOBALS.focusmgr.focusObject("epg-dayselect");
                break;
            } else
                this.animScrollerUp();
            this.setFocused(this.idnam, true);
            break;
        case VK_BACK:
            GLOBALS.focusmgr.focusObject("epg-dayselect");
            break;
        default:
            break;
    }
}

/*
 * --- DaySelect Object ---
 * Display days for EPG
 * Functions:
 *   - init: init days selction for EPG
 *   - setFocused: set focus
 *   - setActive: set active day
 *   - createWeek: not used
 *   - weekDates: not used
 *   - handleKeyPress: handle keys
 */

function DaySelect(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
}

DaySelect.prototype = new BaseObject();
DaySelect.prototype.init = function (parent, xpos, ypos, days) {
    var dayselect = createClassDiv("", "", "epg-day-select");
    parent.appendChild(dayselect);
    this.baseInit(dayselect);
    this.register();
    this.buttons = [];
    this.days = days;

    var d = new Date();

    this.focusedId = d.getDay() - 1;

    for (var i = 0; i < days.length; i++) {
        var dayitem = createClassDiv("", "", "epg-day-item");
        var res = days[i].date.split(" ");
        dayitem.innerHTML = "<strong>" + res[0] + "</strong> <br></br>" + res[1];
        dayselect.appendChild(dayitem);
        this.buttons[i] = dayitem;
    }

    this.setActive(this.buttons[this.focusedId], true);

    var me = GLOBALS.focusmgr.getObject("epg");
    var cont = createClassDiv("", "", "epg-content");

    me.elem.appendChild(cont);

    var list = new EPGList("epg-list");
    list.init(cont, "", "", days[this.focusedId].shows);
    me.buttons.push(list);
    GLOBALS.focusmgr.focusObject("epg-list");
}
DaySelect.prototype.setFocused = function (otherobj, focus) {
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) this.buttons[i].addClass("focused");
            else this.buttons[i].removeClass("focused");
        } else this.buttons[i].removeClass("focused");
    }
    return true;
}
DaySelect.prototype.setActive = function (otherobj, focus) {
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) this.buttons[i].addClass("active");
            else this.buttons[i].removeClass("active");
        } else this.buttons[i].removeClass("active");
    }
    return true;
}
DaySelect.prototype.createWeek = function (day) {
    var days = ["ΚΥΡΙΑΚΗ", "ΔΕΥΤΕΡΑ", "ΤΡΙΤΗ", "ΤΕΤΑΡΤΗ", "ΠΕΜΠΤΗ", "ΠΑΡΑΣΚΕΥΗ", "ΣΑΒΒΑΤΟ"];
    var newdays = [];

    newdays.push(days[day]);
    for (var i = day; i < days.length; i++) {
        if (i != day) {
            newdays.push(days[i]);
        }

    }
    for (var i = 0; i < day; i++) {
        if (i != day) {
            newdays.push(days[i]);
        }

    }
    return newdays;
}
DaySelect.prototype.weekDates = function (today) {
    var weekdates = [];

    for (var i = 0; i < 7; i++) {
        var newDate = new Date(today.getTime() + i * 86400000);
        var day = newDate.getDate();
        var month = newDate.getMonth() + 1;

        var wdat = day + " / " + month;
        weekdates.push(wdat);
    }

    return weekdates;
}
DaySelect.prototype.handleKeyPress = function (keycode) {
    if (keycode === VK_RED) {
        this.onRed();
    }
    if (keycode === VK_GREEN) {
        this.onGreen();

        return true;
    }
    if (keycode === VK_YELLOW) {
        this.onYellow();
        return true;
    }
    if (keycode === VK_BLUE) {
        this.onBlue();
        return true;
    }
    switch (keycode) {
        case VK_RIGHT:
            this.focusedId++;
            if (this.focusedId > this.buttons.length - 1) {
                this.focusedId = this.buttons.length - 1;
            }
            this.setFocused(this.idnam, true);
            break;
        case VK_LEFT:
            this.focusedId--;
            if (this.focusedId < 0) {
                this.focusedId = 0;
                if (GLOBALS.menu == "sidebar") {
                    var o = GLOBALS.focusmgr.getObject("side-bar");
                    GLOBALS.focusmgr.focusObject("submenu-" + o.focusedId, true);
                }
                break;
            }
            this.setFocused(this.idnam, true);
            break;
        case VK_DOWN:
            GLOBALS.focusmgr.focusObject("epg-list");
            break;
        case VK_UP:
            if (GLOBALS.menu != "sidebar") GLOBALS.focusmgr.focusObject("menu");
            break;
        case VK_ENTER:
            this.setActive(this.idnam, true);

            if (GLOBALS.focusmgr.getObject("epg-list")) {
                var o = GLOBALS.focusmgr.getObject("epg-list");
                o.unregister();
                document.getElementsByClassName("epg-content")[0].removeChild(o.elem);
                var e = new EPGList("epg-list");
                e.init(document.getElementsByClassName("epg-content")[0], 0, 0, this.days[this.focusedId].shows);
                GLOBALS.focusmgr.focusObject("epg-list");
            }
            break;
        case VK_BACK:
            GLOBALS.scenemgr.goBack();
            break;
        default:
            break;
    }
}
/* Radio object:
 * create a simple radio stream page
 * */
function Radio(idnam) {
    this.idnam = idnam;
    this.focusedId = 0;
    this.radioIndex = 0;
}
Radio.prototype = new BaseObject();
Radio.prototype.init = function (parent, xpos, ypos) {
	var bg = './img/bg/'+ this.idnam +'.png';
	var e = createDiv(0, 0, 1280, 720, this.idnam), item = {};

	if(NEW_RADIO){
		item = radioStreams.shows[this.radioIndex];
		this.source = item.media_item_link;
		bg = item.bg;
		e.style.backgroundRepeat = 'no-repeat';
		e.style.backgroundPosition = 'center';
	}else{
		this.source = 'https://skai.live24.gr/skai1003';
		if (this.idnam == 'radio2')
			this.source = 'https://sportfm.live24.gr/sportfm7712';
	}
	e.style.backgroundImage = "url(" + bg + ")";
	parent.appendChild(e);

	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;

	/*document.getElementById("tvbild").style.display = "none";
	if (document.getElementById('mybroadcast')) {
		var dvb = document.getElementById('mybroadcast');
		try {
			dvb.stop();
		} catch (e) {}*/
		/*try {
			dvb.release();
		} catch (e) {}*/
	//}
	if (NEW_RADIO) {
		if (item.controller == 'skailive_controller') {
			item.url = item.media_item_link;
			GLOBALS.item = item;
			GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, item.category, (item.subs && item.subs.length ? item.subs : 0), item.thumb, null);
		} else {
			item.media_item_title = item.title;
			item.category = 'Radio';
			item.episode = item.title;
			item.show_title = item.title;
			GLOBALS.item = item;
			var path = 'Radio/'+ item.title;
			debug(path);
			moves(path);
			var div = document.getElementById("player-container");

			if (div) {
                /* HbbTV does not make a distinction between video and audio in the object player. Changing type="audio/mpeg" to "video/mpeg" fixed it */
				var inner = '<object type="video/mpeg" id="video-radio" data="' + this.source + '"></object>';
				div.innerHTML = inner;
				div.style.display = "block";
				div.style.zIndex = 1;
				div.style.width = '1280px';
				div.style.height = '720px';
				div.style.top = 0;

				var vid = document.getElementById('video-radio');
                
				vid.style.width = '1px';
				vid.style.height = '1px';
				if (vid) {
                    vid.addEventListener("PlayStateChange", function(){
                        var playStateDescriptions = {
                            0: "0. Unrealized",
                            1: "1. Connecting",
                            2: "2. Presenting",
                            3: "3. Stopped",
                            4: "4. Buffering",
                            5: "5. Finished",
                            6: "6. Error"
                        };

                        var stateMessage = playStateDescriptions[vid.playState] || "Unknown State";


                        debug("Radio playstate: " + stateMessage);
                           
                        if (vid.playState === 6) {
                            var errorDetails = {
                                state: vid.playState,
                                error: vid.error || "No error object available",
                                errorCode: vid.error && vid.error.code ? vid.error.code : "Error code unavailable",
                                errorMessage: vid.error && vid.error.message ? vid.error.message : "No error message available",
                                networkState: vid.networkState || "Network state unavailable"
                            };

                            debug("Radio player encountered an issue:");
                            for (var key in errorDetails) {
                                if (errorDetails.hasOwnProperty(key)) {
                                    debug("  " + key + ": " + errorDetails[key]);
                                }
                            }
                        }
                    });
                    try {
                      vid.play(1);
                      this.isPlaying = true;
                  } catch (e) {
                    debug("Radio failed to play - Exception Details:");


                    if (typeof e === "object" && e !== null) {
                        for (var key in e) {
                            if (e.hasOwnProperty && e.hasOwnProperty(key)) {
                                debug(key + ": " + e[key]);
                            }
                        }
                    }


                    var message = e.message ? e.message : "N/A";
                    var name = e.name ? e.name : "N/A";
                    var stack = e.stack ? e.stack : "N/A";

                    debug("Message: " + message);
                    debug("Name: " + name);
                    debug("Stack: " + stack);
                }
              }
			}
			var controller = document.getElementById("radio-control")
			if(!controller) {
				controller = document.createElement("div");
				controller.id = "radio-control";
				controller.addClass(item.controller);
				controller.style.display = "block";
			}
			div.appendChild(controller);
		}

		if (0) {
			GLOBALS.scenemgr.openVideoPlayer(ON_VOD, this.source);
			if (!GLOBALS.focusmgr.getObject("videoplayer")) {
				GLOBALS.videoplayer = new VideoPlayer("videoplayer", "player-container", "basic-videotimer", 153, 592, true, "");
				GLOBALS.videoplayer.init(document.getElementsByTagName("body")[0], 0, 0);
			}
			GLOBALS.videoplayer.setSource(item);
			GLOBALS.videoplayer.isRadio = true;
			GLOBALS.videoplayer.customControl = item.controller;
			GLOBALS.videoplayer.title.innerHTML = item.title;
			GLOBALS.videoplayer.start('video/mpeg');
			GLOBALS.focusmgr.focusObject("videoplayer", true);
		}

		//document.getElementById('player-container').style.display='none';
		return;
	}

	var inner = '<video id="video" src="' + this.source + '" controls="" autoplay=""></video>';
	if (GLOBALS.brtyp) inner = '<object type="audio/mpeg" id="video" data="' + this.source + '"></object>';
	if (document.getElementById("player-container")) {
		document.getElementById("player-container").innerHTML = inner;
		document.getElementById("player-container").style.display = "block";

		var vid = document.getElementById('video');

		if (vid) {

			try {
				vid.play(1);
				this.isPlaying = true;
			} catch (e) {
                debug("Radio failed to play - Exception Details:");


                if (typeof e === "object" && e !== null) {
                    for (var key in e) {
                        if (e.hasOwnProperty && e.hasOwnProperty(key)) {
                            debug(key + ": " + e[key]);
                        }
                    }
                }


                var message = e.message ? e.message : "N/A";
                var name = e.name ? e.name : "N/A";
                var stack = e.stack ? e.stack : "N/A";

                debug("Message: " + message);
                debug("Name: " + name);
                debug("Stack: " + stack);
            }
        }
    }
}
Radio.prototype.startRadio = function (){
	var vid = document.getElementById('video-radio');
		if (vid) {
			try {
				vid.play(1);
				this.isPlaying = true;
				//wsplay(WSID);
			} catch (e) {
                debug("Radio failed to play - Exception Details:");

                
                if (typeof e === "object" && e !== null) {
                    for (var key in e) {
                        if (e.hasOwnProperty && e.hasOwnProperty(key)) {
                            debug(key + ": " + e[key]);
                        }
                    }
                }


                var message = e.message ? e.message : "N/A";
                var name = e.name ? e.name : "N/A";
                var stack = e.stack ? e.stack : "N/A";

                debug("Message: " + message);
                debug("Name: " + name);
                debug("Stack: " + stack);
            }
		}
	var control = document.getElementById("radio-control");
	if(control && control.hasClass("on")){
		control.removeClass("on");
	}else if(control) {
		control.addClass("on");
	}
	this.playState = true;
}
Radio.prototype.pause = function (){
	var vid = document.getElementById('video-radio');
		if (vid) {
			try {
				vid.stop();
				this.isPlaying = false;
				//wsplay();
			} catch (e) {
                debug("radio failed to stop -"+e.description);
            }
		}
	var control = document.getElementById("radio-control");
	if(control && control.hasClass("on")){
		control.removeClass("on");
	}else if(control) {
		control.addClass("on");
	}
	this.playState = false;
	GLOBALS.scenemgr.stopBroadcast();
}
Radio.prototype.stopRadio = function (){
	var vid = document.getElementById('video-radio');
		if (vid) {
			try {
				vid.stop();
				this.isPlaying = false;
				//wsplay();
			} catch (e) {
                debug("radio failed to stop -"+e.description);
            }
			try {
				vid.pause();
			} catch (e) {
                debug("radio failed to pause -"+e.description);
            }
			try {
				vid.data = '';
			} catch (e) {}
			try {
				vid.src = '';
			} catch (e) {}
		}
	this.playState = false;
}
Radio.prototype.handleKeyPress = function (keyCode) {
	if (this.newSource) {
		if (keyCode == VK_BACK) {
			GLOBALS.scenemgr.setRF();
			GLOBALS.scenemgr.goBack();
		}
		return;
	}
	switch (keyCode) {
		case VK_ENTER:
			if(this.playState == false){
				this.startRadio();
			}else this.pause();
			break;
		case VK_PLAY:
			this.startRadio();
			break;
		case VK_PAUSE:
			this.pause();
			break;
		case VK_BACK:
			document.getElementById("radio-control").style.display = "none";
			var vid = document.getElementById('video-radio');
			if (vid) {
				try {
					vid.stop();
					this.isPlaying = false;
					//wsplay();
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
			}
			GLOBALS.scenemgr.setRF();
			GLOBALS.scenemgr.goBack();
		default:
			break;
	}
}
Radio.prototype.oldhandleKeyPress = function (keyCode) { // for old videoplayer
	switch (keyCode) {
		case VK_BACK:
            document.getElementById("radio-control").style.display = "none";
			var vid = document.getElementById('video');
			if (vid) {
				try {
					vid.stop();
					this.isPlaying = false;
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
			}
			//document.getElementById("tvbild").style.display = "block";
			//GLOBALS.scenemgr.setRF();
			GLOBALS.scenemgr.goBack();
        case VK_ENTER:
            var control = document.getElementById("radio-control");
            if(control && control.hasClass("on")){
                control.removeClass("on");
            }else if(control) {
                control.addClass("on");
            }
            GLOBALS.videoplayer.playPause();
            break;
		default:
            break;
			if (GLOBALS.videoplayer)
				GLOBALS.videoplayer.handleKeyPress(keyCode);
			break;
	}
}

function ConsentFrame(idnam){
    this.idnam = idnam;
    this.consentCookies = {consent:"true",person:"true",stats:"true"};
}
ConsentFrame.prototype = new BaseObject();

ConsentFrame.prototype.init = function(parent, xpos, ypos){
    var e = createClassDiv("","","consentParent");
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.elem = e;
    if(getCookie("cookie_person") != ""){
        this.consentCookies.person = getCookie("cookie_person");
    }
    if(getCookie("cookie_stats") != ""){
        this.consentCookies.stats = getCookie("cookie_stats");
    }
    this.entry = new ConsentEntry("consentEntry");
    this.entry.init(e,"","");
}

ConsentFrame.prototype.showMore = function() {
    this.entry.elem.style.display = "none";
    this.more = new ConsentMore("consentMore");
    this.more.init(this.elem);
}

function ConsentEntry(idnam){
    this.idnam = idnam;
}
ConsentEntry.prototype = new BaseObject();

ConsentEntry.prototype.init = function(parent, xpos, ypos) {
    var e = createClassDiv("","","consentContainer");
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.elem = e;
    var headline = createClassDiv("","","headline");
    headline.innerHTML = "Σεβόμαστε την ιδιωτικότητά σας";
    this.top = 56;
    var textContainer = createClassDiv("","","consentTextContainer");
    this.text = createClassDiv("","","text");
    this.text.style.top = this.top+"px";
    this.text.innerHTML = "<p>Εμείς και οι συνεργάτες μας αποθηκεύουμε ή/και έχουμε πρόσβαση σε πληροφορίες σε μια συσκευή, όπως cookies και επεξεργαζόμαστε προσωπικά δεδομένα, όπως μοναδικά αναγνωριστικά και τυπικές πληροφορίες που αποστέλλονται από μια συσκευή για εξατομικευμένες διαφημίσεις και περιεχόμενο, μέτρηση διαφημίσεων και περιεχομένου, καθώς και απόψεις του κοινού για την ανάπτυξη και βελτίωση προϊόντων.</p>"+
    "<p>Με την άδειά σας, εμείς και οι συνεργάτες μας ενδέχεται να χρησιμοποιήσουμε ακριβή δεδομένα γεωγραφικής τοποθεσίας και ταυτοποίησης μέσω σάρωσης συσκευών. Μπορείτε να κάνετε κλικ για να συναινέσετε στην επεξεργασία από εμάς και τους συνεργάτες μας όπως περιγράφεται παραπάνω. Εναλλακτικά, μπορείτε να αποκτήσετε πρόσβαση σε πιο λεπτομερείς πληροφορίες και να αλλάξετε τις προτιμήσεις σας πριν συναινέσετε ή να αρνηθείτε να συναινέσετε.</p>"+
    "<p>Λάβετε υπόψη ότι κάποια επεξεργασία των προσωπικών σας δεδομένων ενδέχεται να μην απαιτεί τη συγκατάθεσή σας, αλλά έχετε το δικαίωμα να αρνηθείτε αυτήν την επεξεργασία. Οι προτιμήσεις σας θα ισχύουν μόνο για αυτόν τον ιστότοπο. Μπορείτε πάντα να αλλάξετε τις προτιμήσεις σας επιστρέφοντας σε αυτόν τον ιστότοπο ή επισκεπτόμενοι την πολιτική απορρήτου μας.</p>";

    this.arrowUp = createClassDiv("","","scroll up");
    var bg = createClassDiv("","","bg");
    var icon = createClassDiv("","","icon");
    this.arrowUp.appendChild(bg);
    this.arrowUp.appendChild(icon);
    this.arrowDown = this.arrowUp.cloneNode(true);
    this.arrowDown.className = "scroll down active";
    this.buttons = [];

    var buttons = createClassDiv("","","buttons focus");
    var acceptBtn = createClassDiv("","","button right focus");
    acceptBtn.innerHTML = "ΑΠΟΔΟΧΗ"
    var optionsBtn = createClassDiv("","","button left");
    optionsBtn.innerHTML = "ΠΕΡΙΣΣΟΤΕΡΕΣ ΕΠΙΛΟΓΕΣ"
    buttons.appendChild(acceptBtn);
    buttons.appendChild(optionsBtn);
    
    this.buttons.push(optionsBtn);
    this.buttons.push(acceptBtn);

    var overlayTop = createClassDiv("","","overlay top");
    var overlayBottom = createClassDiv("","","overlay bottom");

    textContainer.appendChild(this.text);
    textContainer.appendChild(overlayTop);
    textContainer.appendChild(overlayBottom);


    e.appendChild(textContainer);
    e.appendChild(headline);
    e.appendChild(this.arrowUp);
    e.appendChild(this.arrowDown);
    e.appendChild(buttons);
    this.focusedId = 1;
    GLOBALS.focusmgr.focusObject(this.idnam);
}

ConsentEntry.prototype.handleKeyPress = function (keyCode) {
    switch (keyCode) {
        case VK_LEFT:
            this.focusedId--;
            if(this.focusedId<0) this.focusedId = 0;
            this.setFocused(this.idnam,true);
            break;
        case VK_RIGHT:
            this.focusedId++;
            if(this.focusedId>1) this.focusedId = 1;
            this.setFocused(this.idnam,true);
            break;
        case VK_DOWN:
            this.scrollDown();
            break;
        case VK_UP:
            this.scrollUp();
            break;
        case VK_ENTER:
            var c = GLOBALS.focusmgr.getObject("consentFrame");
            if(this.focusedId == 0){
                if(c){
                    c.showMore();
                }
            }else{
                this.unregister();
                setCookie("cookie_person",c.consentCookies.person);
                setCookie("cookie_stats",c.consentCookies.stats);
                setCookie("cookie_consent", "true");
                if(c){
                    c.unregister();
                    c.elem.remove();
                }
                loadScene(46);

                
            }
            break;
        case VK_BACK:
            if(LOG) console.log("exit app");
            break;
        default:
            break;
    }
}

ConsentEntry.prototype.setFocused = function (otherobj, focus) {
    for (var i = 0; i < this.buttons.length; i++) {
        if (focus) {
            if (i == this.focusedId) this.buttons[i].addClass("focus");
            else this.buttons[i].removeClass("focus");
        } else this.buttons[i].removeClass("focus");
    }
    return true;
}

ConsentEntry.prototype.scrollDown = function() {
    if(this.top == -308) return;
    this.arrowUp.addClass("active");
    this.arrowDown.removeClass("active");
    this.top -= 364;
    this.text.style.top = this.top+"px";
}
ConsentEntry.prototype.scrollUp = function() {
    if(this.top == 56) return;
    this.arrowDown.addClass("active");
    this.arrowUp.removeClass("active");
    this.top += 364;
    this.text.style.top = this.top+"px";
}

function ConsentMore(idnam){
    this.idnam = idnam;
    this.positions = [
        "top",
        "middle",
        "bottom"
        ];
}
ConsentMore.prototype = new BaseObject();

ConsentMore.prototype.init = function(parent, xpos, ypos) {
    var c = GLOBALS.focusmgr.getObject("consentFrame");
    var e = createClassDiv("","","consentSettingsContainer");
    parent.appendChild(e);
    this.baseInit(e);
    this.register();
    this.elem = e;
    this.buttonsY = [];
    this.buttonsX = [];
    var headline = createClassDiv("","","headline");
    headline.innerHTML = "Ρυθμίσεις απορρήτου";

    var subline = createClassDiv("","","subline");
    subline.innerHTML = "(Placeholder Text) Μπορείτε να ανακαλέσετε ή να αλλάξετε τη συγκατάθεσή σας ανά πάσα στιγμή <br/>πηγαίνοντας στις ρυθμίσεις.";

    var cont = createClassDiv("","","container");

    var btn1 = createClassDiv("","","button option top");

    var icon = createClassDiv("","","icon");
    var title = createClassDiv("","","title");
    title.innerHTML = "Απαραίτητα cookies";
    var txt = createClassDiv("","","txt");
    txt.innerHTML = "Κρατάει τις επιλογές σας εαν εγκρίνετε ή οχι τα υπόλοιπα cookies.";
    
    btn1.appendChild(icon);
    btn1.appendChild(title);
    btn1.appendChild(txt);


    var btn2 = createClassDiv("","","button option middle");
    if(c && c.consentCookies.person == "true"){
        btn2.addClass("sel");
    }
    var toggle = createClassDiv("","","toggle");
    
    var title = createClassDiv("","","title");
    title.innerHTML = "Cookies εξατομίκευσης";
    var txt = createClassDiv("","","txt");
    txt.innerHTML = "Κρατάει αναγνωριστικά στοιχεία της συσκευής σας ώστε να μπορείτε να συνδέεστε αυτόματα και να συνεχίζετε ένα βίντεο από εκεί που το σταματήσατε.";

    btn2.appendChild(toggle);
    btn2.appendChild(title);
    btn2.appendChild(txt);

    var btn3 = createClassDiv("","","button option bottom");
    if(c && c.consentCookies.stats == "true")
        btn3.addClass("sel");
    var toggle = createClassDiv("","","toggle");
    
    var title = createClassDiv("","","title");
    title.innerHTML = "Στατιστικά cookies";
    var txt = createClassDiv("","","txt");
    txt.innerHTML = "Κρατάει στοιχεία που μας βοηθάνε να συλλέγουμε στατιστικά δεδομένα.";

    btn3.appendChild(toggle);
    btn3.appendChild(title);
    btn3.appendChild(txt);

    cont.appendChild(btn1);
    cont.appendChild(btn2);
    cont.appendChild(btn3);

    var buttons = createClassDiv("","","buttons focus");
    var acceptBtn = createClassDiv("","","button right focus");
    acceptBtn.innerHTML = "ΑΠΟΔΟΧΗ ΟΛΩΝ"
    var optionsBtn = createClassDiv("","","button left");
    optionsBtn.innerHTML = "ΑΠΟΘΗΚΕΥΣΗ ΡΥΘΜΙΣΕΩΝ"
    buttons.appendChild(acceptBtn);
    buttons.appendChild(optionsBtn);
    
    this.buttonsY.push(btn1);
    this.buttonsY.push(btn2);
    this.buttonsY.push(btn3);
    this.buttonsY.push(buttons);

    this.buttonsX.push(optionsBtn);
    this.buttonsX.push(acceptBtn);

    this.focusedIdY = 3;
    this.focusedIdX = 1;

    this.cont = cont;
    e.appendChild(cont);
    e.appendChild(headline);
    e.appendChild(subline);
    e.appendChild(buttons);
    GLOBALS.focusmgr.focusObject(this.idnam);
}
ConsentMore.prototype.handleKeyPress = function (keyCode) {
    switch (keyCode) {
        case VK_LEFT:
            if(this.focusedIdY!=3) return;
            this.focusedIdX--;
            if(this.focusedIdX<0) this.focusedIdX = 0;
            this.setFocused(this.idnam,true);
            break;
        case VK_RIGHT:
            if(this.focusedIdY!=3) return;
            this.focusedIdX++;
            if(this.focusedIdX>1) this.focusedIdX = 1;
            this.setFocused(this.idnam,true);
            break;
        case VK_DOWN:
            this.focusedIdY++;
            if(this.focusedIdY==3)
                this.buttonsY[3].addClass("focus");
            if(this.focusedIdY>3) this.focusedIdY=3;
            this.setFocused(this.idnam,true);
            break;
        case VK_UP:
            this.focusedIdY--;
            this.buttonsY[3].removeClass("focus");
            if(this.focusedIdY<0) this.focusedIdY=0;
            this.setFocused(this.idnam,true);
            break;
        case VK_ENTER:
            var c = GLOBALS.focusmgr.getObject("consentFrame");
            if(this.focusedIdY==3){
                if(this.focusedIdX == 1){
                    this.unregister();
                    
                    if(c){
                        c.entry.unregister();
                        c.unregister();
                        c.elem.remove();
                    }
                    setCookie("cookie_person", "true");
                    setCookie("cookie_stats", "true");
                    setCookie("cookie_consent", "true");
                    loadScene(46);
                    break;
                }else{
                
                }
            }else{
                if(this.buttonsY[this.focusedIdY].hasClass("sel")){
                    c.consentCookies[Object.keys(c.consentCookies)[this.focusedIdY]] = "false";
                    this.buttonsY[this.focusedIdY].removeClass("sel");
                }else{
                    c.consentCookies[Object.keys(c.consentCookies)[this.focusedIdY]] = "true";
                    this.buttonsY[this.focusedIdY].addClass("sel");
                }
                break;
            }
        case VK_BACK:
            this.unregister();
            var c = GLOBALS.focusmgr.getObject("consentFrame");
            if(c){
                c.entry.elem.style.display = "block";
                GLOBALS.focusmgr.focusObject(c.entry.idnam);
            }
            this.elem.remove();
            break;
        default:
            break;
    }
}
ConsentMore.prototype.setFocused = function (otherobj, focus) {
    if(this.focusedIdY<3){
        for (var i = 0; i < this.buttonsY.length; i++) {
            if (focus) {
                if (i == this.focusedIdY) this.buttonsY[i].addClass("focus");
                else this.buttonsY[i].removeClass("focus");
                this.cont.className = "container focus "+this.positions[this.focusedIdY];
            } else this.buttonsY[i].removeClass("focus");
        }
    }else{
        this.cont.className = "container";
        for (var i = 0; i < this.buttonsX.length; i++) {
            if (focus) {
                if (i == this.focusedIdX) this.buttonsX[i].addClass("focus");
                else this.buttonsX[i].removeClass("focus");
            } else this.buttonsX[i].removeClass("focus");
        }
    }
    
    return true;
}
function smart_substr(str, len) {
	var temp = str.substr(0, len);
	if(temp.lastIndexOf('<') > temp.lastIndexOf('>')) {
		temp = str.substr(0, 1 + str.indexOf('>', temp.lastIndexOf('<')));
	}
	return temp;
}

function SelectSports(idnam, items) {
	this.idnam = idnam;
	this.items = items;
	this.focusedId = 0;
}
SelectSports.prototype = new BaseObject();
SelectSports.prototype.init = function (parent, xpos, ypos) {
	var e = createClassDiv("", "", "sel-popup");
	e.style.backgroundImage = "url("+ GLOBALS.scenemgr.live.bg_icon +")";
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;
	var div = createClassDiv("", "", "sel-div");

	var data = {};
	data.title='Επιλογή Αγώνα';
	data.items = this.items;

	GLOBALS.focusmgr.getObject('home-cont').firsttime = 0;
	this.elem.appendChild(div);

	var list = new HorizontalList("sports-select", true, this.items);
	list.data = data;
	list.parentObj = this;
	list.initEpisodes(div, "", "");
	setTimeout(function(){
		GLOBALS.focusmgr.focusObject("sports-select", true);
	}, 400);
}
