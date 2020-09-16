/**
 * Created by chenpei on 2018/8/13.
 * 判断是否为mac
 */
function isMac(){
	var agt=navigator.userAgent.toLowerCase();
	return /macintosh|\bmac\b/.test(agt) && !(/ios|iphone|ipod|ipad/.test(agt));
}

// macos引用新方案js
if(isMac()){
	document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/js/login.min.js\"><\/script>");
}else{
	document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/Login_old.js\"><\/script>");
}
