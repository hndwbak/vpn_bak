function SetCookie(name, value,expire)
{
	//document.cookie = name + "=" + encodeURIComponent(value) + ";path=/";
	var expireTime = null;
	var cookiestr = null;
	if(expire===true){
		expireTime = new Date();
		expireTime.setTime(expireTime.getTime() + (364*86400000));
		cookiestr = name + "=" + value +  "; expires=" + expireTime.toGMTString() + "; path=/";
	}else{
		cookiestr = name + "=" + encodeURIComponent(value) + "; path=/";
	}
	if (/^https/i.test(window.location.protocol)){
		cookiestr += "; secure";
	}
	document.cookie = cookiestr;
}
function GetCookie(name)
{
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var ret = "SangforDefaultValue";
	var i = 0;
	while (i < clen)
	{
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg)
		{
			var endstr = document.cookie.indexOf(";", j);
			if(endstr == -1){
				endstr = document.cookie.length;
			}
			ret = decodeURIComponent(document.cookie.substring(j, endstr));
		}
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0){
			break;
		}
	}
	return ret;
}

function DelCookie(name)
{
	var expireTime = new Date();
	expireTime.setTime(expireTime.getTime() - (365*3600000));
	var c = name + "=0" +  "; expires=" + expireTime.toGMTString() + "; path=/";
	if (/^https/i.test(window.location.protocol)){
		c += "; secure";
	}
	document.cookie = c;
}

function needNewCommon(){
	var pathname = window.location.pathname;
	if (pathname === "/") { //域名
		return true;
	}
	var href = window.location.href;
	var arr = [
		"login_psw.csp",
		"service.csp",
		"svpnSetting.csp",
		"general.csp",
		"hardid.csp",
		"hiderr.csp",
		"hidtip.csp",
		"security_check.csp",
		"dkey_portal.csp",
		"login_cert.csp",
		"logout_t_mac.html"
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

/**
 * Created by chenpei on 2018/8/13.
 * 判断是否为mac
 */
function isMac(){
	var agt=navigator.userAgent.toLowerCase();
	return /macintosh|\bmac\b/.test(agt) && !(/ios|iphone|ipod|ipad/.test(agt));
}

// macos引用新方案js
if(isMac() && needNewCommon()){
		document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/js/common.min.js\"><\/script>");
		document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/js/common_add.js\"><\/script>");
}else{
	document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/common_old.js\"><\/script>");
}
