/**
 * User object constructor. It creates the user signin/signup interface
 * @class User
 * @param {string} idnam is the name identifier of the object 
 */
var config = null, sceneid = '', email='';
function User(idnam) {
	this.idnam = idnam;
	this.focusedId = 1;
	this.foc = 1; // for buttons
	sceneid = idnam;
}
User.prototype = new BaseObject();
/**
 * User initialization
 * @memberof User
 * @param {string} parent is the parent DOM element
 * @param {number} xpos is the x position of container
 * @param {number} ypos is the y position of container
 */
User.prototype.init = function (parent, xpos, ypos) {
	//document.getElementById("log-message").style.display = "none";
	document.getElementsByClassName("basic-menu-container")[0].style.display = "none";
	document.getElementsByClassName("top-container")[0].style.display = "none";
	var e = createClassDiv("", "", "user-popup");
	parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
	this.parent = parent;
	debug(this.idnam);

	var div = createClassDiv("", "", "user-div");
	this.elem.appendChild(div);
	var msg = createClassDiv(475, 40, "user-msg");
	this.msg = msg;
	this.elem.appendChild(msg);

	if (this.idnam == 'login') {
		
		var cont = createClassDiv("", "", "user-container");
		this.elem.appendChild(cont);

		var bol = createClassDiv("", "", "user-bold");
		bol.innerHTML = 'Είστε ένα βήμα από την ολοκλήρωση της εγγραφής';
		if(this.receivedCode){
			bol.style.textAlign = "center";
			bol.innerHTML = "Παρακαλώ εισάγετε τον αριθμό κινητού τηλεφώνου σας για να στείλουμε κωδικό μίας χρήσης";
			cont.appendChild(bol);
			
			var ucode = new UserInput("phone-input", "Αριθμός Κινητού");
			if(this.receivedCode) ucode.msemail = 1;
			ucode.init(this.elem, 74, 314, 0);
			this.buttons.push(ucode);

			var next = new UserButton("sms-button", "Αποστολή SMS");
			next.init(this.elem, 590, 476);
			addClass(next.elem,"next");
			this.buttons.push(next);

			this.activeObj = 0;
			this.inputs = 1;

			var k = new UserKeyboard("sms-keyboard", 0, 3);
			k.init(this.elem, 0, 0);
		}
		else {
			cont.appendChild(bol);
			var des = createClassDiv("", "", "user-descr");
			des.innerHTML = 'Σας στείλαμε στο email που μας δηλώσατε ένα κωδικό μιας χρήσης (OTP). Περάστε τον στο ακόλουθο πεδίο και τελειώσατε!';
		
			cont.appendChild(des);

		
			var des1 = createClassDiv("", "", "user-descr1");
			des1.innerHTML = 'Σε περίπτωση που δεν βρίσκετε το email, παρακαλώ ελέγξτε και τον φάκελο ανεπιθύμητης αλληλογραφίας (Junk).';
			cont.appendChild(des1);

			var ucode = new UserInput("code-input", "Κωδικός");
			if(this.receivedCode) ucode.msemail = 1;
			ucode.init(this.elem, 74, 314, 0);
			this.buttons.push(ucode);

			var next = new UserButton("login-button", "Είσοδος");
			next.init(this.elem, 590, 476);
			addClass(next.elem,"next");
			this.buttons.push(next);

			this.code = ucode;
			this.activeObj = 0;
			this.inputs = 1;

			var k = new UserKeyboard("login-keyboard", 0, 3);
			k.init(this.elem, 0, 0);
		}
		
	} else if (this.idnam == 'logged') {
		var cont = createClassDiv("", "", "user-container");
		this.elem.appendChild(cont);

		var bol = createClassDiv("", "", "user-bold");
		bol.innerHTML = 'Έχετε συνδεθεί με επιτυχία!';
		cont.appendChild(bol);

		var des = createClassDiv("", "", "user-descr");
		des.innerHTML = 'Το Big Brother, το απόλυτο  ριάλιτι της παγκόσμιας τηλεόρασης, είναι στον ΣΚΑΪ και είναι απρόβλεπτο! Παρουσιάζει ο  Πέτρος Λαγούτης.';
		cont.appendChild(des);

		var bb = new UserButton("bb-button", "Big Brother Live");
		bb.init(this.elem, 145, 350);
		this.buttons.push(bb);

		var ba = new UserButton("ba-button", "Επιστροφή στην αρχική");
		ba.init(this.elem, 516, 350);
		this.buttons.push(ba);

		var xx = new UserButton("xx-button", "Έξοδος/Logout");
		xx.init(this.elem, 900, 350);
		this.buttons.push(xx);
	} else {
		var email = new UserInput("email-input", "Γράψτε το Email σας");
		email.init(this.elem, 74, 90, 0);
		var em = getCookie('email');
		if (em.length)
			email.setText(em);
		this.buttons.push(email);

		var not = createClassDiv(630, 480, "extra-term");
		not.innerHTML = 'Το πρόγραμμα ενδέχεται να περιέχει ακατάλληλη φρασεολογία.';
		this.not = not;
		this.elem.appendChild(not);

		var userText = new UserText("user-text");
		userText.init(this.elem, 630, 150, 1);
		this.buttons.push(userText);


		var check = new UserCheck("signup-check", "Είμαι άνω των 16 ετών και συναινώ στους όρους χρήσης του ιστότοπου");
		check.init(this.elem, 832, 542, 2);
		this.buttons.push(check);

		this.activeObj = 1;
		this.inputs = 3;

		var next = new UserButton("next-button", "Εγγραφή / Είσοδος");

		if (this.idnam == 'signup') {
			next.init(this.elem, 865, 615);
			addClass(next.elem,"next");
			this.buttons.push(next);
		}

		var k = new UserKeyboard("login-keyboard", 0, 3);
		k.init(this.elem, 0, 0);
	}
	if(this.buttons[this.focusedId])
		this.setFocused(this.buttons[this.focusedId], true);
	if (this.idnam == 'logged') {
		setTimeout(function(){
			GLOBALS.focusmgr.focusObject('bb-button');
		}, 300);
	}
}
function UserPopup(idnam){
	this.idnam = idnam;
}
UserPopup.prototype = new BaseObject();
UserPopup.prototype.init = function (parent, xpos, ypos) {
	this.elem = createClassDiv("","","user-error-popup");
	this.parent = parent;
	this.baseInit(this.elem);
	this.register();
	this.elem.innerHTML = "Δεν είναι προσωρινά δυνατή η αποστολή email σε διευθύνσεις hotmail, outlook, live<br/>Παρακαλώ σκανάρετε με το κινητό σας τηλέφωνο το παρακάτω QR Code<br/><div id='qrimg'></div>";
	parent.appendChild(this.elem);
}
function makeqr(email, parent) {
    if(email=="") return true;
    var query="https://skai.smart-tv-data.com/u-phone.php?email="+email;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.videourl.de/qr-img.php?str="+encodeURIComponent(query)+"&si=5", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
        	//var p = new UserPopup("user-popup");
			//p.init(parent, "","");
            document.getElementById("qrimg").innerHTML=xhr.responseText; 
        }
    };
    xhr.send();
}
User.prototype.setFocused = function (otherobj, focus) {
	if(!this.buttons[this.focusedId]) return;
	if (focus) addClass(this.buttons[this.focusedId].elem,"active");
	else removeClass(this.buttons[this.focusedId].elem,"active");
}
User.prototype.handleKeyPress = function (keyCode) {
	switch (keyCode) {
		case VK_UP:
			this.focusedId--;
			if (this.focusedId < 2) {
				this.focusedId = 2;
				break;
			}
			removeClass(this.buttons[this.focusedId+1].elem,"active");
			this.setFocused(this.idnam, true);
			break;
		case VK_DOWN:
			this.focusedId++;
			if (this.focusedId > this.buttons.length - 1) {
				this.focusedId = this.buttons.length - 1;
				break;
			}
			removeClass(this.buttons[this.focusedId-1].elem,"active");
			this.setFocused(this.idnam, true);
			break;
		case VK_BACK:
			var popup = GLOBALS.focusmgr.getObject('user-popup');
			if(popup){
				popup.elem.remove();
				popup.unregister();
			}
			clearInterval(this.codeTimer);
			GLOBALS.focusmgr.getObject(sceneid).unregister();
			GLOBALS.scenemgr.sidemenu.show();
			GLOBALS.scenemgr.removeLastScene();
			GLOBALS.scenemgr.showLastScene();
			break;
		case VK_ENTER:
			this.code.innerHTML = '';
			clearInterval(this.codeTimer);

			if (this.focusedId == 0) {
				// generate new code
				this.generateCode();
			} else if (this.focusedId == 2) {
				GLOBALS.focusmgr.getObject(sceneid).unregister();
				GLOBALS.scenemgr.removeLastScene();
				var u = new User('signup');
				GLOBALS.scenemgr.addScene(u);
				GLOBALS.scenemgr.showCurrentScene("")
				GLOBALS.scenemgr.details.hide();
				if (GLOBALS.focusmgr.getObject("keyboard_numbers"))
					GLOBALS.focusmgr.focusObject("keyboard_numbers", true);
			} else {
				GLOBALS.focusmgr.getObject(sceneid).unregister();
				GLOBALS.scenemgr.removeLastScene();
				var u = new User('login');
				GLOBALS.scenemgr.addScene(u);
				GLOBALS.scenemgr.showCurrentScene("")
				GLOBALS.scenemgr.details.hide();
				if (GLOBALS.focusmgr.getObject("keyboard_en_sm"))
					GLOBALS.focusmgr.focusObject("keyboard_en_sm", true);
			}

	}
}

/**
 * This object creates the input area that user fills
 * @class UserInput
 * @instance
 * @param {string} idnam is the id name identificator of the object
 */
function UserInput(idnam, text) {
	this.idnam = idnam;
	this.inputText = text;
	this.letterUpperLimit = 2;
	this.firstTime = true;
	this.type = 'input';
}
UserInput.prototype = new BaseObject();
/**
 * Search input object initialization
 * @memberof UserInput
 * @instance
 * @param {string} parent is the parent DOM element
 * @param {number} xpos is the x position of container
 * @param {number} ypos is the y position of container
 */
UserInput.prototype.init = function (parent, xpos, ypos, pos) {
	this.parent = parent;
	var me = this;
	var e = createClassDiv(130, 144, "user-input");
	e.id = this.idnam;

	if (ypos)
		e.style.top = ypos+'px';
	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	this.label = createClassDiv(0, 10, "input-label");
	this.label.innerHTML = this.inputText;

	this.inputDiv = createClassDiv(0, 13, "input-div");
	/*if (pos == 0) {
		setTimeout(function(){
			addClass(me.elem,'active');
		}, 600);
	}*/

	this.elem.appendChild(this.label);
	this.elem.appendChild(this.inputDiv);
	//this.setText(this.inputText);
}
/**
 * focus function
 * @memberof UserInput
 * @instance
 * @param {string} otherobj the objects idnam
 * @param {boolean} focus the focus action state
 */
UserInput.prototype.setFocused = function (otherobj, focus) {
	if (focus) addClass(this.inputDiv,"focused");
	else removeClass(this.inputDiv,"focused");
}
/**
 * show text in object function
 * @memberof UserInput
 * @instance
 * @param {string} text the text to be used
 */
UserInput.prototype.setText = function (text) {
	if(this.idnam == "pass-input")
		this.elem.getElementsByClassName("input-div")[0].innerHTML = Array(text.length).join("*")+(text.length>0?text.charAt(text.length-1)+"_":"");
	else
		this.elem.getElementsByClassName("input-div")[0].innerHTML = text+(text.length>0?"_":"");
	this.inputText = text;
	if(this.inputText != ""){
		this.label.style.display = "none";
	}else 
		this.label.style.display = "block";
}
/**
 * append character into string function
 * @memberof UserInput
 * @instance
 * @param {string} character the character to be used
 */
UserInput.prototype.appendText = function (character) {
	if (this.firstTime == true) {
		this.inputText = "";
		this.firstTime = false;
		this.setText(this.inputText);
	}
	
	this.inputText += character;	
	this.setText(this.inputText);
}
/**
 * delete latest character from string function
 * @memberof UserInput
 * @instance
 */
UserInput.prototype.deleteChar = function () {
	if (this.firstTime == true) {
		this.inputText = "";
		this.firstTime = false;
		this.setText(this.inputText);
		return;
	}
	if(this.inputText.charAt(this.inputText.length -1) == ";")
		this.inputText = this.inputText.substring(0, this.inputText.lastIndexOf("&"));
	else
		this.inputText = this.inputText.substring(0, this.inputText.length - 1);
	this.setText(this.inputText);
}
/**
 * delete all characters from string function
 * @memberof UserInput
 * @instance
 */
UserInput.prototype.deleteAll = function () {
	this.inputText = this.inputText.substring(0, 0);
	this.setText(this.inputText);
}
UserInput.prototype.signup = function () {
	var l = GLOBALS.focusmgr.getObject("signup"), me = this;
	email = l.buttons[0].inputText;
	setCookie('email', email, 365*10);
	if (1 && location.host == "127.0.0.1") {
		email = 'hatdio@gmail.com';
		email = 'd.chatzidakis@anixa.gr';
		email = 'jgk1990@hotmail.com';
	}
	setCookie('email', email);
	if (!GLOBALS.focusmgr.getObject('signup-check').checked) {
		showMsg('Θα πρέπει να είστε άνω των 16 χρονών');
		return;
	}
	if (!validateEmail(email)) {
		showMsg('To email που δώσατε δεν είναι έγκυρο');
		return;
	}
	var url = 'u-login.php?action=signup&email='+email +'&smid='+ GLOBALS.smid;
	if (GLOBALS.dev)
		url = 'http://skai.smart-tv-data.com/u-login.php?action=signup&email='+email +'&smid='+ GLOBALS.smid;
	this.email = email;
	this.req = createHttpRequest(url, function(res) {
		me.req = null;
		var j = parseJSON(res);

		if (j.success == true) {
			GLOBALS.scenemgr.goBack();

			var e = new User("login");
			e.email = me.email;
			if(j.code && me.email.indexOf("@hotmail.")!=-1 || me.email.indexOf("@outlook.")!=-1 || me.email.indexOf("@live.")!=-1 || me.email.indexOf("@msn.")!=-1 || me.email.indexOf("@windowslive.")!=-1) {
				e.receivedCode = j.code;
			}
			GLOBALS.scenemgr.addScene(e);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = GLOBALS.focusmgr.getObject("login");
			
			GLOBALS.focusmgr.getObject("login-keyboard").switchKeyboard("keyboard_numbers");
			if (GLOBALS.focusmgr.getObject("keyboard_numbers"))
				GLOBALS.focusmgr.focusObject("keyboard_numbers", true);
		} else if (j.success == false) {
			showMsg('Λάθος email');
		}
	})
}
UserInput.prototype.sendSMS = function() {
	debug("sending SMS >> start");
	var l = GLOBALS.focusmgr.getObject("login"), me = this;
	var phone = l.buttons[0].inputText;
	if (!phone.match(/^00\d{8,15}$/) && !phone.match(/^69\d{8}$/)) {
    	showMsg('Παρακαλώ εισάγετε έγκυρο αριθμό τηλεφώνου');
    	return;
	}
	debug("sending SMS >> number sanitized");
	var url = 'u-sms.php?phone='+phone+'&email='+encodeURIComponent(l.email);
	if (GLOBALS.dev)
		url = 'http://skai.smart-tv-data.com/u-sms.php?phone='+phone+'&email='+encodeURIComponent(l.email);
	l.phone = phone;
	this.req = createHttpRequest(url, function(res) {
		debug("sending SMS >> request made");
		me.req = null;
		var j = parseJSON(res);
		debug("sending SMS >> json parsed "+res);
		if(j.success){
			debug("sending SMS >> request success");
			GLOBALS.scenemgr.goBack();

			var e = new User("login");
			e.email = l.email;
			e.phone = l.phone;
			GLOBALS.scenemgr.addScene(e);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = GLOBALS.focusmgr.getObject("login");
			
			GLOBALS.focusmgr.getObject("login-keyboard").switchKeyboard("keyboard_numbers");
			if (GLOBALS.focusmgr.getObject("keyboard_numbers"))
				GLOBALS.focusmgr.focusObject("keyboard_numbers", true);
			
		}else{
			debug("sending SMS >> request failed");
			showMsg("Η αποστολή SMS απέτυχε. Παρακαλώ δοκιμάστε αργότερα");
		}


	});

}
UserInput.prototype.login = function () {
	var l = GLOBALS.focusmgr.getObject("login"), me = this;
	var code = l.buttons[0].inputText;
	if (!email.length)
		email = getCookie('email');
	if (0 && GLOBALS.dev) {
		email = 'hatdio@gmail.com';
	}
	if (!code || code.length < 6 || code == 'Κωδικός') {
		showMsg('Ο κωδικός πρέπει να είναι 6 νούμερα');
		return;
	}

	var url = 'u-login.php?action=auth&email='+email +'&code='+code+(l.phone?"&phone="+l.phone:"");
	if (GLOBALS.dev)
		url = 'http://skai.smart-tv-data.com/u-login.php?action=auth&email='+email +'&code='+code+(l.phone?"&phone="+l.phone:"");

	this.req = createHttpRequest(url, function(res) {
		me.req = null;
		var j = parseJSON(res);

		if (j && j.user_id) {
			var el = GLOBALS.scenemgr.sidemenu.skaiMObj.loginitem;
			el.innerHTML = 'Big Brother';
			GLOBALS.userEmail = email;
			GLOBALS.userId = j.user_id;
			var popup = GLOBALS.focusmgr.getObject('user-popup');
			if(popup){
				popup.elem.remove();
				popup.unregister();
			}
			
			setCookie('user_id', j.user_id, 365*10);

			GLOBALS.scenemgr.goBack();
			var e = new User("logged");
			GLOBALS.scenemgr.addScene(e);
			GLOBALS.scenemgr.showCurrentScene("");
			activeCont = GLOBALS.focusmgr.getObject("logged");
		} else if (j.success == false) {
			showMsg('Λάθος κωδικός');
		}
	})
}

/**
 * user input key handle function
 * @memberof UserInput
 * @instance
 * @param {number} keyCode the pressedkey's code
 */
UserInput.prototype.handleKeyPress = function (keyCode) {
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
		case VK_BACK:
			//clearInterval(GLOBALS.focusmgr.getObject('login-code').codeTimer);
			var popup = GLOBALS.focusmgr.getObject('user-popup');
			if(popup){
				popup.elem.remove();
				popup.unregister();
			}
			GLOBALS.scenemgr.goBack();
			GLOBALS.scenemgr.sidemenu.show();
			break;
		case VK_RIGHT:
			var obj = GLOBALS.focusmgr.getObject("login-keyboard");
			GLOBALS.focusmgr.focusObject("keyboard_numbers");
			break;
		case VK_DOWN:
			var obj, focused = 0;
			if ((obj = GLOBALS.focusmgr.getObject("login")) || (obj = GLOBALS.focusmgr.getObject("signup"))) {
				obj.activeObj++;

				if (obj.activeObj > obj.inputs) {
					obj.activeObj = obj.inputs;
					break;
				}

				var o = obj.buttons[obj.activeObj].idnam;
				var p = obj.buttons[obj.activeObj-1].idnam;
				if(obj.activeObj == obj.inputs)
					GLOBALS.focusmgr.focusObject(o);
				addClass(GLOBALS.focusmgr.getObject(o).elem,'active');
				removeClass(GLOBALS.focusmgr.getObject(p).elem,'active');
				GLOBALS.focusmgr.focusObject(obj.buttons[obj.activeObj].idnam);
			}
			break;
		case VK_UP:
			var obj;
			if ((obj = GLOBALS.focusmgr.getObject("login")) || (obj = GLOBALS.focusmgr.getObject("signup"))) {
				obj.activeObj--;
				if (obj.activeObj < 0)
					obj.activeObj = 0;
				var o = obj.buttons[obj.activeObj].idnam;
				var p = obj.buttons[obj.activeObj+1].idnam;
				GLOBALS.focusmgr.focusObject(o);
				addClass(GLOBALS.focusmgr.getObject(o).elem,'active');
				removeClass(GLOBALS.focusmgr.getObject(p).elem,'active');
			}
			break;
		case VK_ENTER:
			if (this.idnam == 'email-input')
				this.signup();
			else
				this.login();
			break;
		default:
			break;
	}
}
/**
 * This object creates the buttons for login and toggle to signup
 * @class UserButton
 * @instance
 * @param {string} idnam is the id name identificator of the object
 */
function UserButton(idnam, text) {
	this.idnam = idnam;
	this.text = text;
	this.type = 'button';
	this.waitForKey=0;
}
UserButton.prototype = new BaseObject();
/**
 * Search input object initialization
 * @memberof UserButton
 * @instance
 * @param {string} parent is the parent DOM element
 * @param {number} xpos is the x position of container
 * @param {number} ypos is the y position of container
 */
UserButton.prototype.init = function (parent, xpos, ypos) {
	this.parent = parent;
	var e = createClassDiv("", "", "user-button");

	if (ypos)
		e.style.top = ypos+'px';
	if (xpos)
		e.style.left = xpos+'px';
	e.innerHTML = this.text;

	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
}
/**
 * focus function
 * @memberof UserButton
 * @instance
 * @param {string} otherobj the objects idnam
 * @param {boolean} focus the focus action state
 */
UserButton.prototype.setFocused = function (otherobj, focus) {
	if (focus) {
		addClass(this.elem,"focused");
		this.elem.firstChild.src = "img/login_foc.png";
	}
	else {
		removeClass(this.elem,"focused");
		this.elem.firstChild.src = "img/login.png";
	}
}
/**
 * user input key handle function
 * @memberof UserButton
 * @instance
 * @param {number} keyCode the pressedkey's code
 */
UserButton.prototype.handleKeyPress = function (keyCode) {
	var login = GLOBALS.focusmgr.getObject("signup");
	if (typeof login == 'undefined')
		login = GLOBALS.focusmgr.getObject("login");
	if (typeof login == 'undefined')
		login = GLOBALS.focusmgr.getObject("logged");
	if (typeof login == 'undefined')
		return;

	if (this.waitForKey) {
		var item = GLOBALS.item;
		document.getElementById('bb-card').style.display='none';
		this.waitForKey=0;
		moves(item.show_title +'/'+ item.title);
		GLOBALS.scenemgr.initVPlayerSession(item.title, item.url, item.category, 0, item.thumb, null);
		GLOBALS.lbannerTimer = setInterval( function() { lbanner(item.category); }, 4 * 60 * 1000);
		return;
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
		case VK_LEFT:
			if (this.idnam == 'code-button')
				GLOBALS.focusmgr.focusObject("next-button", true);
			else if (this.idnam == 'xx-button')
				GLOBALS.focusmgr.focusObject("ba-button", true);
			else if (this.idnam == 'ba-button')
				GLOBALS.focusmgr.focusObject("bb-button", true);
			else if (this.idnam != 'next-button')
				GLOBALS.focusmgr.focusObject("keyboard_numbers");
			break;
		case VK_BACK:
			var popup = GLOBALS.focusmgr.getObject('user-popup');
			if(popup){
				popup.elem.remove();
				popup.unregister();
			}
			GLOBALS.scenemgr.sidemenu.show();
			GLOBALS.scenemgr.goBack();
			break;
		case VK_RIGHT:
			if (this.idnam == 'bb-button') {
				GLOBALS.focusmgr.focusObject("ba-button", true);
				break;
			} else if (this.idnam == 'ba-button') {
				GLOBALS.focusmgr.focusObject("xx-button", true);
				break;
			}
			
			/*var obj = GLOBALS.focusmgr.getObject("login-keyboard");
			if (typeof obj != 'undefined')
				GLOBALS.focusmgr.focusObject(obj.ktab_idnam);*/
			break;
		case VK_DOWN:
			break;
		case VK_UP:
			if (/*(obj = GLOBALS.focusmgr.getObject("login")) || */(obj = GLOBALS.focusmgr.getObject("signup"))) {
				obj.activeObj--;
				if (obj.activeObj < 0)
					obj.activeObj = 0;
				var o = obj.buttons[obj.activeObj].idnam;
				var p = obj.buttons[obj.activeObj+1].idnam;
				GLOBALS.focusmgr.focusObject(o);
				addClass(GLOBALS.focusmgr.getObject(o).elem,'active');
				removeClass(GLOBALS.focusmgr.getObject(p).elem,'active');
			}
			break;
		case VK_ENTER:
			debug("ENTER on button "+this.idnam);
			if (this.idnam == 'bb-button') {
				var item = {}, source = 'http://cdn1.smart-tv-data.com/skai/skaiBB/mpeg.2ts';
				item.show_title = 'Big Brother Live';
				item.title = 'Big Brother Live';
				item.category = 'LIVE';
				item.url = source;
				GLOBALS.item = item;

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
				break;
			} else if (this.idnam == 'ba-button') {
				GLOBALS.scenemgr.sidemenu.show();
				GLOBALS.scenemgr.goBack();
				break;
			} else if (this.idnam == 'xx-button') {
				var o = GLOBALS.scenemgr.sidemenu.skaiMObj, el = o.loginitem;
				o.focusedId=1;
				deleteCookie('user_id');
				el.innerHTML = 'Είσοδος';
				GLOBALS.userId=0;
				GLOBALS.scenemgr.sidemenu.show();
				GLOBALS.scenemgr.goBack();
				break;
			}
			if (this.idnam == 'next-button') {
				GLOBALS.focusmgr.getObject("email-input").signup();
			} else if(this.idnam == 'sms-button') {
				debug("SMS Button clicked");
				GLOBALS.focusmgr.getObject("phone-input").sendSMS();
			} else {
				GLOBALS.focusmgr.getObject("code-input").login();
			}
			break;
		default:
			break;
	}
}

/**
 * This object creates the check input for signup
 * @class UserCheck
 * @instance
 * @param {string} idnam is the id name identificator of the object
 */
function UserCheck(idnam, text) {
	this.idnam = idnam;
	this.text = text;
	this.type = 'button';
}
UserCheck.prototype = new BaseObject();
/**
 * Search input object initialization
 * @memberof UserCheck
 * @instance
 * @param {string} parent is the parent DOM element
 * @param {number} xpos is the x position of container
 * @param {number} ypos is the y position of container
 */
UserCheck.prototype.init = function (parent, xpos, ypos, pos) {
	this.parent = parent;
	var e = createClassDiv("", "", "check-user");

	if (ypos)
		e.style.top = ypos+'px';
	if (xpos)
		e.style.left = xpos+'px';

	//var check = createClassDiv("", "", "fa fa-square");
	var check = createClassDiv("", "", "checkbox");
	check.style.color = '#999';
	check.style.fontSize = '45px';
	check.style.border = '1px solid #ccc';
	e.appendChild(check);
	this.check = check;
	this.checked = false;

	var label = createClassDiv(65, 0, "check-label");
	label.innerHTML = this.text;
	e.appendChild(label);

	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];
}
/**
 * focus function
 * @memberof UserCheck
 * @instance
 * @param {string} otherobj the objects idnam
 * @param {boolean} focus the focus action state
 */
UserCheck.prototype.setFocused = function (otherobj, focus) {
	if (focus) addClass(this.elem,"focused");
	else removeClass(this.elem,"focused");
}
/**
 * user input key handle function
 * @memberof UserCheck
 * @instance
 * @param {number} keyCode the pressedkey's code
 */
UserCheck.prototype.handleKeyPress = function (keyCode) {
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
			break;
		case VK_BACK:
			var popup = GLOBALS.focusmgr.getObject('user-popup');
			if(popup){
				popup.elem.remove();
				popup.unregister();
			}
			GLOBALS.focusmgr.getObject(sceneid).unregister();
			GLOBALS.scenemgr.sidemenu.show();
			GLOBALS.scenemgr.removeLastScene();
			GLOBALS.scenemgr.showLastScene();
			break;
		case VK_RIGHT:
			//var obj = GLOBALS.focusmgr.getObject("login-keyboard");
			//GLOBALS.focusmgr.focusObject(obj.ktab_idnam);
			break;
		case VK_DOWN:
			var obj=  GLOBALS.focusmgr.getObject("signup");

			var p = obj.buttons[obj.activeObj].idnam;
			removeClass(GLOBALS.focusmgr.getObject(p).elem,'active');
			obj.activeObj++;
			var o = obj.buttons[obj.activeObj].idnam;
			//console.log("focus ",o);
			GLOBALS.focusmgr.focusObject(o);
			break;
		case VK_UP:
			var obj = GLOBALS.focusmgr.getObject("signup");
			obj.activeObj--;
			var o = obj.buttons[obj.activeObj].idnam;
			var p = obj.buttons[obj.activeObj+1].idnam;
			addClass(GLOBALS.focusmgr.getObject(o).elem,'active');
			removeClass(GLOBALS.focusmgr.getObject(p).elem,'active');
			GLOBALS.focusmgr.focusObject(o);
			break;
		case VK_ENTER:
			this.checked = !this.checked;
			removeClass(this.check,"checked");
			if (this.checked) addClass(this.check,"checked");
			break;
		default:
			break;
	}
}

/**
 * This object creates the scrollable text that user needs to read to the end before accepting
 * @class UserText
 * @instance
 * @param {string} idnam is the id name identificator of the object
 */
function UserText(idnam, text) {
	this.idnam = idnam;
	this.text = text;
	this.type = 'button';
	this.scrollStep = 50;
	this.currentScroll = 0;
}
UserText.prototype = new BaseObject();
/**
 * UserText object initialization
 * @memberof UserText
 * @instance
 * @param {string} parent is the parent DOM element
 * @param {number} xpos is the x position of container
 * @param {number} ypos is the y position of container
 */
UserText.prototype.init = function (parent, xpos, ypos, pos) {
	this.parent = parent;
	var e = createClassDiv(630, 150, "user-text-container");

	if (ypos)
		e.style.top = ypos+'px';
	if (xpos)
		e.style.left = xpos+'px';

	var scrollbar = createClassDiv("","","user-scrollbar");
	var thumb = createClassDiv("","","user-scrollbar-thumb");
	scrollbar.appendChild(thumb);
	this.scrollbarThumb = thumb;
	e.appendChild(scrollbar);

	var content = createClassDiv("", "", "user-text-content");
	content.innerHTML = "<p>"+
      "Πρόκειται να εισέλθετε σε μία σελίδα που περιέχει οπτικοακουστικό περιεχόμενο που απευθύνεται καταρχήν σε άτομα άνω των 16 ετών."+
    "</p>"+
    "<p>"+
      "Εάν είστε γονέας/κηδεμόνας/ασκών-ουσα την επιμέλεια ανηλίκου, είναι δική σας ευθύνη η αποτροπή εμφάνισης περιεχομένου με περιορισμούς ηλικίας."+
    "</p>"+  
    "<p>"+
      "Προστατέψτε τα παιδιά σας από ακατάλληλο περιεχόμενο, αποκλείοντας την πρόσβαση στη σελίδα, χρησιμοποιώντας διαδικασίες γονικού ελέγχου ενδεικτικά "+
      "<strong><em>https://parco.gov.gr</em></strong>"+
    "</p>"+
    "<p>Άλλα βήματα που μπορείτε να κάνετε για να προστατέψετε τα παιδιά σας είναι:</p>"+
    "<ul>"+
      "<li>Χρησιμοποιήστε οικογενειακά φίλτρα των λειτουργικών σας συστημάτων και/ή προγραμμάτων περιήγησης.</li>"+
      "<li>Όταν χρησιμοποιείτε μια μηχανή αναζήτησης, όπως η Google, το Bing ή το Yahoo, αναζητήστε τον έλεγχο στις ρυθμίσεις ασφαλούς αναζήτησης, όπου μπορείτε να εξαιρέσετε ιστότοπους περιεχομένου για ενηλίκους από τα αποτελέσματα της αναζήτησής σας·</li>"+
      "<li>Ρωτήστε τον πάροχο υπηρεσιών διαδικτύου σας εάν προσφέρει πρόσθετα φίλτρα</li>"+
    "</ul>"+
    "<p>"+
      "Για την πρόσβασή σας σε αυτή τη σελίδα, θα πρέπει, αφού συμφωνήσετε και αποδεχτείτε τους όρους χρήσης του ιστότοπου "+
      "(<span id='terms'><strong><em>ΟΡΟΙ ΧΡΗΣΗΣ</em></strong></span>), να ακολουθήσετε την παρακάτω διαδικασία:"+
    "</p>";
	e.appendChild(content);
	this.content = content;
	this.scrolledToBottom = false;

	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	var me = this;
	setTimeout(function(){
		me.updateScrollbarThumbPosition()
	}, 100);
}
/**
 * focus function
 * @memberof UserText
 * @instance
 * @param {string} otherobj the objects idnam
 * @param {boolean} focus the focus action state
 */
UserText.prototype.setFocused = function (otherobj, focus) {
	if (focus) addClass(this.elem,"focused");
	else removeClass(this.elem,"focused");
}
/**
 * user input key handle function
 * @memberof UserText
 * @instance
 * @param {number} keyCode the pressedkey's code
 */
UserText.prototype.handleKeyPress = function (keyCode) {
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
		case VK_BACK:
			var popup = GLOBALS.focusmgr.getObject('user-popup');
			if(popup){
				popup.elem.remove();
				popup.unregister();
			}
			GLOBALS.focusmgr.getObject(sceneid).unregister();
			GLOBALS.scenemgr.sidemenu.show();
			GLOBALS.scenemgr.removeLastScene();
			GLOBALS.scenemgr.showLastScene();
			break;
		case VK_LEFT:
			var obj = GLOBALS.focusmgr.getObject("login-keyboard");
			GLOBALS.focusmgr.focusObject(obj.ktab_idnam);
			break;
		case VK_DOWN:
			if(this.scrollContent(-1))
				break;

			var obj = 0;
			if ((obj = GLOBALS.focusmgr.getObject("login")) || (obj = GLOBALS.focusmgr.getObject("signup"))) {
				obj.activeObj++;

				if (obj.activeObj > obj.inputs) {
					obj.activeObj = obj.inputs;
					break;
				}

				var o = obj.buttons[obj.activeObj].idnam;
				var p = obj.buttons[obj.activeObj-1].idnam;
				if(obj.activeObj == obj.inputs)
					GLOBALS.focusmgr.focusObject(o);
				addClass(GLOBALS.focusmgr.getObject(o).elem,'active');
				removeClass(GLOBALS.focusmgr.getObject(p).elem,'active');
				GLOBALS.focusmgr.focusObject(obj.buttons[obj.activeObj].idnam);
			}
			break;
		case VK_UP:
			if(this.scrollContent(1))
				break;
			var obj = GLOBALS.focusmgr.getObject("signup");
			obj.activeObj--;
			if(obj.activeObj < 1) obj.activeObj = 1;
			var o = obj.buttons[obj.activeObj].idnam;
			var p = obj.buttons[obj.activeObj+1].idnam;
			addClass(GLOBALS.focusmgr.getObject(o).elem,'active');
			removeClass(GLOBALS.focusmgr.getObject(p).elem,'active');
			GLOBALS.focusmgr.focusObject(o);

			break;
		case VK_ENTER:
			var termsElem = document.getElementById("terms");
  			if(this.isElementInView(termsElem)){
  				var terms = new UserTerms("user-terms");
				terms.init(GLOBALS.scenemgr.sceneStack[GLOBALS.scenemgr.sceneStack.length - 1].obj.elem, 0, 0);
  				}
			break;
		default:
			break;
	}
}
/**
 * user input key handle function
 * @memberof UserText
 * @instance
 * @param {number} keyCode the pressedkey's code
 */
UserText.prototype.scrollContent  = function(factor){
	var contentHeight = this.content.offsetHeight;
  	var visibleHeight = this.content.parentElement.offsetHeight;
  	
	var newScroll = this.currentScroll + (this.scrollStep * factor);

	if (newScroll > 0 || newScroll < visibleHeight- contentHeight) {
		if(newScroll > 0) newScroll = 0;
		if(newScroll < visibleHeight- contentHeight) newScroll = visibleHeight- contentHeight;
		this.content.style.top = newScroll +"px";
  		this.currentScroll = newScroll;
  		this.updateScrollbarThumbPosition();

    	return false; 
  	}
  	this.content.style.top = newScroll +"px";
  	this.currentScroll = newScroll;
  	this.updateScrollbarThumbPosition();
  	var termsElem = document.getElementById("terms");
  	if(this.isElementInView(termsElem)){
  		addClass(termsElem, "focused");
  	}else{
  		removeClass(termsElem, "focused");
  	}
  	return true;
}
UserText.prototype.updateScrollbarThumbPosition = function() {
  var contentHeight = this.content.offsetHeight;
  var visibleHeight = this.content.parentElement.offsetHeight;

  var thumbHeight = Math.max((visibleHeight / contentHeight) * visibleHeight, 20); 

  
  var thumbPosition = (this.currentScroll / (visibleHeight - contentHeight)) * (visibleHeight - thumbHeight);

  this.scrollbarThumb.style.height = thumbHeight + 'px';
  this.scrollbarThumb.style.top = thumbPosition  + 'px';
};

UserText.prototype.isElementInView = function(element) {
  	var contentTop = this.currentScroll;
  	var elementOffsetTop = element.offsetTop;
  	var elementHeight = element.offsetHeight;
  	var containerHeight = this.content.parentElement.clientHeight;

  	var elementTopRelativeToContainer = elementOffsetTop + contentTop;
  	var elementBottomRelativeToContainer = elementTopRelativeToContainer + elementHeight;

  	return (
  		elementTopRelativeToContainer >= 0 &&
  		elementBottomRelativeToContainer <= containerHeight
  	);
};
function UserTerms(idnam) {
	this.idnam = idnam;
}
UserTerms.prototype = new BaseObject();
UserTerms.prototype.init = function(parent, xpos, ypos){
	this.parent = parent;
	var e = createClassDiv(0,0,"terms-background");
	var container = createClassDiv("","","terms-container");

	var title = createClassDiv("","","terms-title");
	title.textContent = "ΟΡΟΙ ΧΡΗΣΗΣ";

	container.appendChild(title);
	var scrollWrapper = createClassDiv("", "", "terms-scroll-wrapper");
	var content = createClassDiv("", "", "terms-content");
	content.innerHTML = "<p>Το σύνολο του περιεχομένου και των υπηρεσιών των δικτυακών τόπων www.skai.gr, www.skaitv.gr και www.skairadio.gr (εφεξής καλούμενων ως «δικτυακών τόπων») διατίθεται στους επισκέπτες / χρήστες αυστηρά για προσωπική χρήση και απαγορεύεται η χρήση ή η αναδημοσίευση, μέρους ή του συνόλου τους, με οποιοδήποτε τρόπο, χωρίς την έγγραφη άδεια της εταιρείας ΕΙΔΗΣΕΙΣ ΝΤΟΤ ΚΟΜ ΑΝΩΝΥΜΗ ΡΑΔΙΟΤΗΛΕΟΠΤΙΚΗ ΚΑΙ ΕΜΠΟΡΙΚΗ ΕΤΑΙΡΕΙΑ ΠΑΡΟΧΗΣ ΠΛΗΡΟΦΟΡΙΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗΣ Νόμος 2121/1993 και κανόνες Διεθνούς Δικαίου πού ισχύουν στην Ελλάδα. Για πληροφορίες: webmaster@skai.gr</p> <p> </p> <p>Η χρήση των δικτυακών τόπων (νοούμενη ως χρήση ενός ή περισσότερων εξ αυτών) υπόκειται στους όρους και τις προϋποθέσεις που παρατίθενται στη συνέχεια. Η χρήση των δικτυακών τόπων  συνιστά τεκμήριο ότι ο επισκέπτης / χρήστης έχει αναγνώσει και αποδέχεται ανεπιφύλακτα τους όρους χρήσης. Σε περίπτωση μη αποδοχής οποιοδήποτε όρου της παρούσας, απαγορεύεται ρητώς η χρήση των δικτυακών τόπων.</p> <p> </p> <p>Πνευματικά Δικαιώματα</p> <p> </p> <p>Το σύνολο του περιεχομένου των δικτυακών τόπων, συμπεριλαμβανομένων, ενδεικτικά και όχι περιοριστικά, κειμένων, ειδήσεων, γραφικών, φωτογραφιών, σχεδιαγραμμάτων, απεικονίσεων, παρεχόμενων υπηρεσιών, αποτελεί αντικείμενο πνευματικής ιδιοκτησίας της εταιρείας ΕΙΔΗΣΕΙΣ ΝΤΟΤ ΚΟΜ ΑΝΩΝΥΜΗ ΡΑΔΙΟΤΗΛΕΟΠΤΙΚΗ ΚΑΙ ΕΜΠΟΡΙΚΗ ΕΤΑΙΡΕΙΑ ΠΑΡΟΧΗΣ ΠΛΗΡΟΦΟΡΙΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗΣ (εφεξής καλούμενης ως η «Εταιρεία») και διέπεται από τις εθνικές και διεθνείς διατάξεις περί Πνευματικής Ιδιοκτησίας, με εξαίρεση τα ρητώς αναγνωρισμένα δικαιώματα τρίτων. </p> <p>Τα λογότυπα, επωνυμίες, εμπορικά σήματα και γνωρίσματα, που περιλαμβάνονται στους δικτυακούς τόπους  ανήκουν στην εταιρεία ΕΙΔΗΣΕΙΣ ΝΤΟΤ ΚΟΜ ΑΝΩΝΥΜΗ ΡΑΔΙΟΤΗΛΕΟΠΤΙΚΗ ΚΑΙ ΕΜΠΟΡΙΚΗ ΕΤΑΙΡΕΙΑ ΠΑΡΟΧΗΣ ΠΛΗΡΟΦΟΡΙΩΝ ΚΑΙ ΕΝΗΜΕΡΩΣΗΣ ή/και στα πρόσωπα που μνημονεύονται ως κύριοι των σχετικών δικαιωμάτων στους δικτυακούς τόπους  και προστατεύονται σύμφωνα με την κείμενη νομοθεσία.</p> <p> </p> <p>Άδεια Χρήσης</p> <p> </p> <p>Απαγορεύεται ρητά η οποιαδήποτε χρήση, αναπαραγωγή, αναδημοσίευση, αντιγραφή, αποθήκευση, πώληση, μετάδοση, διανομή, έκδοση, εκτέλεση, φόρτωση (download), μετάφραση, τροποποίηση με οποιονδήποτε τρόπο, τμηματικά ή περιληπτικά, του περιεχομένου των δικτυακών τόπων και των υπηρεσιών που προσφέρονται σε αυτούς, χωρίς την προηγούμενη έγγραφη άδεια της Εταιρείας. Κατ’ εξαίρεση, επιτρέπεται η μεμονωμένη αποθήκευση και αντιγραφή τμημάτων του περιεχομένου σε απλό προσωπικό υπολογιστή για αυστηρά προσωπική χρήση, χωρίς πρόθεση εμπορικής ή άλλης εκμετάλλευσης και πάντα υπό την προϋπόθεση της αναγραφής της πηγής προέλευσής του, χωρίς αυτό να σημαίνει καθ’ οιονδήποτε τρόπο παραχώρηση δικαιωμάτων πνευματικής ιδιοκτησίας.</p> <p> </p> <p>Δηλώσεις Αποποίησης και Περιορισμοί ευθύνης Διαδικτύου</p> <p> </p> <p>H Εταιρεία καταβάλλει κάθε προσπάθεια, ώστε το σύνολο του Περιεχομένου και οι πληροφορίες που εμφανίζονται στους δικτυακούς τόπους να χαρακτηρίζονται από ακρίβεια, σαφήνεια, ορθότητα, πληρότητα, επικαιρότητα και διαθεσιμότητα. Σε καμία όμως περίπτωση η Εταιρεία δεν εγγυάται και δεν ευθύνεται κατά συνέπεια (ούτε καν από αμέλεια) για οιαδήποτε ζημία τυχόν προκληθεί στον επισκέπτη / χρήστη, από τη χρήση των δικτυακών της τόπων. Το Περιεχόμενο και οι Υπηρεσίες παρέχονται από την Εταιρεία «ως έχουν», χωρίς καμία εγγύηση ρητή ή έμμεση, διατυπωμένη ή υποτιθέμενη, εξυπακουόμενων των εγγυήσεων ικανοποιητικής ποιότητας, καταλληλότητας, απαραβίαστου συμβατότητας, ασφάλειας και ακρίβειας, τις οποίες όλες ρητά αρνείται η Εταιρεία. Σε καμία περίπτωση η Εταιρεία δεν ευθύνεται για οιαδήποτε τυχόν ζημία (θετική ή αποθετική, η οποία ενδεικτικά και όχι περιοριστικά, συνίσταται σε απώλεια κερδών, δεδομένων, διαφυγόντα κέρδη, χρηματική ικανοποίηση κλπ.) από χρήστες/επισκέπτες των δικτυακών της τόπων, ή τρίτους, από αιτία που έχει σχέση με τη λειτουργία ή μη, τη χρήση των δικτυακών τόπων, τυχόν αδυναμία παροχής υπηρεσιών / πληροφοριών που διατίθενται από αυτούς  ή από τυχόν μη επιτρεπόμενες παρεμβάσεις τρίτων σε προϊόντα / υπηρεσίες / πληροφορίες που διατίθενται μέσω αυτών.  Η Εταιρεία καταβάλλει κάθε δυνατή προσπάθεια για την καλή λειτουργία του Δικτύου της, σε καμία όμως περίπτωση δεν εγγυάται ότι οι λειτουργίες των δικτυακών τόπων ή των servers της θα είναι αδιάκοπες ή χωρίς κανενός είδους σφάλμα, απαλλαγμένες από ιούς και παρόμοια στοιχεία, είτε πρόκειται για τους δικτυακούς της τόπους, είτε για κάποιο άλλο site ή server, μέσω των οποίων μεταδίδεται το περιεχόμενο τους.</p> <p> </p> <p>Αποκλεισμός Προτροπών – Συμβουλών</p> <p> </p> <p>Κανένα μέρος του παρεχομένου στους χρήστες / επισκέπτες Περιεχομένου των δικτυακών τόπων δεν αποτελεί και δεν μπορεί να θεωρηθεί σε καμία περίπτωση, ευθέως ή εμμέσως, παρότρυνση, συμβουλή ή προτροπή για οποιαδήποτε πράξη ή παράλειψη, αλλά αντιθέτως εναπόκειται στη διακριτική ευχέρεια των χρηστών / επισκεπτών κατόπιν αξιολόγησης να ενεργήσουν με βάση τη δική τους βούληση, αποκλειομένης οιασδήποτε ευθύνης της Εταιρείας.</p> <p> </p> <p>Προσωπικά Δεδομένα</p> <p> </p> <p>Η Εταιρεία δεσμεύεται ότι θα χρησιμοποιεί τυχόν προσωπικά δεδομένα που οικειοθελώς οι χρήστες/επισκέπτες θα χορηγούν στους δικτυακούς τόπους, κατά τρόπο σύννομο με την ελληνική και την ευρωπαϊκή  νομοθεσία και με σκοπό τη βελτίωση των υπηρεσιών που παρέχει στους χρήστες/επισκέπτες ή προκειμένου να διαπιστώσει τις ανάγκες, επιθυμίες και προσδοκίες αυτών.</p> <p> </p> <p>Προστασία Ανηλίκων</p> <p>Για την προστασία των ανηλίκων από περιεχόμενο βλαπτικό για την ανάπτυξή τους, παρέχονται στους χρήστες συστήματα γονικού ελέγχου με τα οποία οι τελευταίοι μπορούν να περιορίζουν την πρόσβαση των τέκνων τους σε περιεχόμενο (ταινία, σειρά ή άλλη εκπομπή) που είναι ακατάλληλο για την ηλικία τους, με βάση την σήμανση που αυτά φέρουν. </p> <p>Εάν είστε γονέας/κηδεμόνας/ασκών-ουσα την επιμέλεια ανηλίκου, είναι δική σας ευθύνη η αποτροπή εμφάνισης περιεχομένου με περιορισμούς ηλικίας.</p> <p>Προστατέψτε τα παιδιά σας από ακατάλληλο περιεχόμενο, αποκλείοντας την πρόσβαση σε αυτόν τον ιστότοπο, χρησιμοποιώντας διαδικασίες  γονικού ελέγχου ενδεικτικά <em>https://parco.gov.gr</em>.</p> <p>Άλλα βήματα που μπορείτε να κάνετε για να προστατέψετε τα παιδιά σας είναι:</p> <ul> <li>Χρησιμοποιήστε οικογενειακά φίλτρα των λειτουργικών σας συστημάτων και/ή προγραμμάτων περιήγησης.</li> <li>Όταν χρησιμοποιείτε μια μηχανή αναζήτησης, όπως η Google, το Bing ή το Yahoo. αναζητήστε τον έλεγχο στις ρυθμίσεις ασφαλούς αναζήτησης, όπου μπορείτε να εξαιρέσετε ιστότοπους περιεχομένου για ενηλίκους από τα αποτελέσματα της αναζήτησής σας.</li> <li>Ρωτήστε τον πάροχο υπηρεσιών διαδικτύου σας εάν προσφέρει πρόσθετα φίλτρα.</li> </ul> <p>Έννοια των σημάτων καταλληλότητας:</p> <p>Για τα σήματα κατάταξης των προγραμμάτων δείτε σχετικό σύνδεσμο ΕΔΩ <em>https://www.skai.gr/tv/ennoia-ton-simaton-katallilotitas</em></p> <p> </p> <p>Σύνδεσμοι προς δικτυακούς τόπους (links)</p> <p> </p> <p>Η Εταιρεία δεν ελέγχει τη διαθεσιμότητα, το περιεχόμενο, την πολιτική προστασίας των προσωπικών δεδομένων, την ποιότητα και την πληρότητα των υπηρεσιών άλλων δικτυακών τόπων και σελίδων,  στις οποίες  παραπέμπει μέσω \"δεσμών\", hyperlinks ή διαφημιστικών banners (εφεξής καλουμένων ως «σύνδεσμοι»). Οι ανωτέρω σύνδεσμοι έχουν τοποθετηθεί αποκλειστικά για τη διευκόλυνση των επισκεπτών/χρηστών των δικτυακών τόπων, ενώ οι ιστοσελίδες/δικτυακοί τόποι στους οποίους παραπέμπουν υπόκεινται στους αντίστοιχους, των δικτυακών αυτών τόπων, όρων χρήσης. Η τοποθέτηση των συνδέσμων δεν αποτελεί ένδειξη έγκρισης ή αποδοχής του περιεχομένου των αντίστοιχων δικτυακών τόπων από τη Εταιρεία, η οποία δεν φέρει καμία ευθύνη για το περιεχόμενο τους, καθώς και για οποιαδήποτε ζημία προκύψει από τη χρήση τους, καθώς ο επισκέπτης έχει πρόσβαση σε αυτές με δική του ευθύνη.</p> <p> </p> <p>Περιεχόμενο που υποβάλλεται από τους χρήστες </p> <p> </p> <p>H Εταιρεία δίνει στους χρήστες την επιλογή να δημοσιεύουν στους δικτυακούς τόπους δικό τους περιεχόμενο ή να παραπέμπουν σε δικό τους περιεχόμενο δημοσιευμένο σε άλλους δικτυακούς τόπους. </p> <p>Η Εταιρεία  ως δικαιούχος των διαδικτυακών τόπων, δηλώνει ότι συμμορφώνεται με τη Σύσταση (ΕΕ) 2018/334 της Επιτροπής, της 1ης Μαρτίου 2018, σχετικά με μέτρα για την αποτελεσματική αντιμετώπιση του παράνομου περιεχομένου στο διαδίκτυο και ότι λαμβάνει μέτρα για την αφαίρεση και διαγραφή κάθε μορφής παράνομου περιεχομένου για την άρση κάθε ενδεχόμενης δυσμενούς συνέπειας για τους χρήστες, για άλλους θιγόμενους πολίτες και επιχειρήσεις, αλλά και για την κοινωνία στο σύνολό της. Παράνομο περιεχόμενο, κατά την έννοια της Σύστασης, θεωρείται κάθε πληροφορία που δεν συνάδει με το ενωσιακό δίκαιο ή το δίκαιο του ενδιαφερόμενου κράτους μέλους. Οι διαδικτυακοί τόποι σεβόμενοι την ελευθερία της έκφρασης και πληροφόρησης σε συνδυασμό με τη νομοθεσία για την προστασία των δεδομένων προσωπικού χαρακτήρα, τον ανταγωνισμό και το ηλεκτρονικό εμπόριο, λαμβάνουν αποτελεσματικά και κατάλληλα μέτρα, προκειμένου να προληφθεί η υποβολή κακόπιστων αναγγελιών και άλλων μορφών καταχρηστικής συμπεριφοράς και να διασφαλίσει την αποτελεσματική αφαίρεση παράνομου περιεχομένου. Οι διαδικτυακοί τόποι κατά την τήρηση της Σύστασης και με σεβασμό στην αρχή της αναλογικότητας έχουν το δικαίωμα να αρνούνται δημοσιεύσεις που κρίνουν ότι αποτελούν παράνομο περιεχόμενο ή και να διαγράφουν αντίστοιχο περιεχόμενο χωρίς να ενημερώνουν τους χρήστες ή να λαμβάνουν την άδειά τους στο πλαίσιο των προνοητικών μέτρων για την αντιμετώπιση του παράνομου διαδικτυακού περιεχομένου που εκτίθενται στη Σύσταση. Οι διαδικτυακοί τόποι δικαιούνται να αναμορφώνουν την παρούσα σύμφωνα με τις εκάστοτε ισχύουσες Συστάσεις ή τα ληφθέντα από την Πολιτεία νομοθετικά μέτρα.</p> <p>Η Εταιρεία διατηρεί το δικαίωμα να ελέγχει το περιεχόμενο αυτό και δεν αναλαμβάνει καμία ευθύνη για λάθη, παραλείψεις, προσβλητικές εικόνες, χυδαία γλώσσα ή εικόνες, πορνογραφικό, απειλητικό ή δυσφημιστικό προς οποιονδήποτε υλικό στο περιεχόμενο που υποβάλλεται από τους χρήστες.</p> <p>Απαγορεύεται στους χρήστες να δημοσιεύουν στους δικτυακούς τόπους υλικό παράνομο, απειλητικό, δυσφημιστικό, προσβλητικό, άσεμνο, σκανδαλώδες, εμπρηστικό, πορνογραφικό, υλικό που εισάγει δυσμενείς διακρίσεις, προσβλητικό προς το θρησκευτικό συναίσθημα ή οτιδήποτε άλλο θα μπορούσε να θεωρηθεί εκτός νόμου, να εγείρει νομική υπευθυνότητα ή με άλλο τρόπο παραβιάζει τον νόμο. Σε περίπτωση που περιεχόμενο όπως το παραπάνω υποπέσει στην αντίληψη της Εταιρείας, η Εταιρεία θα το αφαιρέσει από τους δικτυακούς τόπους, χωρίς ειδοποίηση.</p> <p>Οι χρήστες αναγνωρίζουν στην Εταιρεία το δικαίωμα να ελέγχει και να εγκρίνει το υλικό που υποβάλλουν πριν τη δημοσίευσή του στους δικτυακούς τόπους. Η Εταιρεία και οι συνεργαζόμενες με αυτήν επιχειρήσεις για τους δικτυακούς τόπους έχουν το δικαίωμα  να ελέγχουν, να εγκρίνουν, να απορρίπτουν ή να διαγράφουν περιεχόμενο που υποβάλλουν οι χρήστες στους δικτυακούς τόπους. Τα παραπάνω είναι στη διακριτική ευχέρεια του ορισμένου από την Εταιρεία αρμόδιου προσωπικού και οι αποφάσεις του δεν επιδέχονται αμφισβήτησης. Η Εταιρεία και οι συνεργαζόμενες επιχειρήσεις διατηρούν το δικαίωμα να αρνηθούν να δημοσιεύσουν περιεχόμενο που παραβιάζει τους παρόντες όρους.</p> <p>Η Εταιρεία διατηρεί το δικαίωμα να διαγράψει ή να αρνηθεί τη δημοσίευση περιεχομένου που παραβιάζει δικαιώματα χρήσης, εμπορικά σήματα, εμπορικά συμβόλαια ή οποιοδήποτε άλλο πνευματικό δικαίωμα προσώπων ή νομικών προσώπων, καθώς επίσης και υλικό που παραβιάζει προσωπικά δεδομένα τρίτων. Για παράδειγμα, το περιεχόμενο δε μπορεί να περιλαμβάνει: εμπορικά σήματα που ανήκουν σε τρίτες εταιρείες, υλικό που προστατεύεται από δικαιώματα πνευματικής ιδιοκτησίας, ονόματα, μιμήσεις, φωνές ή άλλα χαρακτηριστικά που παραπέμπουν σε δημόσια πρόσωπα, καθώς και περιεχόμενο που προωθεί οποιοδήποτε προϊόν ή υπηρεσία εκτός των προϊόντων της Εταιρείας.</p> <p>Κάθε χρήστης που δημοσιεύει περιεχόμενο αποδέχεται και δηλώνει ότι:</p> <p>Έχει το δικαίωμα να υποβάλει και να δημοσιεύσει το περιεχόμενο στους διαδικτυακούς τόπους.</p> <p>Το περιεχόμενο δεν περιλαμβάνει ή παραβιάζει κατατεθειμένα εμπορικά σήματα, λογότυπα ή υλικό προστατευμένο από πνευματικά δικαιώματα οποιουδήποτε φυσικού ή νομικού προσώπου.</p> <p>Απαλλάσσει την Εταιρεία από οποιοδήποτε κόστος δικαιώματος εκμετάλλευσης, αμοιβή και οποιαδήποτε άλλο χρέος προς οποιοδήποτε φυσικό ή νομικό πρόσωπο εξαιτίας της δημοσίευσης στους δικτυακούς τόπους του περιεχομένου που έχει υποβάλει.</p> <p>Κάθε πρόσωπο που απεικονίζεται στο περιεχόμενο έχει συναινέσει στην απεικόνισή του.</p> <p>Έχει όλες τις άδειες και απαιτούμενες εγκρίσεις για τη χρήση στο περιεχόμενο που υποβάλλει όλων των αντικειμένων / σκηνικών/ κοστουμιών που παρουσιάζονται στο περιεχόμενο.</p> <p>Οι χρήστες και όχι η Εταιρεία είναι αποκλειστικά υπεύθυνοι για το περιεχόμενο που υποβάλουν ή διανέμουν μέσω των δικτυακών τόπων καθ’ οιονδήποτε τρόπο. Σε καμία περίπτωση η Εταιρεία ή οι συνεργάτες και οι σχετιζόμενες με αυτήν εταιρείες, οι εργαζόμενοι σε αυτήν, οι διευθυντές, μέτοχοι ή εκπρόσωποί της δεν μπορούν να θεωρηθούν υπεύθυνοι για ζημίες ή απώλειες οποιουδήποτε είδους (για παράδειγμα, μεταξύ άλλων: άμεση έμμεση, τυχαία, παρεπόμενη, αστική ή ποινική) που προκύπτουν από ενέργειες των χρηστών των δικτυακών τόπων.</p> <p>Εάν κάποιος χρήστης επιθυμεί να αποσύρει περιεχόμενο που έχει υποβάλει, οφείλει να ενημερώσει την Εταιρεία χρησιμοποιώντας το email επικοινωνίας που υπάρχει στους δικτυακούς τόπους. Το περιεχόμενο θα αποσυρθεί εντός 1-2 εργάσιμων ημερών. </p> <p> </p> <p>Δικαιώματα Xρήσης του Περιεχομένου</p> <p> </p> <p>Το περιεχόμενο που υποβάλλουν και δημοσιεύουν οι χρήστες παραμένει ιδιοκτησία τους. Παρόλα αυτά, για οποιοδήποτε περιεχόμενο υποβάλλουν οι χρήστες στους δικτυακούς τόπους  για δημοσίευση, αυτόματα παραχωρούν στην Εταιρεία την απεριόριστη, χωρίς αντίτιμο, άδεια για χρήση, διανομή, αναπαραγωγή, τροποποίηση, προσαρμογή, δημόσια προβολή και εκμετάλλευση του περιεχομένου οποτεδήποτε και με οποιοδήποτε τρόπο ηλεκτρονικό ή έντυπο, χωρίς χρονικό περιορισμό.</p> <p> </p> <p>Μεταβατικές Διατάξεις</p> <p> </p> <p>Η Εταιρεία διατηρεί το δικαίωμα να τροποποιεί το περιεχόμενο ή τις υπηρεσίες των δικτυακών τόπων , καθώς και τους όρους χρήσης, οποτεδήποτε το κρίνει αναγκαίο και χωρίς προηγούμενη προειδοποίηση, με την ανακοίνωσή τους μέσω των δικτυακών τόπων. Οι παρόντες όροι διέπονται και ερμηνεύονται από  το ελληνικό δίκαιο, αρμόδια δε για την επίλυση κάθε διαφοράς θα είναι τα καθ' ύλην αρμόδια ελληνικά δικαστήρια. Η Εταιρεία διατηρεί το δικαίωμα να παραιτηθεί από την παρούσα διάταξη και να εφαρμόσει ή και να ερμηνεύσει τους παρόντες όρους σύμφωνα με το δίκαιο της χώρας του χρήστη, καθώς και να υπαγάγει τις οποιεσδήποτε διαφορές ή/και στη δικαιοδοσία της χώρας του χρήστη.</p>";
	scrollWrapper.appendChild(content);
	this.content = content;
	container.appendChild(scrollWrapper);
	var button = createClassDiv("","","terms-btn");
	button.textContent = "OK";

	container.appendChild(button);
	e.appendChild(container);
	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.addCustomScrollbar(scrollWrapper)
	GLOBALS.focusmgr.focusObject(this.idnam);
}
UserTerms.prototype.addCustomScrollbar = function(scrollWrapper) {
	var scrollbarWrapper = createClassDiv("","","terms-scrollbar");
	var scrollbarThumb = createClassDiv("","","terms-scrollbar-thumb");

	scrollbarWrapper.appendChild(scrollbarThumb);
	scrollWrapper.appendChild(scrollbarWrapper);
	this.scrollbarThumb = scrollbarThumb;
	this.currentScroll = 0;
	this.scrollStep = 50;
	this.scrollContent(0);
};
UserTerms.prototype.setFocused = function(focus){
}
UserTerms.prototype.handleKeyPress = function (keyCode) {
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
	case VK_DOWN:
		this.scrollContent(-1);
		break;

	case VK_UP:
		this.scrollContent(1);
		break;

	case VK_BACK:
	case VK_ENTER:
		this.elem.remove();
		this.unregister();
		GLOBALS.focusmgr.focusObject("user-text");
		break;

	default:
		break;
	}
}
UserTerms.prototype.scrollContent  = function(factor){
	var contentHeight = this.content.offsetHeight;
  	var visibleHeight = this.content.parentElement.offsetHeight;
  	
	var newScroll = this.currentScroll + (this.scrollStep * factor);

	if (newScroll > 0 || newScroll < visibleHeight- contentHeight) {
		if(newScroll > 0) newScroll = 0;
		if(newScroll < visibleHeight- contentHeight) newScroll = visibleHeight- contentHeight;
		this.content.style.top = newScroll +"px";
  		this.currentScroll = newScroll;
  		this.updateScrollbarThumbPosition();

    	return false; 
  	}
  	this.content.style.top = newScroll +"px";
  	this.currentScroll = newScroll;
  	this.updateScrollbarThumbPosition();
  	return true;
}
UserTerms.prototype.updateScrollbarThumbPosition = function() {
  var contentHeight = this.content.offsetHeight;
  var visibleHeight = this.content.parentElement.offsetHeight;

  var thumbHeight = Math.max((visibleHeight / contentHeight) * visibleHeight, 20); 

  
  var thumbPosition = (this.currentScroll / (visibleHeight - contentHeight)) * (visibleHeight - thumbHeight);

  this.scrollbarThumb.style.height = thumbHeight + 'px';
  this.scrollbarThumb.style.top = thumbPosition  + 'px';
};
/**
 * This object creates the keyboard interface ussed from the user to interract
 * @class UserKeyboard
 * @instance
 * @param {string} idnam is the id name identificator of the object
 */
function UserKeyboard(idnam) {
	this.idnam = idnam;
	this.focusedId = 0
	this.ktab_idnam = 'keyboard_en_sm'; //keyboard tab idnam
}
UserKeyboard.prototype = new BaseObject();
/**
 * user keyboard object initialization
 * @memberof UserKeyboard
 * @instance
 * @param {string} parent is the parent DOM element
 * @param {number} xpos is the x position of container
 * @param {number} ypos is the y position of container
 */
UserKeyboard.prototype.init = function (parent, xpos, ypos) {
	this.parent = parent;
	var e = createClassDiv(115, (sceneid == 'login'?300:150), "keyboard-container");
	this.parent.appendChild(e);
	this.baseInit(e);
	this.register();
	this.buttons = [];

	/*var obj = new KeyboardTab("keyboard_gr_sm");
	obj.parentId = this.idnam;
	obj.init(this.elem, 550, 0);
	obj.hide();
	this.buttons.push(obj);*/

	var obj = new KeyboardTab("keyboard_en_sm");
	obj.parentId = this.idnam;
	obj.init(this.elem, 550, 0);
	obj.show();
	this.buttons.push(obj);

	var obj = new KeyboardTab("keyboard_symbols_all");
	obj.parentId = this.idnam;
	obj.init(this.elem, 550, 0);
	obj.hide();
	this.buttons.push(obj);

	var obj = new KeyboardTab("keyboard_numbers");
	obj.parentId = this.idnam;
	obj.init(this.elem, 550, 0);
	obj.hide();
	this.buttons.push(obj);

	var obj = new KeyboardTab("keyboard_upper");
	obj.parentId = this.idnam;
	obj.init(this.elem, 550, 0);
	obj.hide();
	this.buttons.push(obj);

	//var e = new KeyboardButtons("login-keyboard-buttons");
	//e.init(this.elem, 0, 0);
}
/**
 * keyboard type switch
 * @memberof UserKeyboard
 * @instance
 * @param {number} keyboardIdnam the keyboard to show id
 */
UserKeyboard.prototype.switchKeyboard = function (keyboardIdnam) {
	for (var i = 0; i < this.buttons.length; i++) {
		var obj = GLOBALS.focusmgr.getObject(this.buttons[i].idnam);
		obj.ktab_idnam = keyboardIdnam;
		if (this.buttons[i].idnam == keyboardIdnam) obj.show();
		else obj.hide();
	}
}

var keyboard_en_sm = [{
        "name": "1",
        "value": "1"
    }, {
        "name": "2",
        "value": "2"
    }, {
        "name": "3",
        "value": "3"
    }, {
        "name": "4",
        "value": "4"
    }, {
        "name": "5",
        "value": "5"
    }, {
        "name": "6",
        "value": "6"
    }, {
        "name": "7",
        "value": "7"
    }, {
        "name": "8",
        "value": "8"
    }, {
        "name": "9",
        "value": "9"
    }, {
    	"name": "0",
        "value": "0"
    }, {
        "name": "q",
        "value": "q"
    }, {
        "name": "w",
        "value": "w"
    },
    {
        "name": "e",
        "value": "e"
    },
    {
        "name": "r",
        "value": "r"
    },
    {
        "name": "t",
        "value": "t"
    },
    {
        "name": "y",
        "value": "y"
    },
    {
        "name": "u",
        "value": "u"
    },
    {
        "name": "i",
        "value": "i"
    },
    {
        "name": "o",
        "value": "o"
    },
    {
        "name": "p",
        "value": "p"
    },
    {
        "name": "a",
        "value": "a"
    },
    {
        "name": "s",
        "value": "s"
    },
    {
        "name": "d",
        "value": "d"
    },
    {
        "name": "f",
        "value": "f"
    },
    {
        "name": "g",
        "value": "g"
    },
    {
        "name": "h",
        "value": "h"
    },
    {
        "name": "j",
        "value": "j"
    },
    {
        "name": "k",
        "value": "k"
    },
    {
        "name": "l",
        "value": "l"
    },
    {
        "name": "-",
        "value": "-"
    },
    {
    	"name":"",
    	"value":"shift"
    },
    {
        "name": "z",
        "value": "z"
    },
    {
        "name": "x",
        "value": "x"
    },
    {
        "name": "c",
        "value": "c"
    },
    {
        "name": "v",
        "value": "v"
    },
    {
        "name": "b",
        "value": "b"
    },
    {
        "name": "n",
        "value": "n"
    },
    {
        "name": "m",
        "value": "m"
    },
    {
        "name": "_",
        "value": "_"
    },
    {
        "name": "@hotmail.com",
        "value": "@hotmail.com"
    },
    {
        "name": "@gmail.com",
        "value": "@gmail.com"
    },
    {
        "name": "@yahoo.com",
        "value": "@yahoo.com"
    },
    {
        "name": "!#$",
        "value": "symbols"
    },
    {
        "name": "@",
        "value": "@"
    },
    {
        "name": ".",
        "value": "."
    },
    {
        "name": ".com",
        "value": ".com"
    },
    {
        "name": " ",
        "value": "del"
    },
    {
        "name": "Επόμενο >",
        "value": "next"
    }
];

var keyboard_upper = [{
        "name": "1",
        "value": "1"
    }, {
        "name": "2",
        "value": "2"
    }, {
        "name": "3",
        "value": "3"
    }, {
        "name": "4",
        "value": "4"
    }, {
        "name": "5",
        "value": "5"
    }, {
        "name": "6",
        "value": "6"
    }, {
        "name": "7",
        "value": "7"
    }, {
        "name": "8",
        "value": "8"
    }, {
        "name": "9",
        "value": "9"
    }, {
    	"name": "0",
        "value": "0"
    }, {
        "name": "Q",
        "value": "Q"
    }, {
        "name": "W",
        "value": "W"
    },
    {
        "name": "E",
        "value": "E"
    },
    {
        "name": "R",
        "value": "R"
    },
    {
        "name": "T",
        "value": "T"
    },
    {
        "name": "Y",
        "value": "Y"
    },
    {
        "name": "U",
        "value": "U"
    },
    {
        "name": "I",
        "value": "I"
    },
    {
        "name": "O",
        "value": "O"
    },
    {
        "name": "P",
        "value": "P"
    },
    {
        "name": "A",
        "value": "A"
    },
    {
        "name": "S",
        "value": "S"
    },
    {
        "name": "D",
        "value": "D"
    },
    {
        "name": "F",
        "value": "F"
    },
    {
        "name": "G",
        "value": "G"
    },
    {
        "name": "H",
        "value": "H"
    },
    {
        "name": "J",
        "value": "J"
    },
    {
        "name": "K",
        "value": "K"
    },
    {
        "name": "L",
        "value": "L"
    },
    {
        "name": "-",
        "value": "-"
    },
    {
    	"name":"",
    	"value":"shift"
    },
    {
        "name": "Z",
        "value": "Z"
    },
    {
        "name": "X",
        "value": "X"
    },
    {
        "name": "C",
        "value": "C"
    },
    {
        "name": "V",
        "value": "V"
    },
    {
        "name": "B",
        "value": "B"
    },
    {
        "name": "N",
        "value": "N"
    },
    {
        "name": "M",
        "value": "M"
    },
    {
        "name": "_",
        "value": "_"
    },
    {
        "name": "@hotmail.com",
        "value": "@hotmail.com"
    },
    {
        "name": "@gmail.com",
        "value": "@gmail.com"
    },
    {
        "name": "@yahoo.com",
        "value": "@yahoo.com"
    },
    {
        "name": "!#$",
        "value": "symbols"
    },
    {
        "name": "@",
        "value": "@"
    },
    {
        "name": ".",
        "value": "."
    },
    {
        "name": ".com",
        "value": ".com"
    },
    {
        "name": " ",
        "value": "del"
    },
    {
        "name": "Επόμενο >",
        "value": "next"
    }

];

var keyboard_gr_sm = [{
        "name": "1",
        "value": "1"
    }, {
        "name": "2",
        "value": "2"
    }, {
        "name": "3",
        "value": "3"
    }, {
        "name": "4",
        "value": "4"
    }, {
        "name": "5",
        "value": "5"
    }, {
        "name": "6",
        "value": "6"
    }, {
        "name": "7",
        "value": "7"
    }, {
        "name": "8",
        "value": "8"
    }, {
        "name": "9",
        "value": "9"
    }, {
    	"name": "0",
        "value": "0"
    }, {
        "name": ";",
        "value": ";"
    }, {
        "name": "ς",
        "value": "ς"
    },
    {
        "name": "ε",
        "value": "ε"
    },
    {
        "name": "ρ",
        "value": "ρ"
    },
    {
        "name": "τ",
        "value": "τ"
    },
    {
        "name": "υ",
        "value": "υ"
    },
    {
        "name": "θ",
        "value": "θ"
    },
    {
        "name": "ι",
        "value": "ι"
    },
    {
        "name": "ο",
        "value": "ο"
    },
    {
        "name": "π",
        "value": "π"
    },
    {
        "name": "α",
        "value": "α"
    },
    {
        "name": "σ",
        "value": "σ"
    },
    {
        "name": "δ",
        "value": "δ"
    },
    {
        "name": "φ",
        "value": "φ"
    },
    {
        "name": "γ",
        "value": "γ"
    },
    {
        "name": "η",
        "value": "η"
    },
    {
        "name": "ξ",
        "value": "ξ"
    },
    {
        "name": "κ",
        "value": "κ"
    },
    {
        "name": "λ",
        "value": "λ"
    },
    {
        "name": " ",
        "value": "del"
    },
    {
        "name": " ",
        "value": "shift"
    },
    {
        "name": "ζ",
        "value": "ζ"
    },
    {
        "name": "χ",
        "value": "χ"
    },
    {
        "name": "ψ",
        "value": "ψ"
    },
    {
        "name": "ω",
        "value": "ω"
    },
    {
        "name": "β",
        "value": "β"
    },
    {
        "name": "ν",
        "value": "ν"
    },
    {
        "name": "μ",
        "value": "μ"
    },
    {
        "name": "_",
        "value": "_"
    },
    {
        "name": "-",
        "value": "-"
    },
    {
        "name": "&nbsp;",
        "value": "&nbsp;"
    },
    {
        "name": "!@#",
        "value": "symbols"
    },
    {
        "name": ",",
        "value": ","
    },
    {
        "name": "Κενό",
        "value": " "
    },
    {
        "name": ".",
        "value": "."
    },
    {
        "name": "?",
        "value": "?"
    },
    {
        "name": " ",
        "value": "enter"
    },
    {
        "name": "@gmail.com",
        "value": "@gmail.com"
    },
    {
        "name": "@yahoo.com",
        "value": "@yahoo.com"
    },
    {
        "name": "@hotmail.com",
        "value": "@hotmail.com"
    }

];

var keyboard_gr = [{
        "name": "1",
        "value": "1"
    }, {
        "name": "2",
        "value": "2"
    }, {
        "name": "3",
        "value": "3"
    }, {
        "name": "4",
        "value": "4"
    }, {
        "name": "5",
        "value": "5"
    }, {
        "name": "6",
        "value": "6"
    }, {
        "name": "7",
        "value": "7"
    }, {
        "name": "8",
        "value": "8"
    }, {
        "name": "9",
        "value": "9"
    }, {
    	"name": "0",
        "value": "0"
    }, {
        "name": ";",
        "value": ";"
    }, {
        "name": "ς",
        "value": "ς"
    },
    {
        "name": "Ε",
        "value": "Ε"
    },
    {
        "name": "Ρ",
        "value": "Ρ"
    },
    {
        "name": "Τ",
        "value": "Τ"
    },
    {
        "name": "Υ",
        "value": "Υ"
    },
    {
        "name": "Θ",
        "value": "Θ"
    },
    {
        "name": "Ι",
        "value": "Ι"
    },
    {
        "name": "Ο",
        "value": "Ο"
    },
    {
        "name": "Π",
        "value": "Π"
    },
    {
        "name": "Α",
        "value": "Α"
    },
    {
        "name": "Σ",
        "value": "Σ"
    },
    {
        "name": "Δ",
        "value": "Δ"
    },
    {
        "name": "Φ",
        "value": "Φ"
    },
    {
        "name": "Γ",
        "value": "Γ"
    },
    {
        "name": "Η",
        "value": "Η"
    },
    {
        "name": "Ξ",
        "value": "Ξ"
    },
    {
        "name": "Κ",
        "value": "Κ"
    },
    {
        "name": "Λ",
        "value": "Λ"
    },
    {
        "name": " ",
        "value": "del"
    },
    {
        "name": " ",
        "value": "shift"
    },
    {
        "name": "Ζ",
        "value": "Ζ"
    },
    {
        "name": "Χ",
        "value": "Χ"
    },
    {
        "name": "Ψ",
        "value": "Ψ"
    },
    {
        "name": "Ω",
        "value": "Ω"
    },
    {
        "name": "Β",
        "value": "Β"
    },
    {
        "name": "Ν",
        "value": "Ν"
    },
    {
        "name": "Μ",
        "value": "Μ"
    },
    {
        "name": " ",
        "value": "_"
    },
    {
        "name": " ",
        "value": "-"
    },
    {
        "name": "&nbsp;",
        "value": "&nbsp;"
    },
    {
        "name": "!@#",
        "value": "symbols"
    },
    {
        "name": ",",
        "value": ","
    },
    {
        "name": "Κενό",
        "value": " "
    },
    {
        "name": ".",
        "value": "."
    },
    {
        "name": "?",
        "value": "?"
    },
    {
        "name": " ",
        "value": "enter"
    },
    {
        "name": "@gmail.com",
        "value": "@gmail.com"
    },
    {
        "name": "@yahoo.com",
        "value": "@yahoo.com"
    },
    {
        "name": "@hotmail.com",
        "value": "@hotmail.com"
    }

];
var keyboard_numbers = [{
        "name": "1",
        "value": "1"
    }, {
        "name": "2",
        "value": "2"
    }, {
        "name": "3",
        "value": "3"
    }, {
        "name": "4",
        "value": "4"
    }, {
        "name": "5",
        "value": "5"
    }, {
        "name": "6",
        "value": "6"
    }, {
        "name": "7",
        "value": "7"
    }, {
        "name": "8",
        "value": "8"
    }, {
        "name": "9",
        "value": "9"
    }, {
    	"name": "0",
        "value": "0"
    },
    {
    	"name": "",
        "value": "del"
    }
];
var keyboard_symbols_all = [{
        "name": "&",
        "value": "&"
    }, {
        "name": "%",
        "value": "%"
    }, {
        "name": "#",
        "value": "#"
    }, {
        "name": "|",
        "value": "|"
    }, {
        "name": "~",
        "value": "~"
    }, {
        "name": "$",
        "value": "$"
    }, {
        "name": "&curren;",
        "value": "&curren;"
    }, {
        "name": "&pound;",
        "value": "&pound;"
    }, {
        "name": "&cent;",
        "value": "&cent;"
    }, {
        "name": "&yen;",
        "value": "&yen;"
    },{
        "name": "\'",
        "value": "\'"
    }, {
        "name": "-",
        "value": "-"
    }, {
        "name": "+",
        "value": "+"
    }, {
        "name": "=",
        "value": "="
    }, {
        "name": "*",
        "value": "*"
    }, {
        "name": "<",
        "value": "<"
    }, {
        "name": ">",
        "value": ">"
    }, {
        "name": "^",
        "value": "^"
    }, {
        "name": "`",
        "value": "`"
    }, {
        "name": "&sect;",
        "value": "&sect;"
    }, {
        "name": "\"",
        "value": "\""
    }, {
        "name": ":",
        "value": ":"
    }, {
        "name": ";",
        "value": ";"
    }, {
        "name": "(",
        "value": "("
    }, {
        "name": ")",
        "value": ")"
    }, {
        "name": "[",
        "value": "["
    }, {
        "name": "]",
        "value": "]"
    }, {
        "name": '{',
        "value": '{'
    }, {
        "name": '}',
        "value": '}'
    }, {
        "name": " ",
        "value": "del"
    }, {
        "name": "",
        "value": " "
    }, {
        "name": "?",
        "value": "?"
    }, {
        "name": "_",
        "value": "_"
    }, {
        "name": "/",
        "value": "/"
    }, {
        "name": "\\",
        "value": "\\"
    }, {
        "name": "&iexcl;",
        "value": "&iexcl;"
    }, {
        "name": "!",
        "value": "!"
    }, {
        "name": '&#191;',
        "value": '&#191;;'
    }, {
        "name": "",
        "value": " "
    },{
        "name": "@hotmail.com",
        "value": "@hotmail.com"
    },
    {
        "name": "@gmail.com",
        "value": "@gmail.com"
    },
    {
        "name": "@yahoo.com",
        "value": "@yahoo.com"
    },
    
    {
        "name": "αβγ",
        "value": "αβγ"
    }, {
        "name": ",",
        "value": ","
    }, {
        "name": ".",
        "value": "."
    }, {
        "name": "?",
        "value": "?"
    },
    {
        "name": " ",
        "value": "del"
    },
    {
        "name": "Επόμενο >",
        "value": "next"
    }

];
function showMsg(txt) {
	var o = GLOBALS.focusmgr.getObject('login');
	if (!o)
		o = GLOBALS.focusmgr.getObject("signup");
	o.msg.style.display = 'block';
	o.msg.innerHTML = txt;

	setTimeout(function () {
		o.msg.style.display = 'none';
	}, 5000);
}
function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}
