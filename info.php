<?php
echo ('<?xml version="1.0" encoding="utf-8" ?>');
date_default_timezone_set('Europe/Athens');

$menu = isset($_GET['menu']) ? $_GET["menu"] : "";
$hbbplayer = isset($_GET['hbbplayer']) ? $_GET["hbbplayer"] : "";
$action = isset($_GET['action']) ? $_GET["action"] : "";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" firetv-class="firetv" firetv-profile="hbbtv">

<head>
    <!-- <script type="text/javascript" id="firetv-bootstrap" src="firetv://js/bootstrap?profile=hbbtv"></script> -->
    <style>
        html,
        body,
        div,
        span,
        applet,
        object,
        iframe,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        blockquote,
        pre,
        a,
        abbr,
        acronym,
        address,
        big,
        cite,
        code,
        del,
        dfn,
        em,
        font,
        img,
        ins,
        kbd,
        q,
        s,
        samp,
        small,
        strike,
        strong,
        sub,
        sup,
        tt,
        var,
        b,
        u,
        i,
        center,
        dl,
        dt,
        dd,
        ol,
        ul,
        li,
        fieldset,
        form,
        label,
        legend,
        table,
        caption,
        tbody,
        tfoot,
        thead,
        tr,
        th,
        td,
        embed {
            margin: 0;
            padding: 0;
            border: 0;
            outline: 0;
            font-size: 100%;
            font-style: inherit;
            font-family: inherit;
            vertical-align: baseline;
            background: transparent;
            overflow: hidden;
        }

        div,
        object {
            position: absolute;
        }

        #programm {
            top: 720px;
            transition: top 1s;
        }

        #programm.open {
            top: 485px;
            transition: top 1s;
        }

        #info {
            top: -200px;
            transition: top 1s;
        }

        #info.open {
            top: 0px;
            transition: top 1s;
        }
    </style>
    <meta http-equiv="content-type" content="application/vnd.hbbtv.xhtml+xml; charset=UTF-8" />
    <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE" />
    <META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE" />
    <META HTTP-EQUIV="EXPIRES" CONTENT="Mon, 22 Jul 2002 11:12:01 GMT" />
    <title>HBBTV-SKAI</title>

    <script type="text/javascript" src="/js/keycodes.js"></script>
    <script type="text/javascript" src="/js/hbbtvlib.js"></script>
    <script>
        var aktueller_sender = 'skaisd',
            clerror = false,
            it_stream = "skai",
            smarttv_id = '1500036',
            useJS = true,
            piwikTracker = 0,
            piwid = (aktueller_sender == 'skaisd' ? 1 : 3);
    </script>
    <script type="text/javascript">
        var vercc = 0,
            chdb = {
                'skaisd': [0, 600, 700, 21000, 764],
                'skaihd': [0, 2600, 2700, 21000, 764]
            };

        function loadScript() {
            var dyid, pathToScript = "http://78.46.91.85/smarttv/smart.php?xt=1&s=skaisd&sid=1500036.1588750931.1588750931.42186075&stk=";
            if (pathToScript == '') return;
            pathToScript += '&rd=' + Math.random();
            dyid = 'basesc' + Math.random();
            var head = document.getElementsByTagName("head")[0];
            var js = document.createElement("script");
            js.setAttribute('id', dyid);
            js.type = "text/javascript";
            js.src = pathToScript;
            head.appendChild(js);
        };
        window.setTimeout(loadScript, 4000);

        var curr, dur;

        function getProgramm() {
            createDate();
            var max = 10;
            out = '', vid = document.getElementById('mybroadcast');
            try {
                for (var i = 0; i < vid.programmes.length; i++) {
                    getEitEventText(vid.programmes[i], i);
                }
            } catch (e) {}
        }

        function getEitEventText(evt, i) {
            var dstart = new Date(evt.startTime * 1000);
            var dend = new Date((evt.startTime + evt.duration) * 1000);
            var fromhrs = dstart.getHours();
            var frommin = dstart.getMinutes();
            var tohrs = dend.getHours();
            var tomin = dend.getMinutes();
            var ename = ("" + evt.name).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            if (i == 0) {
                document.getElementById("infotitle").innerHTML = ename;
                document.getElementById("infotxt").innerHTML = evt.longDescription;
                dur = evt.duration * 1000;
                curr = Date.now() - evt.startTime * 1000;
                calcCurrTime(dur, curr);
            }
            if (i == 0) {
                document.getElementById("currProg").innerHTML = ename;
                document.getElementById("currTime").innerHTML = (fromhrs < 10 ? '0' : '') + fromhrs + (frommin < 10 ? ':0' : ':') + frommin + "-" + (tohrs < 10 ? '0' : '') + tohrs + (tomin < 10 ? ':0' : ':') + tomin;
            } else {
                document.getElementById("nextProg").innerHTML = ename;
                document.getElementById("nextTime").innerHTML = (fromhrs < 10 ? '0' : '') + fromhrs + (frommin < 10 ? ':0' : ':') + frommin + "-" + (tohrs < 10 ? '0' : '') + tohrs + (tomin < 10 ? ':0' : ':') + tomin;

            }
        }

        function createDate() {
            var date = new Date();
            var hrs = date.getHours();
            var mins = date.getMinutes();
            var day = date.getDay();
            var dat = date.getDate();
            var month = date.getMonth();

            var daytxt;
            switch (day) {
                case 0:
                    daytxt = "Κυριακή"
                    break;
                case 1:
                    daytxt = "Δευτέρα"
                    break;
                case 2:
                    daytxt = "Τρίτη"
                    break;
                case 3:
                    daytxt = "Τετάρτη"
                    break;
                case 4:
                    daytxt = "Πέμπτη"
                    break;
                case 5:
                    daytxt = "Παρασκευή"
                    break;
                case 6:
                    daytxt = "Σάββατο"
                    break;
            }
            var datetxt;
            switch (month) {
                case 0:
                    datetxt = "Ιανουαρίου"
                    break;
                case 1:
                    datetxt = "Φεβρουαρίου"
                    break;
                case 2:
                    datetxt = "Μαρτίου"
                    break;
                case 3:
                    datetxt = "Απριλίου"
                    break;
                case 4:
                    datetxt = "Μαΐου"
                    break;
                case 5:
                    datetxt = "Ιουνίου"
                    break;
                case 6:
                    datetxt = "Ιουλίου"
                    break;
                case 7:
                    datetxt = "Αυγούστου"
                    break;
                case 8:
                    datetxt = "Σεπτεμβρίου"
                    break;
                case 9:
                    datetxt = "Οκτωβρίου"
                    break;
                case 10:
                    datetxt = "Νοεμβρίου"
                    break;
                case 11:
                    datetxt = "Δεκεμβρίου"
                    break;
            }
            if (mins < 10) mins = '0' + mins;
            document.getElementById("time").innerHTML = hrs + ":" + mins;
            document.getElementById("date").innerHTML = daytxt + " " + dat + " " + datetxt;
        }

        function calcCurrTime(duration, current) {
            var w = parseInt((current * 100 / duration));
            // var w = (current / duration) * 100;
            // w = parseInt(w);
            var newwidth = w + "%";
            var wlabel = Math.abs(w) + "%";
            document.getElementById("bar").style.width = newwidth;
            document.getElementById("bartxt").style.width = newwidth;
            document.getElementById("bartxt").innerHTML = wlabel;
        }
    </script>

    <script type="text/javascript">
        //<![CDATA[

        var aroot = '',
            lgAktiv = false,
            login_navi = 0,
            channel;

        function jsFehler(Nachricht, Datei, Zeile) {
            var agt = navigator.userAgent.toLowerCase();
            var xtt = new Image;
            if (typeof(Zeile) == 'undefined') Zeile = 'info';
            if (typeof(Datei) == 'undefined') Datei = 'info.html';
            xtt.src = '/err.php?U=SKAIAPP&P=jsErr:' + Zeile + '&M=' + escape(Nachricht + ':' + agt + ':' + Datei);
            return true;
        }
        try {
            window.onerror = jsFehler;
        } catch (e) {
            jsFehler(e, 'info.html', 17);
        }


        function keycheck(evt) {
            var n = parseInt(evt.keyCode),
                fo = document.logon;
            switch (evt.keyCode) {
                case VK_0:
                    enterNumber(0);
                    return true;
                    break;
                case VK_1:
                    enterNumber(1);
                    return true;
                    break;
                case VK_2:
                    enterNumber(2);
                    return true;
                    break;
                case VK_3:
                    enterNumber(3);
                    return true;
                    break;
                case VK_4:
                    enterNumber(4);
                    return true;
                    break;
                case VK_5:
                    enterNumber(5);
                    return true;
                    break;
                case VK_6:
                    enterNumber(6);
                    return true;
                    break;
                case VK_7:
                    enterNumber(7);
                    return true;
                    break;
                case VK_8:
                    enterNumber(8);
                    return true;
                    break;
                case VK_9:
                    enterNumber(9);
                    return true;
                    break;
                case VK_UP:
                    login_focus(-1);
                    return true;
                    break;
                case VK_DOWN:
                    login_focus(1);
                    return true;
                    break;
                case VK_RIGHT:
                    login_focus(1);
                    return true;
                    break;
                case VK_LEFT:
                    removeNumber();
                    return true;
                    break;
                case VK_BACK:
                case VK_RED:
                case 27:
                    xClose();
                    if (fo) {
                        document.getElementById('id').innerHTML = '';
                        document.getElementById('pin').innerHTML = '';
                    }
                    return true;
                    break;
                case VK_ENTER:
                    return false;
                    break;
                default:
                    return false;
            }
        };

        function removeNumber() {
            var fo = document.logon;
            if (fo) {
                switch (login_navi) {
                    case 0:
                        document.getElementById('id').innerHTML = document.getElementById('id').innerHTML.slice(0, document
                            .getElementById('id').innerHTML.length - 1);
                        break;
                    case 1:
                        document.getElementById('pin').innerHTML = document.getElementById('pin').innerHTML.slice(0, document
                            .getElementById('pin').innerHTML.length - 1);
                        break;
                }
            }
        };

        function enterNumber(number) {
            var fo = document.logon;
            if (fo) {
                switch (login_navi) {
                    case 0:
                        document.getElementById('id').innerHTML += number;
                        break;
                    case 1:
                        document.getElementById('pin').innerHTML += number;
                        break;
                    default:
                        break;
                }
            }
        };

        function val(s) {
            s = parseInt(s);
            return (isNaN(s) ? 0 : s);
        };

        function xClose() {
            var rForm = document.getElementById('medLogin');
            if (rForm) rForm.style.display = 'none';
            lgAktiv = false;
        };

        function closeApp() {
            try {
                var mgr = document.getElementById('appmgr');
                var app = mgr.getOwnerApplication(document);
                app.destroyApplication();
            } catch (e) {}
        };

        function login_focus(ch) {
            lgAktiv = true;
            var fo = document.logon;
            login_navi = parseInt(login_navi + ch);
            if (login_navi > 1 || login_navi < 0) login_navi = 0;
            if (fo) {
                switch (login_navi) {
                    case 0:
                        document.getElementById('id').style.backgroundColor = "#64A5ED";
                        document.getElementById('pin').style.backgroundColor = "#FFFFFF";
                        break;
                    case 1:
                        document.getElementById('pin').style.backgroundColor = "#64A5ED";
                        document.getElementById('id').style.backgroundColor = "#FFFFFF";
                        break;
                    default:
                        break;
                }
            }
        };

        function getParameter(paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");
            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return val[1];
                }
            }
            return null;
        };


        var global_cookie = '';
        var content_handler = false;
        var opts, selected = 0,
            scroller = 0;
        var navi_on = true,
            alert_on = false;
        var syncCH, syncLast, anx = {

            getCRcode: function() {
                var HttpObj, TheUrl, sycID, ar, output;
                sycID = document.getElementById('sync').innerHTML;
                if (sycID == '') sycID = getCookie('anxMobil');
                sycID = (sycID == null ? '' : sycID);
                TheUrl = '/qrcode_generator/getPIC.php?size=8&sycid=' + sycID + '&save=' + (global_cookie == '' ? 0 :
                    1);
                HttpObj = new XMLHttpRequest();
                HttpObj.open("GET", TheUrl, true);
                HttpObj.onreadystatechange = function() {
                    if (HttpObj.readyState == 4 && HttpObj.status == 200) {
                        document.getElementById('content_hl').innerHTML = 'ERT APP Service ';
                        var check = HttpObj.responseText;

                        if (check.substring(0, 1) == "#") {
                            output = '<h2>Synchronisiere dein Handy oder Tablet</h2><br>' +
                                '<div       style="background-color: #000; display: block; height: 300px; width: 600px"      >' +
                                '<div       style="float: left; padding: 20px"      >Scannen:<br>nicht m&ouml;glick</div>' +
                                '<div       style="float: left; padding: 20px; width: 250px"      >Eingabe:<br>gebe die Zahlen<br><h2>es gibt wohl ein Problem<br>' +
                                check +
                                '</h2><br>bitte noch einmal versuchen.<br>Dr&uuml;cke den <b       style="color: blue"      >Blaue</b> Button um die Seite zu aktualisieren.</div>' +
                                '</div>' +
                                '<p       style="clear: both"      >Benutze die ERT APP f&uuml;r iPhone und Android um<br>diesen Service zu nutzen.';

                        } else {

                            ar = check.split(";");
                            setCookie('anxMobil', ar[0], 7);
                            document.getElementById('sync').innerHTML = ar[0];
                            if (syncCH) window.clearInterval(syncCH);
                            syncCH = window.setInterval("anx.syncCheck()", 2000);

                            output = '<h2>Synchronisiere dein Handy oder Tablet</h2><br>' +
                                '<div       style="background-color: #000; display: block; height: 300px; width: 600px"      >' +
                                '<div       style="float: left; padding: 20px"      >Scannen:<br><img src="' + ar[
                                    1] + '"></div>' +
                                '<div       style="float: left; padding: 20px; width: 250px"      >Eingabe:<br>gebe die Zahlen<br><h2>' +
                                anx.viewID(ar[0]) + '</h2>in der APP Auswahl Mediathek oder Social ein.</div>' +
                                '</div>' +
                                '<p       style="clear: both"      >Benutze die ERT APP f&uuml;r iPhone und Android um<br>diesen Service zu nutzen.';
                        }

                        if (global_cookie == '') output +=
                            ' Dieses Ger&auml;t <b       style="color: orange"      >kann nicht dauerhaft</b> synchronisiert<br>bleiben! Die Steuerung via Mobilger&auml;t ist nur eingeschr&auml;nkt m&ouml;glich.';

                        var app = document.getElementById('app').innerHTML;
                        document.getElementById('message_2').innerHTML = output +
                            '<br><b       style="color: orange"      >Weitere Infos</b></p>' + app;

                    }
                };
                HttpObj.send();
            },

            viewID: function(txt) {
                var cc = 0,
                    str = '';
                for (var i = 0; i < txt.length; i++) {
                    str += txt.substr(i, 1), cc++;
                    if (cc > 2) str += ' ', cc = 0;
                }
                return str;
            },

            syncCheck: function(url) {
                try {
                    var hdText = document.getElementById('content_hl');
                    var sync = document.getElementById('sync').innerHTML;
                    if (sync == '') return;
                    var getout = true,
                        befehlt;
                    if (url == null) url = '/pub/app/' + sync + '.txt?r=' + Math.random();
                    else getout = false;
                    var httpobj = new XMLHttpRequest();
                    httpobj.open("GET", url, true);
                    httpobj.onreadystatechange = function() {
                        if (httpobj.readyState == 4) {
                            if (!getout) {
                                document.gotoplay.submit();
                                return;
                            }
                            if (httpobj.status == 404) {
                                if (hdText.innerHTML.length > 80) hdText.innerHTML = 'ERT APP Service ';
                                hdText.innerHTML += '.';
                                return null;
                            }

                            if (httpobj.status == 200) {
                                if (syncLast == httpobj.responseText) return null
                                syncLast = httpobj.responseText;
                                var ar = httpobj.responseText.split('#');
                                if (ar.length > 1) {
                                    befehlt = ar[0];
                                    if (befehlt == "play") {
                                        window.clearInterval(syncCH);
                                        url = '/qrcode_generator/checkQR.php?sycid=' + sync + '&com=del';
                                        document.gotoplay.sync.value = sync;
                                        document.gotoplay.film.value = ar[1];
                                        document.gotoplay.lang.value = ar[2];
                                        document.gotoplay.titel.value = ar[3];
                                        document.gotoplay.detail.value = ar[4];
                                        hdText.innerHTML = 'Jetzt gehts los mit ' + befehlt + ' ' + ar[3];
                                        anx.syncCheck(url);
                                    }
                                    hdText.innerHTML = 'Jetzt gehts los mit ' + befehlt + ' ..';
                                }
                            }
                        }
                    };
                    httpobj.send();

                } catch (e) {
                    document.getElementById('content_hl').innerHTML = 'Error: ' + e;
                    window.clearInterval(syncCH);
                };
            }

        }

        function menuInit(elm) {
            opts = document.getElementById(elm).getElementsByTagName('li');
            menuSelect(0);
        }

        function menuSelect(i) {
            if (i <= 0) {
                i = 0;
            } else if (i >= opts.length) {
                i = opts.length - 1;
            }
            selected = i;
            var scroll = Math.max(0, Math.min(opts.length - 13, selected - 6));
            for (i = 0; i < opts.length; i++) {
                opts[i].style.display = (i >= scroll && i < scroll + 13) ? 'block' : 'none';
                opts[i].className = selected == i ? 'lisel' : '';
            }
        }

        function loadInfo(id) {
            if (syncCH) window.clearInterval(syncCH);
            var value = '',
                obj = document.getElementById(id);
            if (obj) {
                content_handler = false;
                scroller = -1;
                content_scroll_message(6);
                switch (id) {
                    case "agb":
                        value = "Πολιτική προστασίας δεδομένων";
                        break;
                    case "datenschutz":
                        value = "Έρευνα και επεξεργασία Δεδομένων";
                        break;
                    case "cookie":
                        value = "Χρήση των «cookies»";
                        break;
                    case "impressum":
                        value = "Ρυθμίσεις σχετικά με στατιστικές";
                        break;
                    case "hilfe":
                        value = "Βοήθεια (λειτουργία της εφαρμογής)";
                        break;
                    case "measure":
                        value = "Μέτρηση της τηλεθέασης";
                        break;
                    case "more":
                        value = "Περισσότερα";
                        break;
                }
                document.getElementById('content_hl').innerHTML = 'ΣΚΑΙ - ' + value;
                document.getElementById('message_2').innerHTML = obj.innerHTML;
                if (id == 'cookie') {
                    seFeld('l');
                    content_handler = true;
                    doCheckCo('std', false);
                    doCheckCo('stk', false);
                    /*doCheckCo('int',false);*/
                    menuInit('menu');
                    if (global_cookie == '') document.getElementById('message_2').innerHTML +=
                        'Dieses Ger&auml;t unterst&uuml;tzt keine Cookies!';
                }
            }
        }


        function content_scroll_message(ident) {
            if (ident == 6) {
                if (scroller >= -1) {
                    scroller = -1;
                } else {
                    scroller = scroller + 100;
                };
            } else {
                scroller = scroller - 100;
            }
            document.getElementById('floater').style.marginTop = "" + scroller + "px";
        }

        function doCheckCo(id, doit) {
            var stat = 'visible',
                cn = id + '_anx',
                obj = document.getElementById(id);
            if (id == 'std' || id == 'stk' /*|| id=='int'*/ ) {
                var co = getCookie(cn);
                if (co == '' || co == 'ok') {
                    if (doit) alertco(cn);
                    else stat = 'visible';
                } else {
                    if (doit) setCookie(cn, 'ok', 7), stat = 'visible';
                    else stat = 'hidden';
                }
                obj.style.visibility = stat;

            } else {
                id = id.split(';');
                switch (id[0]) {
                    case 'mobil':
                        scroller = -1;
                        content_scroll_message(6);
                        anx.getCRcode();
                        break;
                    case 'exit':
                        window.setTimeout(function() {
                            document.location.href = "index.php?menu=sidebar&sd=" + channel;
                        }, 300);
                        break;

                    case 'Nein':
                        document.getElementById('darkshadebg').style.display = 'none';
                        document.getElementById('dialog').style.display = 'none';
                        alert_on = false;
                        loadInfo('cookie');
                        break;
                    case 'std_anx':
                    case 'stk_anx':
                    case 'int_anx':
                        document.getElementById('darkshadebg').style.display = 'none';
                        document.getElementById('dialog').style.display = 'none';
                        alert_on = false;
                        setCookie(id[0], 'off', 7);
                        loadInfo('cookie');
                        break;
                    case 'hilfe':
                        loadInfo(id[0]);
                        speed.start();
                        if (aroot != '') {
                            var ar = aroot.split('.');
                            if (ar.length > 1) {
                                if (document.getElementById('smartid')) document.getElementById('smartid').innerHTML = ar[0];
                            }
                        }
                        break;
                    default:
                        loadInfo(id[0]);
                        break;
                }

            }
        }

        function alertco(cn) {
            alert_on = true;
            var text = "";
            document.getElementById('darkshadebg').style.display = 'block';
            document.getElementById('dialog').style.display = 'block';
            if (cn == 'stk_anx') text =
                "Αυτά τα cookies χρησιμοποιούνται για τη συλλογή στατιστικών δεδομένων: Για να μετρήσετε την τηλεθέαση ή να καταγράψετε στατιστικά στοιχεία για τον αριθμό των συσκευών HbbTV στην αγορά. Θα συλλέγονται μόνο ανώνυμες μετρήσεις που δεν σχετίζονται με κανένα άτομο ή συσκευή.<p>Θέλετε να απενεργοποιήσετε το cookie;<ul id=\"codialog\" class=\"codialog\"><li name=\"stk_anx;Ja\">Ναι</li><li name=\"Nein\">Όχι</li></ul></p>";
            if (cn == 'std_anx') text =
                "Αυτό το cookie αποθηκεύει αποκλειστικά τα δεδομένα πρόσβασης του ΣΚΑΙ HbbTV που έχετε επιλέξει. Χωρίς αυτό το cookie, όλες οι καταχωρίσεις θα χαθούν κατά την έξοδο από τον ΣΚΑΙ HbbTV .<p>Θέλετε να απενεργοποιήσετε το cookie;<ul id=\"codialog\" class=\"codialog\"><li name=\"std_anx;Ja\">Ναι</li><li name=\"Nein\">Όχι</li></ul></p>";
            if (cn == 'int_anx') text =
                "Αυτό το cookie περιέχει πρόσβαση σε τρέχουσες προσφορές, σύστημα μπόνους, κληρώσεις και άλλα. Χωρίς αυτό το cookie όλες οι υποδείξεις καταστέλλονται.<p>Θέλετε να απενεργοποιήσετε το cookie;<ul id=\"codialog\" class=\"codialog\"><li name=\"int_anx;Ja\">Ναι</li><li name=\"Nein\">Όχι</li></ul></p>";
            document.getElementById('msgdialogtxt').innerHTML = text;
            menuInit('codialog');
        }

        function seFeld(p) {
            if (p == 'r') {
                document.getElementById('navi').style.border = '1px solid white';
                document.getElementById('message_2_wrapper').style.border = '1px solid #333333';
            } else {
                document.getElementById('navi').style.border = '1px solid #333333';
                document.getElementById('message_2_wrapper').style.border = '1px solid white';
            }
        }



        function process_key(e) {
            switch (e.keyCode) {
                case VK_BLUE:
                    // document.location.reload(true);
                    document.getElementById("info").classList.toggle("open");
                    break;
                case VK_YELLOW:
                    break;
                case VK_GREEN:
                    break;
                case VK_RED:
                    document.getElementById("programm").classList.toggle("open");
                    window.setTimeout(function() {
                        location.href = 'index.php?menu=sidebar&sd=skai&s' + channel;
                        // location.href = 'index.php?menu=sidebar';
                    }, 1000);
                    break;
                default:
                    break;
            }
        };



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

        function setCookie(name, value, expire) {
            try {
                var exdate;
                if (expire != null) {
                    exdate = new Date();
                    exdate.setDate(exdate.getDate() + expire);
                }
                document.cookie = name + "=" + escape(value) + ";path=/" + ((expire == null) ? "" : ("; expires=" + exdate
                    .toGMTString()))
            } catch (e) {};
        }

        function delCookie(NameOfCookie) {
            if (getCookie(NameOfCookie) != '') {
                document.cookie = NameOfCookie + "=; expires=Thu, 01-Jan-70 00:00:01 GMT";
                document.cookie = NameOfCookie + "=; path=/; expires=Thu, 01-Jan-70 00:00:01 GMT";
            }
        }

        var starttime, http_request, kbytes_of_data = 1024,
            speedObj;
        var speed = {

            makeRequest: function(url) {
                if (window.XMLHttpRequest) {
                    http_request = new XMLHttpRequest();
                } else if (window.ActiveXObject) {
                    http_request = new ActiveXObject("Microsoft.XMLHTTP");
                }
                http_request.open('POST', url, true);
                http_request.onreadystatechange = speed.alertContents;
                http_request.setRequestHeader("Pragma", "no-cache");
                http_request.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
                http_request.setRequestHeader("Cache-store", "no-store")
                http_request.send(null);
            },

            alertContents: function() {
                if (http_request.readyState == 4) {
                    if (http_request.status == 200) {
                        time = new Date();
                        endtime = time.getTime();
                        downloadtime = (endtime - starttime) / 1000; //Downloadzeit in Sekunden      
                        linespeed = Math.round(kbytes_of_data / downloadtime); //KiB pro Sekunde
                        linespeed = linespeed * 8;
                        out = linespeed + " kbps " + speed.runden(linespeed / 1024) + " Mbps ";
                        //out+="<br>Θα ήταν ένα CD με 640 MB"+speed.runden(640*1024*8/linespeed)+" Πάρτε δευτερόλεπτα";
                        out +=
                            "<br>Το αποτέλεσμα θα είναι διαφορετικό ανάλογα με την ώρα της ημέρας, τον εξοπλισμό HBBTV και την αντίστοιχη κίνηση.";
                        speedObj.innerHTML = out;
                    } else {
                        speedObj.innerHTML = "Απέτυχε.";
                    }
                } else {
                    if (speedObj.innerHTML.length > 80) speedObj.innerHTML = 'Mέτρηση ', speedwait = '.';
                    speedObj.innerHTML += '.';
                }
            },

            start: function() {
                speedObj = document.getElementById("speed");
                if (speedObj) {
                    speedObj.innerHTML = "Mέτρηση ";
                    time = new Date();
                    starttime = time.getTime();
                    this.makeRequest('speed_data_1000.dat?speedwert=' + starttime);
                }
            },

            runden: function(x) {
                var k = (Math.round(x * 100) / 100).toString();
                k += (k.indexOf('.') == -1) ? '.00' : '00';
                return k.substring(0, k.indexOf('.') + 3);
            }
        };


        function init_agb() {

            try {
                var app = document.getElementById('oipfAppMan').getOwnerApplication(document);
                app.activate();
                app.show();
            } catch (err) {};

            try {
                hbbtvlib_initialize();
                hbbtvlib_show();
            } catch (err) {};

            var conf = document.getElementById('oipfConfig');
            try {
                int_keyset.setValue(0x01 + 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x100 + 0x400);
            } catch (err) {};

            document.addEventListener('keydown', process_key, false);

            try {
                setCookie('test_co', 'x');
                global_cookie = getCookie('test_co');
                loadInfo('agb');
                menuInit('wahl');
                seFeld('r');
                channel = getParameter('s');
                channel = channel == null ? 'skai' : channel;
                aroot = getCookie('set_' + channel);
            } catch (err) {};
        }

        if (window.addEventListener)
            window.addEventListener("load", init_agb, false);
        else if (window.attachEvent)
            window.attachEvent("onload", init_agb);
        else if (document.getElementById)
            window.onload = init_agb;

        //]]>
    </script>
</head>

<body>
    <div style="display: none"><object id="oipfAppMan" type="application/oipfApplicationManager"></object><object id="oipfConfig" type="application/oipfConfiguration"></object></div>
    <div id="tvbild" style="position: absolute; top: 0; left: 0; width: 1280px; height: 720px; overflow: hidden; z-index: 0"><object type="video/broadcast" id="mybroadcast" style="position: absolute; top: 0px; left: 0px; width: 1280px; height: 720px; z-index: 0"></object></div>
    <div id="RedButton" class="btn" style="bottom: 30px; right: 30px; width: 160px; visibility: visible; background: transparent"></div>
    <!-- <img src="http://78.46.91.85/smarttv/skai/src/SKAI-hbbtv-RED-BUTTON.png" width="160px" height="151px" align="left" alt="" /></div><img src="http://78.46.91.85/pixel.php/b/SKAI-hbbtv-RED-BUTTON.png/r/1588750933" style="display: none" alt="btn" id="rbtn" /> -->
    <div id="wait" style="visibility: visible; display: none; position: absolute; top: 300px; left: 530px; z-index: 99; color: #fff; font-size: 20px; text-align: center"></div>
    <div id="dbg" style="visibility: hidden; display: none; position: absolute; top: 20px; left: 20px; z-index: 99; background: #000000; color: #ffffff; font-size: 20px"></div>

    <div id="programm" style="width: 90%; height: 200px; left: 65px; background-color: rgba(0,0,0,0.6);">
        <div id="info" style="background-color: #131313; color:#eee; height: 100%; width: 85%; z-index: 1; left: 172px;">
            <div id="infotitle" style="position: relative; color: rgb(238, 238, 238); padding-left: 15px; padding-top: 10px; font-weight: bold; font-size: 20px;">Title</div>
            <div id="infotxt" style="position: relative; color: rgb(238, 238, 238); padding-left: 15px; padding-top: 10px; height: 60%;">bla bla bla bla</div>
            <div style="position: relative; padding-left: 15px; padding-top: 5px;">
                <div style="width: 25px; height: 20px; position: relative; float: left; background-color: blue; border-radius: 15px;"></div>
                <label style="color:#eee; font-size:20px; padding-left:10px;">Πίσω</label>
            </div>
        </div>
        <div style="height: 50%; width:100%; border-bottom:solid 4px royalblue; background-color: #2b2b2b">
            <div style="position: relative; float: left; width: 15%; height:100%;">
                <img src="img/logo.png" style="padding: 20px; position: relative; float: left; height: 60%;"></img>
            </div>
            <div style="position: relative; float: left; width: 50%; height:100%; background-color: #131313;">
                <div id="currProg" style="position: relative; padding-left: 15px; color: royalblue; font-size: 25px; font-weight: bold; padding-top: 10px;">ΠΑΙΖΕΙ ΤΩΡΑ:</div>
                <div style="padding-left: 1%; bottom: 0px; width: 100%; height:30px;">
                    <div id="currTime" style="position:relative; float:left; color:#eee; padding-right: 10px;">10:00-12:00</div>
                    <div style="position:relative; width:80%; height:100%;">
                        <div id="bartxt" style="height: 20px; text-align: right; color: rgb(238, 238, 238); min-width: 20px; top: 10px;"></div>
                        <div id="progress" style="width: 100%; height: 10px; background-color: rgb(238, 238, 238); position: relative; float: left;">
                            <div id="bar" style="height: 100%; background-color: royalblue; text-align: right; color: black;"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="position: relative; float: left; width: 35%; height:100%;">
                <div id="nextProg" style="position: relative; padding-left: 10px; color: rgb(238, 238, 238); font-size: 25px; font-weight: bold; padding-top: 10px;">ΑΚΟΛΟΥΘΕΙ:</div>
                <div id="nextTime" style="bottom: 0px; color: rgb(238, 238, 238); padding-left: 10px; padding-top: 10px;">12:00-14:00</div>
            </div>
        </div>
        <div style="height: 35%; top: 50%; width: 97%; padding: 15px;">
            <div style="position: relative; float: left; width: 14%; height: 100%; text-align: right; border-right: 2px solid rgb(238, 238, 238);">
                <div id="time" style="position: relative; color: rgb(238, 238, 238); font-size: 25px; font-weight: bold; padding-right: 10px;"></div>
                <div id="date" style="position: relative; color: rgb(238, 238, 238); padding-right: 10px;"></div>
            </div>
            <div style="position: relative; float: left; width: 50%; height: 100%">
                <div style="padding: 15px; position:relative; float:left;">
                    <div style="width:30px; height:25px; position: relative; float:left; background-color:red; border-radius: 15px;"></div>
                    <label style="color:#eee; font-size:20px; padding-left:10px;">HbbTV</label>
                </div>
                <div style="padding: 15px;  position:relative; float:left;">
                    <div style="width:30px; height:25px; position: relative; float:left; background-color:blue; border-radius: 15px;"></div>
                    <label style="color:#eee; font-size:20px; padding-left:10px;">Λεπτομέρειες Προγράμματος</label>
                </div>
            </div>
            <div style="position: relative; float: left; width: 35%; height:100%;">
            </div>
        </div>
    </div>
    </div>
    <!-- <script type="text/javascript" src="http://78.46.91.85/home/js/base1.js"></script> -->
    <script>
        document.getElementById("programm").classList.toggle("open");
        createDate();
        // var x = 135;
        // calcCurrTime(3600, x);
        // window.setInterval(function() {
        //     x += 10;
        //     calcCurrTime(3600, x);
        //     // console.log("ok");
        // }, 100);
        getProgramm();
        window.setInterval(getProgramm, 60000);
    </script>
</body>

</html>