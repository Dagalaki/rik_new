var currentUser = null;
GLOBALS.msgrBaseUrl = "https://ms-skai.smart-tv-data.com/";

GLOBALS.currentUser = "";

//GLOBALS.dev = 1;
if(GLOBALS.dev == 1)
	GLOBALS.messengerAvailable = 1;

LOG = 1;

function ChatPopup(idnam){
	this.idnam = idnam;
}
ChatPopup.prototype = new BaseObject();
ChatPopup.prototype.init = function (parent, xpos, ypos) {
	this.elem = createClassDiv("","","popup");
	this.parent = parent;
	this.baseInit(this.elem);
	this.register();
	parent.appendChild(this.elem);
}
ChatPopup.prototype.intro = function(){
	if(this.elem) this.elem.innerHTML = "";
	var popupImg = document.createElement("img");
	popupImg.src = "./img/greenmessengerSKAI.png";
	popupImg.addClass("init");
	this.elem.appendChild(popupImg);
}

ChatPopup.prototype.newMessage = function(){
	if(this.elem) this.elem.innerHTML = "";
	var popupImg = document.createElement("img");
	popupImg.src = "./img/skai_messengerNotification.png";
	popupImg.addClass("side");
	this.elem.appendChild(popupImg);
}
function ChatRegister(idnam){
	this.idnam = idnam;
	this.focusedId = 0;
	this.numbers = [VK_0,VK_1,VK_2,VK_3,VK_4,VK_5,VK_6,VK_7,VK_8,VK_9];
}
ChatRegister.prototype = new BaseObject();
ChatRegister.prototype.init = function (parent, xpos, ypos) {
	this.elem = createClassDiv("","","modal-bg");
	this.parent = parent;
	this.baseInit(this.elem);
	this.register();
	parent.appendChild(this.elem);
	var inner = createClassDiv("","","modal");
	this.elem.appendChild(inner);
	inner.innerHTML = "<p>Πληκτρολογήστε τον αριθμό τηλεφώνου σας και πατήστε OK/ENTER</p>";
	this.inputField = createClassDiv(0,0,"inputField");
	inner.appendChild(this.inputField);
	this.errorField = createClassDiv(0,0,"errorField");
	inner.appendChild(this.errorField);
	//lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
	GLOBALS.focusmgr.focusObject(this.idnam);
}
ChatRegister.prototype.initPinInput = function () {
	this.isPinInput = 1;
	var host = "", me = this;
	var url = host+"anixa.php?new_action=GetPinCode&msisdn="+this.currentUser.msisdn+"&code="+this.pin;
	var req = createHttpRequest(url, function (res){});
		this.elem.innerHTML = "";
		var inner = createClassDiv("","","modal");
		this.elem.appendChild(inner);
		inner.innerHTML = "<p>Σας στείλαμε ένα SMS με τον κωδικό επιβεβαίωσης. Παρακαλώ εισάγετε τον τώρα</p>";
		this.inputField = createClassDiv(0,0,"inputField");
		inner.appendChild(this.inputField);
		this.errorField = createClassDiv(0,0,"errorField");
		inner.appendChild(this.errorField);
	
		GLOBALS.focusmgr.focusObject(this.idnam);
	
}
ChatRegister.prototype.handleKeyPress = function(keyCode){
	if(this.req || this.loading) return;
	switch (keyCode) {
	case VK_0:
	case VK_1:
	case VK_2:
	case VK_3:
	case VK_4:
	case VK_5:
	case VK_6:
	case VK_7:
	case VK_8:
	case VK_9:
		this.inputField.innerHTML+= this.numbers.indexOf(keyCode);
		break;
	case VK_GREEN:
		this.onGreen();
		break;
	case VK_BACK:
		this.errorField.innerHTML = "";
		if(this.inputField.innerHTML!="")
			this.inputField.innerHTML = this.inputField.innerHTML.slice(0, -1);
		else{
			GLOBALS.focusmgr.unregisterObject(GLOBALS.reg);
			document.body.removeChild(GLOBALS.reg.elem);
			GLOBALS.reg = null;
			GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
		}
		break;
	case VK_ENTER:
		if (this.isPinInput){
			var res = this.checkPin(this.inputField.innerHTML);
		}else{
			var res = this.checkNumber(this.inputField.innerHTML);
		}
		break;
	}
}
ChatRegister.prototype.checkPin = function(number){
	if(number.length != 4){
		this.errorField.style.color = "red";
		this.errorField.innerHTML = "Μη έγκυρος κωδικός. Δοκιμάστε ξανά";
		return;
	}
	
	
	if(number == this.pin){
		this.loading = 1;
		GLOBALS.currentUser = this.currentUser;
		GLOBALS.currentUserId = this.currentUser._id;
		setCookie("SkaiMsgrId", GLOBALS.currentUserId, 30);
		var sm = GLOBALS.focusmgr.getObject("submenu-0");
		if(sm){
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
			sm.outer.appendChild(inner);
			sm.buttons.push(inner);
			sm.items.push(msgrMenu);
		}
		this.errorField.style.color = "white";
		this.errorField.innerHTML = "Παρακαλώ περιμένετε";
		GLOBALS.chat = new Conversations("chat");
		GLOBALS.chat.init(document.body,0,0);
	}else{
		this.errorField.innerHTML = "Μη έγκυρος κωδικός. Δοκιμάστε ξανά";
	}

}
ChatRegister.prototype.checkNumber = function(number){
	if(number.length < 8){
		this.errorField.innerHTML = "Μη έγκυρος αριθμός. Δοκιμάστε ξανά";
		return;
	}
	var host = "";
	var url = host+"anixa.php?new_action=GetUserByNumber&no="+number;
	var me = this;
	var req = createHttpRequest(url, function (res){
		
		var result = JSON.parse(res);
		if(result){
			me.pin = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
			me.errorField.style.color = "white";
			me.errorField.innerHTML = "Παρακαλώ περιμένετε";
			me.currentUser = result;
			me.initPinInput();
			
			req = null;
		}else{
			me.errorField.innerHTML = "Μη έγκυρος αριθμός. Δοκιμάστε ξανά";
		}
	});
}
function Conversations(idnam){
	this.idnam = idnam;
	this.focusedId = 0;
	this.conversations = [];
}
Conversations.prototype = new BaseObject();
Conversations.prototype.init = function (parent, xpos, ypos) {
	this.shown = true;
	this.cont = createClassDiv("","","conv-list");
	var logo = createClassDiv("","","msgrLogo");
	this.cont.appendChild(logo);
	this.top = 0;
	this.parent = parent;
	this.parent.appendChild(this.cont);
	this.baseInit(this.cont);
	this.register();
	this.buttons = [];
	this.messages = [];
	this.convs = [];
	this.msgtop = 0;
	this.offset = 0;
	var host = "";
	this.getConversations();
}
Conversations.prototype.show = function(){
	if(!this.timer){
		var me = this;
		this.timer = setInterval(function () {
				me.getNewMessages();
			}, 2000);
	}
	this.cont.style.display = "block";
	this.shown = true;

	GLOBALS.focusmgr.focusObject("chat");
}
Conversations.prototype.hide = function(){

	//clearInterval(this.timer);

	//this.timer = null;

	this.cont.style.display = "none";
	this.shown = false;
	if(GLOBALS.vplayer && !GLOBALS.vplayer.video)
		GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
	else if(!GLOBALS.vplayer)
		GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
	else
		GLOBALS.focusmgr.focusObject(null);
}
Conversations.prototype.getConversations = function () {
	var me = this;
	var host = "";
	var url = host+'anixa.php?new_action=GetConversations&uid='+GLOBALS.currentUserId;
	this.req = createHttpRequest(url, function (res) {
		me.lastCheck = new Date();
		me.lastCheck = me.lastCheck.getTime();
		me.req = null;
		me.result = JSON.parse(res);

		me.conversations = me.result.conversations;
		me.convosDiv = createClassDiv("","","convosContainer");
		renderConvs(me);
		me.appendConversation();

		
		if(GLOBALS.reg!=null) me.onGreen();
		GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
		GLOBALS.focusmgr.focusObject("chat");
		me.timer = setInterval(function () {
			me.getNewMessages();
		}, 1000);

	});
	
}
function renderConvs(me) {
	var outer = createClassDiv("","","convo_inner");
	var usersDiv = createClassDiv("","","usersContainer");
	GLOBALS.chat.convId = 0;
	for(var i=0; i<me.conversations.length;i++){
		var otherUser = me.result.users[i];

		if(!otherUser) continue;
		var e = createClassDiv("","","convo");
		e.id = 'conv_'+i;
		e.dataset.ts = me.conversations[i][1];
		e.dataset.id = me.conversations[i][2];
		var inner = createClassDiv("","","user");
		var pic = document.createElement("img");
		//pic.alt = "ProfilePic";
		pic.onerror = function(){
			this.src='img/default_user_new.png';
		}
		pic.id = "profile_pic_"+i;
		pic.classList.add("profile_pic");
		var profilePic = otherUser.profilepic.substring(otherUser.profilepic.lastIndexOf("/") + 1);
		pic.src = GLOBALS.msgrBaseUrl + "hbbtv/users/"+profilePic;

		var name = createClassDiv("","",'conv_user_name');
		name.innerHTML = otherUser.Name;

		var date = document.createElement("span");
		date.classList.add("date");
		date.innerHTML = "Last update : "+new Date(me.conversations[i][1]*1000).toLocaleString();

		var badge = document.createElement("span");
		badge.classList.add("badge");
		badge.innerHTML = 0;

		inner.dataset.ts = me.conversations[i][1];
		inner.dataset.id = me.conversations[i][2];
		inner.dataset.name = otherUser.Name;
		inner.appendChild(pic);

		inner.appendChild(badge);

		usersDiv.appendChild(inner);
		me.cont.appendChild(usersDiv);

		me.setFocused(me.buttons[me.focusedId],true);
		var msgCont = createClassDiv("","","msgContainer");
		msgCont.appendChild(name);
		msgCont.appendChild(date);
		var msgScroller = createClassDiv("","","msgScroller");
		var msgInner = createClassDiv("","","messages");
		msgScroller.appendChild(msgInner);
		var len = me.conversations[i][0].length;

		for(var j = len - 1;j>=0;j--){

			var message = me.conversations[i][0][j];
			if(message.type == '23') continue;
			var row = createClassDiv("","","row");
			row.id = message._id;
			var msg = createClassDiv("","","message");
			replyTo = "";
			if(message.replyId){
				var r = me.conversations[i][0].find(function(msg){return msg._id == message.replyId});
				var replyTo = createClassDiv("","","reply");
				switch(parseInt(r.type)){
				case 1:
					replyTo.innerText = "Image";
					break;
				case 2:
					replyTo.innerText = "Video";
					break;
				case 3:
					replyTo.innerText = "Audio";
					break;
				default:
					replyTo.innerText = r.payload;
					break;
				}
			}
			if(message.type == '21') msg.classList.add('missed');		
			if(message.from == GLOBALS.currentUserId) msg.classList.add('right');
			var msgTxt = message.payload?message.payload:'';
			var dateSpan = document.createElement("span");
			dateSpan.classList.add('date');


			dateSpan.innerHTML = new Date(message.createdAt).toLocaleString();

			switch(parseInt(message.type)){
			case 1:
				var source = GLOBALS.msgrBaseUrl+"/hbbtv/chat/"+message.thumbnail.substring(message.thumbnail.lastIndexOf('/')+1);
				msgTxt = "<img src='"+source+"' width=200><br>"+msgTxt;
				break;
			case 2:
				msgTxt += " - Video";
				break;
			case 3:
				msgTxt += " - Audio";
				break;
			case 4:
				msgTxt += " - Link";
				break;
			case 5:
				msgTxt += " - Contact";
				break;
			case 6:
				msgTxt += " - Document";
				break;
			case 14:
				msgTxt += " - Location";
				break;
			case 21:
				msgTxt = "Missed voice call at "+new Date(message.createdAt).toLocaleString();
				break;
			default:
				break;
			}
			msg.innerHTML = (replyTo?replyTo.outerHTML:"") + msgTxt + dateSpan.outerHTML;
			row.appendChild(msg);
			msgInner.dataset.ts = me.conversations[i][1];
			//msgInner.appendChild(row);
			prependChild(msgInner,row);
		}
		msgCont.appendChild(msgScroller);
		e.appendChild(msgCont);

		me.convs.splice(i,0,e);

		me.messages.push(msgInner);
		me.buttons.push(inner);
		usersDiv.style.width = (usersDiv.children.length * 64) + "px";
		if(message.timestamp > me.lastCheck){
			me.lastCheck = message.timestamp;
		}
	}
}
Conversations.prototype.appendConversation = function () {
	var me = this;
	setTimeout(function(){
		for(var i=0;i<Object.keys(me.convs).length;i++){
			me.convosDiv.appendChild(me.convs[i]);
		}
		me.cont.appendChild(me.convosDiv);
		//if(me.messages[0]){
		//	me.msgtop = 450 - me.messages[0].scrollHeight;
		//	me.messages[0].style.top = me.msgtop + "px";
		//}
	},500);
}
Conversations.prototype.setFocused = function (otherobj, focus) {
	var users = document.querySelector('.usersContainer');		
	for (var i = 0; i< this.buttons.length; i++){
		if(focus){
			if (i == this.focusedId) {
				this.buttons[i].addClass('focused');
				if(this.convs[i]){
						this.convs[i].addClass('focused');
					}
			}else{
				if($(this.buttons[i]).hasClass("focused")) $(this.buttons[i]).removeClass("focused");
				if($(this.convs[i])){
					if($(this.convs[i]).hasClass("focused")) $(this.convs[i]).removeClass("focused");
				}
			}
		}
	}
	this.offset = this.focusedId * 64;
	users.style.left = (50 - this.offset) + "px";
}
Conversations.prototype.setOpen = function () {
	this.msgtop = 0;
	for (var i = 0; i< this.buttons.length; i++){

			if (i == this.focusedId) {
				if($(this.buttons[i]).hasClass('open')){
					$(this.buttons[i]).removeClass('open');
					if(this.convs[i]){
						$(this.convs[i]).removeClass("open");
					}
				}else{
					$(this.buttons[i]).addClass('open');
					$(this.buttons[i]).removeClass('unread');
					this.buttons[i].querySelector('.badge').innerHTML = 0;
					if(this.convs[i]){
						$(this.convs[i]).addClass('open');
					}
					this.messages[this.focusedId].style.bottom = this.msgtop + "px";
					//this.msgtop = 450 - this.messages[this.focusedId].scrollHeight;
					//this.messages[this.focusedId].style.top = this.msgtop + "px";
				}
			}else{
				if($(this.buttons[i]).hasClass("open")) $(this.buttons[i]).removeClass("open");
				if(this.convs[i]){
					if($(this.convs[i]).hasClass("open")) $(this.convs[i]).removeClass("open");
				}
			}
		
	}
}
Conversations.prototype.getNewMessages = function () {
	var me = this;
	var host = "";
	//this.lastCheck=1679491530180;
	var url = host+'anixa.php?new_action=GetConversations&uid='+GLOBALS.currentUserId+'&last_check='+this.lastCheck;
	//console.log("getting new messages");	
	if(me.req!=null) return;
	

	this.req = createHttpRequest(url, function (res) {
	console.log("GETTING NEW MESSAGES");	
		var result = JSON.parse(res);
		var newConversations = result.conversations;

		//newConversations[0][2]= 5;

		var usersDiv = document.querySelector(".usersContainer");
		var convosDiv = document.querySelector(".convosContainer");
		for(var i = 0; i < newConversations.length;i++){
			if(newConversations[i][0].length > 0){
				var convId = newConversations[i][2];
			}
			var msgInner = badge = profile = null;
			if(convId){
				var conv = null;
				conv = me.conversations.find(function(arr){return arr[2]==convId});
				if(!conv){
					me.conversations.push(newConversations[i]);
					var otherUser = me.result.users[i];
					
					if(!otherUser) otherUser = me.result.users[0];
					var e = createClassDiv("","","convo");
					e.id = 'conv_'+me.conversations.length;
					e.dataset.ts = newConversations[i][1];
					e.dataset.id = newConversations[i][2];
					var profile = createClassDiv("","","user");
					var pic = document.createElement("img");
					me.convs.push(e);
					pic.onerror = function(){
						this.src='img/default_user.png';
					}

					pic.id = "profile_pic_"+i;
					pic.classList.add("profile_pic");
					var profilePic = otherUser.profilepic.substring(otherUser.profilepic.lastIndexOf("/") + 1);
					pic.src = GLOBALS.msgrBaseUrl + "hbbtv/users/"+profilePic;

					var name = createClassDiv("","",'conv_user_name');
					name.innerHTML = otherUser.Name;

					var date = document.createElement("span");
					date.classList.add("date");
					date.innerHTML = "Last update : "+new Date(newConversations[i][1]*1000).toLocaleString();

					profile.dataset.ts = newConversations[i][1];
					profile.dataset.id = newConversations[i][2];
					profile.dataset.name = otherUser.Name;

					var badge = document.createElement("span");
					badge.classList.add("badge");
					badge.innerHTML = 0;

					profile.appendChild(pic);

					profile.appendChild(badge);

					usersDiv.appendChild(profile);
					me.buttons.push(profile);
					
					var msgCont = createClassDiv("","","msgContainer");
					msgCont.appendChild(name);
					msgCont.appendChild(date);
					var msgScroller = createClassDiv("","","msgScroller");
					var msgInner = createClassDiv("","","messages");
					msgScroller.appendChild(msgInner);

				}
				
				var selector = '[data-id="'+convId+'"]';
				var convElem = document.querySelector('.convo[data-id="'+convId+'"]');
				if(!profile){
					profile = usersDiv.querySelector('.user[data-id="'+convId+'"]');
				}
				if(!msgInner){
					msgInner = convElem.querySelector('.messages');
				}else{
					e.appendChild(msgCont);
					e.appendChild(msgScroller);
					me.convosDiv.appendChild(e);
				}
			}
			for(var j = 0; j < newConversations[i][0].length; j++){
				var nMsg = newConversations[i][0][j];
				if(nMsg.from != GLOBALS.currentUserId){	
					if(!badge){
						badge = profile.querySelector(".badge");
					}

					var count = parseInt(badge.innerHTML) + 1;

					badge.innerHTML = count;
					if(!GLOBALS.chat.shown){
						if(!GLOBALS.popup){
							GLOBALS.popup = new ChatPopup("popup");
							GLOBALS.popup.init(document.body, 0, 0);
						}

						GLOBALS.popup.newMessage();
					}
					if(!profile.classList.contains("open")){
						profile.classList.add("unread");
					}
				}
				if(nMsg.type == '23') continue;
				var row = createClassDiv("","","row");
				row.id = nMsg.convId;
				var msg = createClassDiv("","","message");
				replyTo = "";
				console.log("new message:",nMsg);
				if(nMsg.replyId){
					var r = me.conversations[i][0].find(function(msg){return msg._id == nMsg.replyId});
					var replyTo = createClassDiv("","","reply");
					switch(parseInt(r.type)){
					case 1:
						replyTo.innerText = "Image";
						break;
					case 2:
						replyTo.innerText = "Video";
						break;
					case 3:
						replyTo.innerText = "Audio";
						break;
					default:
						replyTo.innerText = r.payload;
						break;
					}
				}
				if(nMsg.type == '21') msg.classList.add('missed');		
				if(nMsg.from == GLOBALS.currentUserId) msg.classList.add('right');
				var msgTxt = nMsg.payload?nMsg.payload:'';
				var dateSpan = document.createElement("span");
				dateSpan.classList.add('date');

				dateSpan.innerHTML = new Date(nMsg.createdAt).toLocaleString();

				switch(parseInt(nMsg.type)){
				case 1:
					var source = GLOBALS.msgrBaseUrl+"/hbbtv/chat/"+nMsg.thumbnail.substring(nMsg.thumbnail.lastIndexOf('/')+1);
					msgTxt = "<img src='"+source+"' width=200><br>"+msgTxt;
					break;
				case 2:
					msgTxt += " - Video";
					break;
				case 3:
					msgTxt += " - Audio";
					break;
				case 4:
					msgTxt += " - Link";
					break;
				case 5:
					msgTxt += " - Contact";
					break;
				case 6:
					msgTxt += " - Document";
					break;
				case 14:
					msgTxt += " - Location";
					break;
				case 21:
					msgTxt = "Missed voice call at "+new Date(nMsg.createdAt).toLocaleString();
					break;
				default:
					break;
				}
				msg.innerHTML = (replyTo?replyTo.outerHTML:"") + msgTxt + dateSpan.outerHTML;
				row.appendChild(msg);
				//prependChild(msgInner,row);
				msgInner.appendChild(row);
				if(me.messages.indexOf(msgInner) < 0) me.messages.push(msgInner);
				//this.msgtop = 450 - msgInner.scrollHeight;
				//msgInner.style.top = this.msgtop+"px";
			}

			var users = document.querySelector('.usersContainer');
			var sorted = Array.from(users.querySelectorAll('.user')).sort(newerFirst);
			sorted.forEach(function(e){
				users.appendChild(e);
			});


			var convos = document.querySelector('.convosContainer');
			sorted = Array.from(convos.querySelectorAll('.convo')).sort(newerFirst);
			sorted.forEach(function(e){
				convos.appendChild(e);
			});
			var focusedBtn = me.buttons[me.focusedId];
			me.convs = me.convs.sort(newerFirst);
			me.messages = me.messages.sort(newerFirst);
			me.buttons = me.buttons.sort(newerFirst);

			me.focusedId = me.buttons.indexOf(focusedBtn);

			//me.lastCheck = new Date().getTime();
			newConversations.forEach(function(e){

				if(e[0].length > 0){
					var lastMsg = e[0][e[0].length - 1]
					if(lastMsg.timestamp > me.lastCheck){
						me.lastCheck = lastMsg.timestamp;
					}
				}
			})
			if(users){
				users.style.width = (users.children.length * 64) + "px";
			}
			me.req = null;
			
		}
	});

	/*console.log(url);
	this.req = createHttpRequest(url, function (res) {
		me.lastCheck = new Date();
		me.lastCheck = me.lastCheck.getTime();
		console.log("last check:"+me.lastCheck);
		me.req = null;
		me.result = JSON.parse(res);
		//console.log(me.result);
		console.log(me.result.conversations);
		me.conversations = me.result.conversations;

		renderConvs(me);
		me.appendConversation();

		if(GLOBALS.reg!=null) me.onGreen();
		GLOBALS.focusmgr.focusObject("chat");
	});
	clearInterval(this.timer);*/
}
Conversations.prototype.handleKeyPress = function (keyCode) {
	console.log("conversation handlekeypress");
	switch (keyCode) {
	case VK_1:
		sendMsg('hello world');
		break;
	case VK_RED:
		this.onRed();
		break;
	case VK_GREEN:
		this.onGreen();
		break;
	case VK_UP:
		console.log("UP:"+this.msgtop, this.messages[this.focusedId].scrollHeight);
		if (this.msgtop <=  450 - this.messages[this.focusedId].scrollHeight) {
			break;
		}
		this.msgtop -= 10;
		this.messages[this.focusedId].style.bottom = this.msgtop + "px";
		break;
		
		break;
	case VK_RIGHT:
		
		this.focusedId++;
		if(this.focusedId>this.buttons.length - 1) this.focusedId = this.buttons.length - 1;
		this.setFocused(this.buttons[this.focusedId],true);
		break;
	case VK_LEFT:
		this.focusedId--;
		if(this.focusedId<0) this.focusedId = 0;
		
		this.setFocused(this.buttons[this.focusedId],true);
		break;
	case VK_DOWN:
		console.log("DOWN:"+this.msgtop);
		
		if (this.msgtop >= 0)
			break;

		this.msgtop += 10;
		this.messages[this.focusedId].style.bottom = this.msgtop + "px";
		break;
	case VK_ENTER:
		this.setOpen();
		break;

	default:
		break;
	}
}
function newerFirst(a,b){
	return +b.dataset.ts - +a.dataset.ts;
}
function prependChild(parentEle, newFirstChildEle) {
	parentEle.insertBefore(newFirstChildEle, parentEle.firstChild)
}


BaseObject.prototype.onGreen = function () {
	if(!GLOBALS.dev) return;
	console.log("onGreen!!!!");
	console.trace();
	if(getCookie("SkaiMsgrId")){
		GLOBALS.currentUserId = getCookie("SkaiMsgrId");
	}

	if(GLOBALS.currentUserId && !GLOBALS.chat){
		GLOBALS.chat = new Conversations("chat");
		GLOBALS.chat.init(document.body,0,0);
		console.log("1");
		return;
	}
	if(GLOBALS.reg!=null) {
		GLOBALS.focusmgr.unregisterObject(GLOBALS.reg);
		document.body.removeChild(GLOBALS.reg.elem);
		GLOBALS.reg = null;
		GLOBALS.focusmgr.focusObject(GLOBALS.lastFocus);
		GLOBALS.lastFocus = null;
		console.log("2");
		return;
	}
	if(!GLOBALS.chat){
		GLOBALS.lastFocus = GLOBALS.focusmgr.currentFocus.idnam;
		GLOBALS.reg = new ChatRegister("register");
		GLOBALS.reg.init(document.body,0,0);
		console.log("3");
	}else{
		if(!GLOBALS.chat.shown){
			if(!GLOBALS.lastFocus) GLOBALS.lastFocus = GLOBALS.vplayer.video?GLOBALS.lastFocus:GLOBALS.focusmgr.currentFocus.idnam;
			GLOBALS.chat.show();
			console.log("5");
			return true;
		}
		else{
			console.log("4");
			GLOBALS.chat.hide();
			return true;
		}
		
	}

}
