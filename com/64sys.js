/**
 * Created by chenpei on 2018/8/13.
 * 判断是否为mac
 */
function isMac(){
	var agt=navigator.userAgent.toLowerCase();
	return /macintosh|\bmac\b/.test(agt) && !(/ios|iphone|ipod|ipad/.test(agt));
}

// macos引用新方案js

function needNewSys(){
	var href = window.location.href;
	var arr = [
		"login_psw.csp",
		"security_check.csp",
		"dkey_portal.csp",
		"hardid.csp",
		"hidtip.csp"
	];
	var len = arr.length;
	var need_new = false;
	for(var i=0; i<len; i++){
		if(href.indexOf(arr[i])>-1){
			need_new = true;
			break;
		}	
	}
	return need_new;
}

if(!isMac() || (isMac() && !needNewSys())){
    document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/64sys_old.js\"><\/script>");
}