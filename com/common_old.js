window.TMLVER = 6.8;
if(!window.tmlversion){
	window.tmlversion = 6.6;	//对以前的版本统一使用6.6
}
document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/langVersion.js\"><\/script>");
document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/language.js\"><\/script>");
document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/xml2json.js\"><\/script>");
document.write("<!--[if IE 6]><script src=\"/com/DD_belatedPNG.js\"><\/script><![endif]-->");
var E_CK_OK 	= 0;//正常
var E_CK_LENGTH 	= 1<<0;//超过个数
var E_CK_SIZE 	= 1<<1;//超过大小
var E_CK_PARAM 	= 1<<2;//参数错误
var E_CK_NOEXISTS = 1<<3;//不存在记录

var E_CK_RESERVED_NAME = 1<<4;//保留COOKIE名
var BrowserType =
{
	BrowserUnknown : 0,		//未知类型
	BsFireFox : 1,			//FireFox浏览器
	BsChrome : 2,			//Chrome浏览器
	BsOpera : 3,			//Opera浏览器
	BsSafari : 4,			//Safari浏览器
	BsIExplorer	: 5		//IE浏览器
}

var Browser = {};
try{
	(function(){
		var idSeed = 0,
		ua = navigator.userAgent.toLowerCase(),
		check = function(r){
			return r.test(ua);
		},
		DOC = document,
		isStrict = DOC.compatMode == "CSS1Compat",
		isOpera = check(/opera/),
        isChrome = check(/\bchrome\b/),
		isWebKit = check(/webkit/),
		isSafari = !isChrome && check(/safari/),
		isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
		isSafari3 = isSafari && check(/version\/3/),
		isSafari4 = isSafari && check(/version\/4/),
		isIE = !isOpera && check(/(msie\s|trident.*rv:)([\w.]+)/),
		isIE7 = isIE && check(/msie 7/),
		isIE8 = isIE && check(/msie 8/),
		isIE9 = isIE && check(/msie 9/),
		isIE10 = isIE && check(/msie 10/),
		isIE11 = isIE && check(/trident.*rv:11/),
		isIE6 = isIE && !isIE7 && !isIE8 && !isIE9 && !isIE10 && !isIE11,
		isGecko = !isIE && !isWebKit && check(/gecko/),
		isGecko2 = isGecko && check(/rv:1\.8/),
		isGecko3 = isGecko && check(/rv:1\.9/),
		isBorderBox = isIE && !isStrict,
		isWindows = check(/windows|win32/),
		isWinXP = check(/windows nt 5\.1/),
		isWin8 = check(/windows nt 6.(2|3)/), // win8 : 6.2 , win8.1 : 6.3
		isWin10 = check(/windows nt 10/), // win10 (add by hcz for M7.1)
		isMac = check(/macintosh|mac os x/),
		isAir = check(/adobeair/),
		isLinux = check(/linux/),
		isIpad = check(/ipad/),
		is64 = check(/x64/),
		isSecure = /^https/i.test(window.location.protocol);

        if (isChrome) {
            Browser.chromeVersion = ua.match(/chrome\/([\w\.]*)/)[1];
        }

		extend(Browser,{
			isOpera:isOpera,
			isIE:isIE,
			isIE6:isIE6,
			isIE7:isIE7,
			isIE8:isIE8,
			isIE9:isIE9,
			isIE10:isIE10,
			isIE11:isIE11,
			isFirefox:isGecko,
			isSafari:isSafari,
			isChrome:isChrome,
			isIpad:isIpad,
			isWindows: isWindows,
			isWinXP: isWinXP,
			isWin8: isWin8,
			isWin10: isWin10,
			is64: is64
		});
	})();
}catch(e){}

function CookieClass()
{
	var _this = this;
	var _cookies = {};
	//COOKIE集的名称，用小写
	var _fixName = "collection";
	var _MAX_LENGTH = 20;
	var _MAX_SIZE = 4 * 1024;
	/*真实的COOKIE个数*/
	var _cookieCount = 0;
	_this.init = function(){
		readCookie();
	};
	/*设置COOKIE值*/
	_this.setCookie  = function(ckName,ckValue,expire)
	{
		ckValue = ckValue===null?"":ckValue;
		if(arguments.length<2 )
			return E_CK_PARAM;
		if(ckName.toLowerCase() == _fixName)
			return E_CK_RESERVED_NAME;
		//最多只能有20对cookie值

		if(_cookieCount >= _MAX_LENGTH)
			return E_CK_LENGTH;
		if((document.cookie.length + ckValue.length) > _MAX_SIZE )
			return E_CK_SIZE;
		/*如果原COOKIE不存在则COOKIE个数加1，COOKIE集只算一个COOKIE*/
		if(arguments.length > 2 )/*如果设置了过期时间，则需要单独保存，否则放到COOKIE集合节省空间。如果有在COOKIE集里面到独立COOKIE的切换，则己最后setCookie为准，删掉其它的。*/
		{
			if(typeof(_cookies[ckName]) == "undefined")
				++_cookieCount;
			_cookies[ckName] = ckValue;
			_setCookie(ckName,ckValue,expire);
			if(_cookies[_fixName][ckName])
				delete _cookies[_fixName][ckName];
		}
		else
		{
			if(typeof(_cookies[_fixName]) == "undefined")
			{
				++_cookieCount;
				_cookies[_fixName] = {};
				if(_cookies[ckName])
					delete _cookies[ckName];
			}
			_cookies[_fixName][ckName] = ckValue;
			_setCookie(_fixName,Json.encode(_cookies[_fixName]));
		}
		return E_CK_OK;
	};
	_this.getCookie = function(ckName,isCache)
	{
		if(!isCache)
			readCookie();
		if(_cookies[ckName])
			return _cookies[ckName];
		else if(_cookies[_fixName] && _cookies[_fixName][ckName])
			return _cookies[_fixName][ckName];
		else return null;
	};
	_this.delCookie = function(ckName)
	{
		if(_cookies[ckName])
		{
			_delCookie(ckName);
			delete _cookies[ckName];
			_cookieCount --;
			return E_CK_OK;
		}
		else if(_cookies[_fixName]&&_cookies[_fixName][ckName])
		{	
			if(_cookies[_fixName][ckName])
			{
				delete _cookies[_fixName][ckName];
				_setCookie(_fixName,Json.encode(_cookies[_fixName]));
			}
			if(Json.encode(_cookies[_fixName]) =="{}")
			{
				delete _cookies[_fixName];
				_delCookie(_fixName);
				--_cookieCount;
			}
			return E_CK_OK;
		}
		else return E_CK_NOEXISTS;
	};
	
	_this.clearCookie  = function()
	{
		_setCookie(_fixName,"{}");
	};
	
	/*读取所有COOKIE值到成员集合*/
	function readCookie()
	{
		var tmpCookies= document.cookie.split("; ");
		_cookies = {};
		_cookieCount = 0;
		for (var i=0; i < tmpCookies.length; ++i)
		{
			var aCrumb = tmpCookies[i].split("=");
			var sName=aCrumb[0] ;
			if (sName)
			{
				ckValue = unescape(aCrumb[1]);
				if(_fixName == sName.toLowerCase())
				{
					var tmpCKValue = new String(ckValue);
					tmpCKValue.isSerialized = true;
					_cookies[sName] = tmpCKValue.deSerialize();
				}
				else
					_cookies[sName] = unescape(aCrumb[1]);
				++_cookieCount;
			}
		}
	}
	/*原始设置COOKIE接口*/
	function _setCookie(sName, sValue,expire)
	{
		var expireInfo ="";
		if(arguments.length == 3)
			expireInfo ="; expires=" + arguments[2];
		var cookiestr = sName + "=" + escape(sValue) + expireInfo + "; path=/";
		if (/^https/i.test(window.location.protocol)){
			cookiestr += "; secure";
		}
		document.cookie = cookiestr;
	}
	/*原始删除COOKIE接口*/
	function _delCookie(ckName)
	{
		var expireTime = new Date();
		expireTime.setTime(expireTime.getTime() - (365*86400000));
		var cookiestr = ckName + "=deleted" +  "; expires=" + expireTime.toGMTString();
		if (/^https/i.test(window.location.protocol)){
			cookiestr += "; secure";
		}
		document.cookie = cookiestr;
	}
	_this.init();
}



//const variable
var DKEY_DISABLE        = 0;
var DKEY_ENABLE_V2      = 1 << 0;
var DKEY_ENABLE_V3      = 1 << 1;
var DKEY_ENABLE_BOTH    = DKEY_ENABLE_V2 | DKEY_ENABLE_V3;
var INST_COMP           = 4;
var INST_MAC			= 5;
//
var DKEY_HAVE_UNKNOWN   = -1;
var DKEY_HAVE_NONE      = DKEY_DISABLE;
var DKEY_HAVE_V2        = DKEY_ENABLE_V2;
var DKEY_HAVE_V3        = DKEY_ENABLE_V3;
var DKEY_HAVE_BOTH      = DKEY_ENABLE_BOTH; 

var RC_WEB = 0;
var RC_APP = 1;
var RC_IP = 2;
var RC_UNKNOW = 3;

var SF_FAKEURL_FLAG	="/safeurl";


var Sys = {};

// 判断在Mordern模式
function isMordernIE(){
	if(Browser.isIE && Browser.isWin8 && !isBrowserSupportPlugin()){
		return true;
	}
	return false;
}
// 判断IE10全屏（mordern模式）
function isIEFullScreen(){
	if(window.screen.width == document.documentElement.clientWidth &&
		window.screen.height == document.documentElement.clientHeight){
		return true;
	}
	return false;
}
// 判断浏览器是否能使用插件
function isBrowserSupportPlugin() {
	var supported = null;
	var errorName = null;
	try {
		new ActiveXObject("");
	}
	catch (e) {
		errorName = e.name;
	}     
	try {
		supported = !!new ActiveXObject("htmlfile");
	} catch (e) {
		supported = false;
	}
	if(errorName != 'ReferenceError' && supported==false){
		supported = false;
	}else{
		supported =true;
	}
	return supported;
}
function addStyleLink(link){
	var style = document.createElement('link');
	style.href = link;
	style.rel = 'stylesheet';
	style.type = 'text/css';
	document.getElementsByTagName("head")[0].appendChild(style);
}
function addScript(script){
	var el = document.createElement('script');
	el.src = script;
	el.type = 'text/javascript';
	document.getElementsByTagName("head")[0].appendChild(el);
}
function invokeClick(element) {
    if(element.click){
		element.click();
	}
    else if(element.fireEvent){
		element.fireEvent('onclick');
	}
    else if(document.createEvent){
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, true);
		element.dispatchEvent(evt);
    }
}

function setInter(fn,time){
	var timeCfg = {cancel:false};
	//if(timeCfg.cancel
	var fn1 = function(){
		fn(timeCfg);
		if(!timeCfg.cancel){
			setTimeout(fn1,time);
		}
	}
	window.setTimeout(fn1,time);
}
/**
* 复制对象属性函数
* obj1 将被添加属性的对象
* obj2 被复制属性的对象
*/
function extend(obj1,obj2){
	for(var o in obj2){
		obj1[o] = obj2[o];
	}
	return obj1;
}

/*count string len*/
function mbStringLength(s) 
{
    var totalLength = 0;
    var i;
    var charCode;
    for (i = 0; i < s.length; i++)
	{
          charCode = s.charCodeAt(i);
          if (charCode < 0x007f)
		  {
            totalLength = totalLength + 1;
          } 
		  else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) 
		  {
            totalLength += 2;
          } 
		  else if ((0x0800 <= charCode) && (charCode <= 0xffff)) 
		  {
            totalLength += 3;
          }
    }
    return totalLength;
}

//encode string into a available component of URI
//added by lwq 2008.4.11
 function svpn_encodeURIComponent(str)
 {
    var s = new Array('%00', '%01', '%02', '%03', '%04', '%05', '%06', '%07', '%08', '%09', '%0A', '%0B', '%0C', '%0D', '%0E', '%0F', '%10', '%11', '%12', '%13', '%14', '%15', '%16', '%17', '%18', '%19', '%1A', '%1B', '%1C', '%1D', '%1E', '%1F', '%20', '!', '%22', '%23', '%24', '%25', '%26', "'", '(', ')', '*', '%2B', '%2C', '-', '.', '%2F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '%3A', '%3B', '%3C', '%3D', '%3E', '%3F', '%40', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '%5B', '%5C', '%5D', '%5E', '_', '%60', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '%7B', '%7C', '%7D', '~', '%7F');
    var r = new Array();
    var l = str.length;
    var i;
    var j = 0;
    var c;
    for (i = 0; i < l; i++) {
      c = str.charCodeAt(i);
      if (c < 128) 
	  {
        r[j++] = s[c];
      } 
	  else if (c < 2048) 
	  {
        r[j++] = "%" + ((c >> 6) + 192).toString(16).toUpperCase();
        r[j++] = "%" + ((c & 63) + 128).toString(16).toUpperCase();
      } 
	  else if (c < 65536) 
	  {
        r[j++] = "%" + ((c >> 12) + 224).toString(16).toUpperCase();
        r[j++] = "%" + (((c >> 6) & 63) + 128).toString(16).toUpperCase();
        r[j++] = "%" + ((c & 63) + 128).toString(16).toUpperCase();
      } 
	  else if (c < 2097152) 
	  {
        r[j++] = "%" + ((c >> 18) + 240).toString(16).toUpperCase();
        r[j++] = "%" + (((c >> 12) & 63) + 128).toString(16).toUpperCase();
        r[j++] = "%" + (((c >> 6) & 63) + 128).toString(16).toUpperCase();
        r[j++] = "%" + ((c & 63) + 128).toString(16).toUpperCase();
      }
    }
    return r.join("");
 }
  
function IsIE()
{
  	var nav=navigator.appVersion;
	if(/(MSIE\s|Trident.*rv:)([\w.]+)/.test(nav))
	{
		return true;
	}
	return false;
}

/*about cookie */
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


//修正XMLHttpRequest对象以兼容不同浏览器
(function()
{
	if (typeof XMLHttpRequest == 'undefined') 
	{
		XMLHttpRequest = function () 
		{
			var msxmls = ['MSXML3', 'MSXML2', 'Microsoft'];
			if(navigator.userAgent.indexOf("MSIE 5") >=0 )
			{
				msxmls = ['Microsoft','MSXML3', 'MSXML2' ]
			}
			for (var i=0; i < msxmls.length; i++) 
			{
				try 
				{
					return new ActiveXObject(msxmls[i]+'.XMLHTTP')

				} 
				catch (e) 
				{}
			}
			return null;
		}
	}
})();

//note by lwq 这种请求都没有处理超时的情况。

//修正url,尾追随机参数
function SFfixurl(orgUrl){
	var rand = Math.random().toString();
	if(rand.length>2){
		rand = rand.substr(2);
	}
	var tag = "?";
	if(orgUrl.indexOf("?")>-1){
		tag = "&";
	}
	orgUrl+=tag+"rnd="+rand;
	return orgUrl;
}

function post_http(url,sbody,method,func)
{
	func = func===undefined?new Function():func;
	var xmlhttp  = null;
	try{
		xmlhttp = new XMLHttpRequest();
		if(xmlhttp == null){
			return "";
		}
	}
	catch(e)
	{
		return "";
	}
	
	if((method != null)&&(method.toUpperCase()=="GET" || method.toUpperCase()=="POST"))
	{
		method = method.toUpperCase();	
	}
	else
	{
		method = "GET";
	}
    var IsAsynch = false;
    if(arguments.length > 3 && typeof(arguments[3])=='boolean')
    {
		IsAsynch = arguments[3];
	}
	url = SFfixurl(url);
	xmlhttp.open(method, url , IsAsynch);	// false=synch
	xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	try{
		if (sbody){
			xmlhttp.send(sbody);
		}else{
			xmlhttp.send(null);
		}
	}
	catch(e)
	{
		return "";
	}

	if((xmlhttp.readyState == 4) && (xmlhttp.status == 200))
	{
		func(xmlhttp.responseText ? xmlhttp.responseText : "");
	//	alert(xmlhttp.responseText);
		return (xmlhttp.responseText ? xmlhttp.responseText : "").trim();
	}
	else
	{
		return "0";
	}
}

//note by lwq 这种请求都没有处理超时的情况。
function post_http_async(url, sbody, func)
{
	var xmlhttp = null;
	try{
		xmlhttp = new XMLHttpRequest();
		if(xmlhttp == null){
			return null;
		}
	}
	catch(e){
		return null;
	}
    var method = "GET";
    if(sbody);
        method = "POST";
	url=SFfixurl(url);
    xmlhttp.open(method, url , true);	// true=asynch
	xmlhttp.onreadystatechange = function(){
		//alert(xmlhttp.readyState);
		func.call(xmlhttp);
	};
	xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	try{
		if (sbody){
			xmlhttp.send(sbody);
		}
		else{
			xmlhttp.send(null);
		}
	}
	catch (e){return null;}
	return xmlhttp;
}

function ajax(options) {
    options = {
        type: options.type || "POST",
        url: options.url || '',
        timeout: options.timeout || 1000*60,
        //不论成功或失败都会调用
        onComplete: options.onComplete || new Function(),
        onSuccess: options.onSuccess || new Function(),
        onError: options.onnError || new Function(),
		onTimeout: options.onTimeout||new Function(),
        dataType:options.dataType||''
    };

    if (!XMLHttpRequest) {
        XMLHttpRequest = function () {
            return new ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ?
            "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP"
            );
        }
    }
    
    var xml=new XMLHttpRequest();
    xml.open(options.type, options.url, true);
    
    var requestDone=false;
    window.setTimeout(function () {
		if(requestDone){
			return;
		}
        requestDone = true;
		options.onTimeout();
    }, options.timeout);
    
    //监听文档状态的改变
    xml.onreadystatechange = function () {
        if (xml.readyState == 4 && !requestDone) {
			requestDone = true;
            if (httpSuccess(xml)) {
                options.onSuccess(httpData(xml, options.dataType));
            }
            else {
                options.onError();
            }
            options.onComplete();
            xml = null;//为避免内存泄漏，清理文档
        }
    }
    //建立与服务器的连接
    xml.send(null);
    
    //判断http响应是否成功
    function httpSuccess(r) {
        try {
            return (!r.status && location.protocal == "file:") ||
          (r.status >= 200 && r.status < 300) ||
          r.status == 304 ||
          (navigator.userAgent.indexOf("Safari") >= 0 &&
            r.status === undefined);
        }
        catch (e) { }
        return false;
    }
    //从http响应中解析得到正确的数据
    function httpData(r,type) {
        var ct = r.getResponseHeader("content-type");
        type = !type ? (ct.indexOf("xml") >= 0 ? 'xml' : '') : type;
        var data = type == "xml" ? r.responseXML : r.responseText;
        if (type == "script") {
            eval.call(window, data);
        }
		if(type=="json"){
			eval('data='+data);
		}
        return data;
    }
}



//因为String扩展还会用到trim等函数，String类的扩展放到一个地方。如果用到了mootools，扩展就容易多了。

	String.prototype.getBytes=function(){
		return svpn_encodeURIComponent(this).replace(/%[A-Z0-9]{2}/g,"0").length;
	};
	String.prototype.isSerialized = false;
	String.prototype.trim=function(){
		return this.replace(/^\s+/g,'').replace(/\s+$/g,'');
	};
/*	String.prototype.replaceAll=function(regs,tests){
		regs = regs.constructor==Array?
	};*/
	var Json = {
		encode : function(o){
			var output = "";
			var targetObj = o;
			switch(targetObj.constructor)
			{
				case Number:
				case Boolean: output += targetObj;break; 
				case String:
				{
				//说白了这个地方达到的目的就是一个字符串值怎样会一个字符串来表示，即a的值是\abc\e,则它字符串化为var a="\\abc\\e"
					output +="'"+targetObj.replace(/\\/g,"\\\\").replace(/'/g,"\\'") +"'";break;
				}
				case Date:output += 'new Date(' + targetObj.getTime() + ')';; break;
				case Function: output += targetObj.toString().replace(/\s+|\r|\n/g,' ');break;
				case Array: 
				{
					output +="[";
						var i=0;
						for(var j=targetObj.length;i<j;++i)
						{
							output += Json.encode(targetObj[i])+",";
						}
						if(i > 0)//去掉','
							output = output.substring(0,output.length-1);
						output +="]";
					break;
				}
				case Object:
				{
					output +="{";
					var i=0;
					for(var item in targetObj)
					{
						if((item.toLowerCase() == "serialize" ||item.toLowerCase() == "deserialize") && typeof(targetObj[item]) === "function" )
							continue;
						output += item+":"+Json.encode(targetObj[item])+",";
						++i;
					}
					if(i > 0)//去掉','
						output = output.substring(0,output.length-1);
					output +="}";
					break;
				}
				output += ";";
			}
			var tmpOut = new String(output);
			tmpOut.isSerialized = true;
			return tmpOut;
		}
	}
	//alert("开始解析");
	String.prototype.deSerialize = function()
	{
		var obj = this;
		obj = obj.replace(/\r/g,"\\r").replace(/\n/g,"\\n");
		var varName ="targetObj";
		if(/^\s*var\s*[a-zA-Z_]+\s*=.*/.test(obj)){
			varName = obj.replace(/^\s*var\s*([a-zA-Z_]+)\s*=.*/,"$1");
			obj += ";var targetObj = " +varName +";";
		}
		else
			obj = "var targetObj = " + obj;
		try{
			eval(obj);
			if(typeof(targetObj) != "undefined" )
				return targetObj;
		}
		catch(e){
			alert(tr("序列化时:")+e.message);
		}
		return null;
	};
	String.format = function() {
		if( arguments.length == 0 )
			return null; 
		var str = arguments[0]; 
		for(var i=1;i<arguments.length;i++) {
			var re = new RegExp('\\{' + (i-1) + '\\}','gm');
			str = str.replace(re, arguments[i]);
		}
		return str;
	};
	
var Cookie = new CookieClass();
/*数组扩展 add by zsw*/
Array.prototype.each=function(action){
	for(var i=0;i<this.length;i++){
		var flag = action(this[i],i);
		if(flag===false){
			return;
		}
	}
};

Array.prototype.remove =function(index){
	if(index > this.length)
		return;
	for(var i=index;i<this.length && (index != this.length - 1);i++)
		this[i] = this[i + 1];
	this.length--;
};
Array.prototype.find =function(value){
	for(var i=0;i<this.length;i++){
		if(this[i]==value){
			return i;
		}
	}
	return -1;
};
Array.prototype.removeValue =function(value){
	var i = this.find(value);
	if(i!=-1){
		this.remove(i);
	}
};



/*解析url地址参数为json* add by zsw 2010/6/28*/
function urlToJson(url){
	if(typeof url=="object"){
		return url;
	}
	var temp = url.split("&");
	var ret = {};
	temp.each(function(value){
		var index = value.indexOf("=");
		
		var key = value.substring(0,index),
			value = value.substring(index+1);
		ret[key] = value;
	});
	return ret;
}

function $ID(id){
	return document.getElementById(id);
}

//转义HTML特殊标签
function htmlspecialchars(input)
{
	var output = "";
	output = input.toString().replace(/&/g,"&amp;");
	output = output.replace(/"/g,"&quot;");
//	output = output.replace(/'/g,"&apos;");
	output = output.replace(/</g,"&lt;");
	output = output.replace(/>/g,"&gt;");
	//output = output.replace(/\\/g,"\\\\");
	output = output.replace(/	/g,"\\t");
	return output;
}
function htmlDecode(input){
	var output = input.toString();
	output = output.replace(/&quot;/g,"\"");
	output = output.replace(/&apos;/g,"'");
	output = output.replace(/&lt;/g,"<");
	output = output.replace(/&gt;/g,">");
	output = output.replace(/&amp;/g,"&");
	return output;
}
function Close() {
	if(IsIE()){
		window.opener=null;window.open('','_self'); window.close();
	}
}
/***************** checkValidURL ******************/
function isValidURL(str)
{
	var strRegex = /([^:\/]+)(:(\d+))?([^:]*)?/i;
	var regPro = /^(https|http):\/\//i;
	if(strRegex.test(str) && regPro.test(str))
	{
		return true;
	}
	else
	{
		return false;
	}
}
function isValidURL2(str)
{
	var strRegex = /([^:\/]+)(:(\d+))?([^:]*)?/i;
	if(strRegex.test(str))
	{
		return true;
	}
	else
	{
		return false;
	}
}
function showMsg(typ,message)
{
	var tipsNode = $ID("tipsContent");
	if(tipsNode!=null)
	{
		if(window.tmlversion < window.TMLVER){
			tipsNode.style.display = "block";
			tipsNode.className = typ;
			tipsNode.innerHTML = message;	
		}else{
			tipsNode.parentNode.style.display = "";
			tipsNode.className = typ;
			tipsNode.innerHTML = message;	
		}
	}
	else
	{
		alert(message);	
	}
}
function hideMsg()
{
	var tipsNode = $ID("tipsContent");
	if(tipsNode!=null)
	{
		if(window.tmlversion < window.TMLVER){
			tipsNode.className = "hide";
			tipsNode.innerHTML = "";
		}else{
			tipsNode.parentNode.style.display = "none";
			tipsNode.innerHTML = '';
		}
	}
}
function routeMatch(str)
{
	var noPattern = /[\*\?\"\,<>\|]/;	
	var result = str.match(noPattern);  
	if(result != null)
	{
		return true;
	}else{
		return false;		
	}
}
function diskMatch(str)
{
	var reg = /^([A-Za-z]\:[\\\/]){1}/;
	var strMatch = str.match(reg);
	if(strMatch!=null)
	{
		return true;
	}else{
		return false;
	}
}
function isInt(sValue)
{
	var regm = /^\d+$/;
	return regm.test(sValue*1) || sValue.length==0;	
}
//Events set of;
function addEvent( obj, type, fn )
{
	var obj = ( obj.constructor === String ) ? document.getElementById( obj ) : obj;
	if ( obj.attachEvent ) 
	{
		obj[ 'e' + type + fn ] = fn;
		obj[ type + fn ] = function(){ obj[ 'e' + type + fn ]( window.event ) };
		obj.attachEvent( 'on' + type, obj[ type + fn ] );
	} else {
		obj.addEventListener( type, fn, false );
	}
}
	
function removeEvent( obj, type, fn )
{
	var obj = ( obj.constructor === String ) ? document.getElementById( obj ) : obj;
	if ( obj.detachEvent )
	{
		obj.detachEvent( 'on' + type, obj[ type + fn ] );
		obj[ type + fn ] = null;
  	} else {
		obj.removeEventListener( type, fn, false );
	}
}
function stopEvent(e){
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
}
//transform between string and it's code
function compile(code)
{ 
	var c=String.fromCharCode(code.charCodeAt(0)+code.length);
	for(var i=1,len=code.length;i<len;i++)
	{
		c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
	}
	return escape(c);
}


function uncompile(code)
{
	code=unescape(code);
	var c=String.fromCharCode(code.charCodeAt(0)-code.length);
	for(var i=1,len=code.length;i<len;i++)
	{
		c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));
	}
	return c;
}
function initPageEvent()
{
	var arrNodes = document.getElementsByTagName("body")[0].getElementsByTagName("input");
	for(var i=0,len = arrNodes.length;i<len;i++)
	{
		if(arrNodes[i].type == 'text')
		{
			addEvent(arrNodes[i], 'blur',
				function()
				{
					hideMsg();
				});
			addEvent(arrNodes[i], 'keydown',
				function()
				{
					hideMsg();
				});	
		}
	}	
}


function GetIeVersion()
{
	var navInfo = navigator.appVersion;
	var verRegExp = /^.+(MSIE\s+|Trident\/.+rv:)(\d+\.\d+).+$/; //兼容IE11
	if(verRegExp.test(navInfo))
		return navInfo.replace(verRegExp,"$2");
	else 
		return 0;
}

var OS_HP_UX= 1;
var HP_UX 	= OS_HP_UX + 1;
var MacPPC 	= HP_UX + 1;
var Mac68K	= MacPPC + 1;
var SunOS	= Mac68K + 1; 
var Win16	= SunOS + 1;
var WinCE	= Win16 + 1;
var Win32_95	= WinCE + 1;
var Win32_98	= Win32_95 + 1;
var Win32_ME	= Win32_98 + 1;
var Win32_NT	= Win32_ME + 1;
var Win32_2000	= Win32_NT + 1;
var Win32_XP	= Win32_2000 + 1;
var Win32_2003	= Win32_XP + 1;
var Win32_VISTA	= Win32_2003 + 1;
var Win32_7		= Win32_VISTA + 1;
var Win32_8		= Win32_7 + 1;
var OS_UNKNOWN	= Win32_8 + 1;
function getOsVersion()
{
	var plat = navigator.platform;
	var os = OS_UNKNOWN;
	switch(plat.toUpperCase()){
		case "HP_UX":os = HP_UX;break;
		case "MACPPC":os = MacPPC;break;
		case "MAC68K":os = Mac68K;break;
		case "SUNOS":os = SunOS;break;
		case "WIN16":os = Win16;break;
		case "WINCE":os = WinCE;break;
		default:break;
	}
	if( plat.toUpperCase() != "WIN32")
		return os;
	
	var verRegExp = /^.+Windows\s+([a-zA-Z]+)\s+(\d+)\.(\d+).+$/;
	var isNT = false;
	var clientVer = navigator.appVersion;
	var MajorVer = 0;
	var MinVer = 0;
	if(verRegExp.test(clientVer)){
		isNT = (clientVer.replace(verRegExp,"$1") == "NT");
		MajorVer = clientVer.replace(verRegExp,"$2");
		MinVer = clientVer.replace(verRegExp,"$3");
	}
	if(isNT){
		if ( MajorVer == 5 && MinVer == 2 )
			os = Win32_2003;
		else if ( MajorVer == 5 && MinVer == 1 )
			os = Win32_XP;
		else if ( MajorVer == 5 && MinVer == 0 )
			os = Win32_2000;
		else if ( MajorVer == 6 && MinVer == 2 )
			os = Win32_8;
		else if ( MajorVer == 6 && MinVer == 1 )
			os = Win32_7;
		else if ( MajorVer == 6 && MinVer == 0 )
			os = Win32_VISTA;
		else if ( MajorVer <= 4 )
			os = Win32_NT;
	}
	else{
		if (MajorVer == 4 && MinVer == 0)
			os = Win32_95;
		else if( MajorVer == 4 && MinVer == 10)
			os = Win32_98;
		else if(MajorVer == 4 && MinVer == 90)
			os = Win32_ME;
	}
	return os;
}

function CreateDiv(id)
{
	var div = $ID(id);
	if(!div)
	{
		if(!(div = document.createElement("div")))
			return;
		div.id = id;
		document.body.appendChild(div); 
	}
	return div;
}


////////////////////////////////////////////////////////////////////////////////////////////////
//  ip service
////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * base64 encoding
 * @param str 

 * @return str

 */

 var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}
function base64encode(input){
	return Base64.encode(input);
} 
function base64decode(input){
	return Base64.decode(input);
}

/**
 * md5
 * param str 
 * return str
**/
var MD5 = {
	rotateLeft : function(lValue, iShiftBits) {
		return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	},
	
	addUnsigned : function(lX, lY) {
		var lX4, lY4, lX8, lY8, lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
		if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		if (lX4 | lY4) {
			if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
	},
		
	F : function(x, y, z) {
		return (x & y) | ((~ x) & z);
	},
		
	G : function(x, y, z) {
		return (x & z) | (y & (~ z));
	},
		
	H : function(x, y, z) {
		return (x ^ y ^ z);
	},
		
	I : function(x, y, z) {
		return (y ^ (x | (~ z)));
	},
		
	FF : function(a, b, c, d, x, s, ac) {
		a = MD5.addUnsigned(a, MD5.addUnsigned(MD5.addUnsigned(MD5.F(b, c, d), x), ac));
		return MD5.addUnsigned(MD5.rotateLeft(a, s), b);
	},
		
	GG : function(a, b, c, d, x, s, ac) {
		a = MD5.addUnsigned(a, MD5.addUnsigned(MD5.addUnsigned(MD5.G(b, c, d), x), ac));
		return MD5.addUnsigned(MD5.rotateLeft(a, s), b);
	},
		
	HH : function(a, b, c, d, x, s, ac) {
		a = MD5.addUnsigned(a, MD5.addUnsigned(MD5.addUnsigned(MD5.H(b, c, d), x), ac));
		return MD5.addUnsigned(MD5.rotateLeft(a, s), b);
	},
		
	II : function(a, b, c, d, x, s, ac) {
		a = MD5.addUnsigned(a, MD5.addUnsigned(MD5.addUnsigned(MD5.I(b, c, d), x), ac));
		return MD5.addUnsigned(MD5.rotateLeft(a, s), b);
	},
		
	convertToWordArray : function(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWordsTempOne = lMessageLength + 8;
		var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
		var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
		var lWordArray = Array(lNumberOfWords - 1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while (lByteCount < lMessageLength) {
			lWordCount = (lByteCount - (lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount - (lByteCount % 4)) / 4;
		lBytePosition = (lByteCount % 4) * 8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
		lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
		lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
		return lWordArray;
	},
		
	wordToHex : function(lValue) {
		var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
		for (lCount = 0; lCount <= 3; lCount++) {
			lByte = (lValue >>> (lCount * 8)) & 255;
			WordToHexValueTemp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
		}
		return WordToHexValue;
	},
		
	uTF8Encode : function(string) {
		string = string.replace(/\x0d\x0a/g, "\x0a");
		var output = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				output += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				output += String.fromCharCode((c >> 6) | 192);
				output += String.fromCharCode((c & 63) | 128);
			} else {
				output += String.fromCharCode((c >> 12) | 224);
				output += String.fromCharCode(((c >> 6) & 63) | 128);
				output += String.fromCharCode((c & 63) | 128);
			}
		}
		return output;
	},
			
	md5: function(string) {
		var x = Array();
		var k, AA, BB, CC, DD, a, b, c, d;
		var S11=7, S12=12, S13=17, S14=22;
		var S21=5, S22=9 , S23=14, S24=20;
		var S31=4, S32=11, S33=16, S34=23;
		var S41=6, S42=10, S43=15, S44=21;
		string = MD5.uTF8Encode(string);
		x = MD5.convertToWordArray(string);
		a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
		for (k = 0; k < x.length; k += 16) {
			AA = a; BB = b; CC = c; DD = d;
			a = MD5.FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
			d = MD5.FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
			c = MD5.FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
			b = MD5.FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
			a = MD5.FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
			d = MD5.FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
			c = MD5.FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
			b = MD5.FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
			a = MD5.FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
			d = MD5.FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
			c = MD5.FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
			b = MD5.FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
			a = MD5.FF(a, b, c, d, x[k+12], S11, 0x6B901122);
			d = MD5.FF(d, a, b, c, x[k+13], S12, 0xFD987193);
			c = MD5.FF(c, d, a, b, x[k+14], S13, 0xA679438E);
			b = MD5.FF(b, c, d, a, x[k+15], S14, 0x49B40821);
			a = MD5.GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
			d = MD5.GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
			c = MD5.GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
			b = MD5.GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
			a = MD5.GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
			d = MD5.GG(d, a, b, c, x[k+10], S22, 0x2441453);
			c = MD5.GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
			b = MD5.GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
			a = MD5.GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
			d = MD5.GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
			c = MD5.GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
			b = MD5.GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
			a = MD5.GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
			d = MD5.GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
			c = MD5.GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
			b = MD5.GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
			a = MD5.HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
			d = MD5.HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
			c = MD5.HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
			b = MD5.HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
			a = MD5.HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
			d = MD5.HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
			c = MD5.HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
			b = MD5.HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
			a = MD5.HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
			d = MD5.HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
			c = MD5.HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
			b = MD5.HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
			a = MD5.HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
			d = MD5.HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
			c = MD5.HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
			b = MD5.HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
			a = MD5.II(a, b, c, d, x[k+0],  S41, 0xF4292244);
			d = MD5.II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
			c = MD5.II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
			b = MD5.II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
			a = MD5.II(a, b, c, d, x[k+12], S41, 0x655B59C3);
			d = MD5.II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
			c = MD5.II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
			b = MD5.II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
			a = MD5.II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
			d = MD5.II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
			c = MD5.II(c, d, a, b, x[k+6],  S43, 0xA3014314);
			b = MD5.II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
			a = MD5.II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
			d = MD5.II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
			c = MD5.II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
			b = MD5.II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
			a = MD5.addUnsigned(a, AA);
			b = MD5.addUnsigned(b, BB);
			c = MD5.addUnsigned(c, CC);
			d = MD5.addUnsigned(d, DD);
		}
		var tempValue = MD5.wordToHex(a) + MD5.wordToHex(b) + MD5.wordToHex(c) + MD5.wordToHex(d);
		return tempValue.toLowerCase();
	}
}

/** 
    *调用信息打印函数。
     *param 
                    info[String] :  要输出的信息。
                    mod[String] : 模块名称，使用LOG_INFO、LOG_WARNING、LOG_ERR、LOG_DEBUG几类日志
                    level[int] :  日志级别
     *retvalue[boolean]:true|false
**/
var g_enableDbgLog = true;      //启用调试日志
var ID_DBG_DIV = "debuginfo";
function debug(mod,info,level)
{
    if(!g_enableDbgLog)
        return;
    var dbgDiv = $ID(ID_DBG_DIV);
    if(!dbgDiv)
    {
        if(!(dbgDiv = document.createElement("div")))
            return;
        dbgDiv.id = ID_DBG_DIV;
        document.body.appendChild(dbgDiv); 
    }
    if(arguments.length > 1)
        dbgDiv.innerHTML += "<br>\r\n["+mod+"]\t" + info.replace(/</g,"&lt").replace(/>/g,"&gt");
    else
    {
        dbgDiv.innerHTML += "<br>\r\n" + arguments[0].replace(/</g,"&lt").replace(/>/g,"&gt");
    }
}


function doQueryService(queryStr){
	if(g_CscmObj){
		var ret = g_CscmObj.doQueryService(queryStr);
		return new String(ret);
	}
	return "";
}

function doQueryServiceBlock(queryStr){
	if(g_CscmObj){
		var ret = g_CscmObj.doQueryServiceBlock(queryStr);
		ret = new String(ret);
		return ret;
	}
	return "";
}

function doConfigure(conStr){
	if(g_CscmObj){
		var ret = g_CscmObj.doConfigure(conStr);
		return new String(ret);
	}
	return "";
}

function doConfigureBlock(conStr){
	if(g_CscmObj){
		var ret = g_CscmObj.doConfigureBlock(conStr);
		return new String(ret);
	}
	return "";
}

function dealCscmCertInfo(times)
{
	if(!g_CscmObj || times == 0){
		return;
	}
	try{
		--times;
		var csCertInfo = "";
		var bsCertInfo = GetCookie("SSL_CLIENT_INFO");
		if(bsCertInfo == "SangforDefaultValue"){
			var noteInfo = doQueryService("QUERY QSETTING RCERTINFO").deSerialize().note;
			 //注册表项不存在时,返回了"-1"
			if(noteInfo != "-1"){
				csCertInfo = base64decode(noteInfo);
			}
		}
		if(bsCertInfo != "SangforDefaultValue"){
			if(csCertInfo == ""){
				doConfigure("CONF SETTING CERTINFO " + base64encode(bsCertInfo));
			}
		}else if(csCertInfo != ""){
			SetCookie("SSL_CLIENT_INFO", csCertInfo);
		}
	}catch(e){
		setTimeout("dealCscmCertInfo("+times+")", 1000);
	}
}

document.ELEMENT_NODE = 1;
document.TEXT_NODE = 3;
document.DOCUMENT_NODE = 9; //指Document

function first(element) {
    element = element.firstChild;
    return element && element.nodeType == document.ELEMENT_NODE ?
    element : next(element);
}
function next(element) {
    element = element.nextSibling;
    while (element && element.nodeType != document.ELEMENT_NODE) {
        element = element.nextSibling;
    }
    return element;
}
function fullHeight(elem) {
    if (elem.style.display != 'none') {
        return elem.clientHeight;
    }
    
    var old = resetCSS(elem, {
        display: '',
        visibility: 'hidden',
        position: 'absolute'
    });

    //此时elem.clientHeight依然==0，原因可能是通过脚本设置display=''，不能让elem.clientHeight正确测量
    var h = elem.clientHeight;
	restoreCSS(elem,old);
    return h;
}
function resetCSS(elem, prop) {
    var o = {};
    for (var i in prop) {
        o[i] = elem.style[i];
        elem.style[i] = prop[i];
    }
    return o;
}
function restoreCSS(elem, prop) {
    for (var i in prop) {
        elem.style[i] = prop[i];
    }
}
function setOpacity(elem, level) {
	try{
		if (elem.filters) {
			elem.style.filter = 'alpha(opacity=' + level + ')';
		}
		else {
			elem.style.opacity = level / 100;
		}
	}
	catch(e){
	}
}
function pageWidth() {
    //此处如果用document.documentElement.scrollWidth，在ie,firfox,opara上如果body有margin边距则document.body.scrollWidth会变小
    return (document.documentElement && document.documentElement.scrollWidth) || document.body.scrollWidth;
}

function pageHeight() {
    return (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
}
function windowWidth() {
//第一种为w3c浏览器,第二种都可用，第三种测的是body的clientWidth，如果body有外边距，测的数据不包括margin边距

	return self.innerWidth||
		(document.documentElement && document.documentElement.clientWidth)||
		document.body.clientWidth;
}

function windowHeight() {
	//document.body.clientHeight而且当页面高度大于窗口高度时document.body..body.clientHeight测的实际是页面高度，
	//document.body.clientWidth不会这样
	return self.innerHeight ||
		(document.documentElement && document.documentElement.clientHeight) ||
		document.body.clientHeight;
}
function pageX(elem) {
    return elem.offsetParent ?
     elem.offsetLeft + pageX(elem.offsetParent) : elem.offsetLeft;
}
function pageY(elem) {
    return elem.offsetParent ?
     elem.offsetTop + pageY(elem.offsetParent) : elem.offsetTop;
}
function xscrollX() {
	return self.pageXOffset ||
	  (document.documentElement && document.documentElement.scrollLeft) ||
	  document.body.scrollLeft;
}

function xscrollY() {
	return self.pageYOffset ||
	  (document.documentElement && document.documentElement.scrollTop) ||
	  document.body.scrollTop;
}

function create(elem) {
	return document.createElementNS ?
	  document.createElementNS('http://www.w3.org/1999/xhtml', elem) :
	  document.createElement(elem);
}

function createHidden(id){
	var el = create("input");
	el.type="hidden";
	el.id = id;
	el.name=id;
	return el;
}

function findByCls(elem,cls,tagName){
	var eles = elem.getElementsByTagName(tagName||"*");
	for(var j =0;j<eles.length;j++){
		var el = eles[j];
		if(el.className.indexOf(cls)!=-1){
			return el;
		}
	}

	return null;
}

function checkEl(elem) {
	r = [];
	elem = elem.constructor == Array ? elem : [elem];
	for (var i = 0; i < elem.length; i++) {
		if (elem[i].constructor == String) {
			var div = create("div");
			div.innerHTML = elem[i];
			
			for (var j = 0; j < div.childNodes.length; j++) {
				r.push(div.childNodes[j]);
			}
		}
		else {
			r.push(elem[i]);
		}
	}
	return r;
}

function createEl(html){
	return checkEl(html)[0];
}

function append(parent, child) {
	var childs = checkEl(child);
	for (var i = 0; i < childs.length; i++) {
		parent.appendChild(childs[i]);
	}
}

function fadeIn(elem,time,fn) {
    setOpacity(elem, 0);
	time = time!=undefined?time:1500;
	var times = time/100;
    for (var i = 0; i <= 100; i += 5) {
        (function () {
            var pos = i;
            setTimeout(function () {
                setOpacity(elem, pos);
				//assert("debug",pos);
				if(pos==100&&fn){
					fn();
				}
            }, (pos + 1) * times);   //因为是同一时间定时，所有定时器同一时间启动，当pos==100时时长1010
        })();
    }
} 

function fadeOut(elem,time) {
    for (var i = 0; i <= 100; i += 5) {
        (function () {
            var pos = i;
            setTimeout(function () {
                setOpacity(elem, 100-pos);
            }, (pos + 1) * 10);   //因为是同一时间定时，所有定时器同一时间启动，当pos==100时时长1010
        })();
    }
} 

function applyStyle(el,style){
	for(var pro in style){
		el.style[pro] = style[pro];
	}
}

function removeEl(el){
	el.parentNode.removeChild(el);
}


function html(el,content){
	el.innerHTML = content;
}
function isWin(){
	var agt=navigator.userAgent.toLowerCase();
	return agt.indexOf("win")!=-1;
}
function isLinux(){
	var agt=navigator.userAgent.toLowerCase();
	return agt.indexOf("inux")!=-1;
}
function isMac(){
	var agt=navigator.userAgent.toLowerCase();
	return agt.indexOf("mac")!=-1;
}

//近回类型为BrowserType枚举
function getBroserType(){
	if(Browser.isChrome){
		return BrowserType.BsChrome;
	}
	else if(Browser.isOpera){
		return BrowserType.BsOpera;
	}
	else if(Browser.isSafari){
		return BrowserType.BsSafari;
	}
	else if(Browser.isFirefox){
		return BrowserType.BsFireFox;
	}
	else if(Browser.isIE){
		return BrowserType.BsIExplorer;
	}
	else{
		return BrowserType.BrowserUnknown;
	}
}

//得到页面第一次运行时分析得到控件是否安装的值
function getIstCscmCookie(){
	var isNeedIstCscm = Cookie.getCookie("need_ist_cscm");
	if((isNeedIstCscm!==null && isNeedIstCscm.toString()!="1")||isNeedIstCscm === null){
		if(Request.QueryString("showsvc")!=""){//从托盘打开
			isNeedIstCscm = "1";
			Cookie.setCookie("need_ist_cscm","1");
		}
	}
	return isNeedIstCscm;
}
//设置是否需要手动安装
function setHandleIst(value){
	this.handleIst = value;
}
//获取是否需要手动安装
function getHandleIst(value){
	return this.handleIst||false;
}

function bulidMask(msg){
	if(!window.serviceMask){
		serviceMask = new XWindow({width:160,model:true,maskColor:"#F0F2F6",opacity:50,
							elStyle:{border:"0px solid #9fb3c3",backgroundColor:"transparent"},
							contentStyle:{border:"0px solid #9fb3c3",backgroundColor:"transparent",color:'#fff',textAlign:"center"},
							content:"<div style='background:url(\"/com/images/svrloading.gif\") no-repeat;width:32px;height:32px;margin:auto;cursor:wait'></div><br/><span style='color:#4f2527;padding-top5px;'>"+tr("正在初始化...")+"</span>"
							//content:"<img src='/com/images/svrloading.gif' style=''/><span style='color:#4f2527'>正在初始化...</span>"
					});
	}
	msg =  msg||tr("正在初始化...");
	serviceMask.setContent("<div style='background:url(\"/com/images/svrloading.gif\") no-repeat;width:32px;height:32px;margin:auto;cursor:wait'></div><span style='color:#282828;font-weight:bold;padding-top5px;'>"+msg+"</span>");
	//serviceMask.setContent("<img src='/com/images/svrloading.gif' style=''/><span style='color:#282828;font-weight:bold;'>"+msg+"</span>");
	return serviceMask;
}
/*个人设置页面在非ie上会有点慢,所以加个loading*/
function showSettingLoading(){
	
	if(!window.settingMask){
		settingMask = new XWindow({width:160,model:true,maskColor:"#ffffff",opacity:1,
							elStyle:{backgroundColor:"transparent"},
							contentStyle:{border:"0px solid #9fb3c3",backgroundColor:"transparent",color:'#fff',textAlign:"center"},
							content:"<img src='/com/images/setting_loading.gif' style='cursor:wait'/><br/><span style='color:#4f2527;padding-left:10px;'>"+tr("页面加载中...")+"</span>"
					});
	}
	settingMask.show();
	return settingMask;
}
function hideSettingLoading(){
	if(window.settingMask){
		settingMask.hide();
	}
}
function setSettingLoading(){
	if(window.settingMask){
		settingMask.setContent("<img src='/com/images/setting_loading.gif' style=''/><br/><span style='color:#4f2527;padding-left:10px;'>"+tr("正在处理...")+"</span>");
	}
}

	/**
	*	width:int,height:int,title:string,content:string,model:true/false
	*/
	var XWindow = function(cfg){
		var pre = XWindow._randNum++;
		this.elId = {
			title:"xwinow_title"+pre,
			titleTxt :"xwinow_title_txt"+pre,
			content:"xwinow_content"+pre
		};//id 
		this.elCls = "",this.titleCls = "",this.contentCls ="",this.content = "", this.title = "";
		extend(this,cfg);
		this.init();
	}
	XWindow._randNum = 1000000;
	XWindow.prototype = {
		init:function(){
			//创建元素
			this.el = create("div");
			if(this.model){
				this.mask = create("div");
				//alert("pageHeight:"+pageHeight());
				var h = Math.max(pageHeight(),windowHeight()),
				maskColor = this.maskColor||"#000000",
				opacity = this.opacity||70;
				
				//alert(h);
				var maskStyle = {width:pageWidth()+"px",height:h+"px",display:"none",position :"absolute",zIndex:XWindow._randNum++,
					backgroundColor:maskColor,left:"0px",top:"0px"
				};
				document.body.appendChild(this.mask);
				applyStyle(this.mask,maskStyle);
				setOpacity(this.mask,opacity);
			}
			
			var content = [];
			content.push(String.format("<h2 id='{0}' class = '{1}'><span style='float:left;' id='{2}'>{3}</span><span style='float:right; cursor:pointer'></span><br style='clear:both;'/></h2>",
				this.elId.title,this.titleCls,this.elId.titleTxt,this.title));
			content.push(String.format("<div id = '{0}' class='{1}'>{2}</div>",this.elId.content,this.contentCls,this.content));
			append(this.el,content.join(""));
			//创建样式
			
			var elStyle ={ backgroundColor:"#f7faff",color:"#000",width:this.width+"px",position :"absolute",zIndex:XWindow._randNum++,
				display:'none',left:'0px',top:'0px',textAlign:"left"};
			titleStyle = {padding:"0px",margin:"0px",fontSize:"12px",padding:"3px"},
			contentStyle = {backgroundColor:"#fff",color:"7d7d7d",margin:"3px",fontSize:"12px",lineHeight:"22px",textAlign:"left"};
			extend(elStyle,this.elStyle||{});
			extend(contentStyle,this.contentStyle||{});
			document.body.appendChild(this.el);
			//应用样式
			var ctEl = $ID(this.elId.content);
			var titleEl = $ID(this.elId.title);
			
			applyStyle(this.el,elStyle);
			applyStyle(titleEl,titleStyle);
			applyStyle(ctEl,contentStyle);
			var pos = this.calPosition();
			this.el.style.top = pos.top+"px";
			this.el.style.left = pos.left+"px";
			var me = this;
			addEvent(window,"resize",function(){
				me.onWindowReSize();
			});
		},
		calPosition : function(){//计算位置
			var height = fullHeight(this.el);
			var left = parseInt((windowWidth()-this.width)/2,10) + xscrollX(),
			top = parseInt((windowHeight()-height)/2,10) + xscrollY();
			return {left:left,top:top};
		},
		setContent : function(content){
			var ctEl = $ID(this.elId.content);
			html(ctEl,content);
		},
		setTitle : function(title){
			var tEl = $ID(this.elId.titleTxt);
			html(tEl,title);
		},
		hide : function(){
			this.el.style.display = "none";
			if(this.model){
				this.mask.style.display = 'none';
			}
		},
		onWindowReSize : function(){
			if(this.el&&this.el.style!='none'){
	
				this.reSize();
			}
		},
		show : function(){
			if(this.isRender){
				this.reSize();
			}
			this.el.style.display = '';
			if(this.model){
				this.mask.style.display = '';
			}
			this.isRender = true;
		},
		reSize:function(){
			if(this.mask){
				var h = Math.max(pageHeight(),windowHeight());
				applyStyle(this.mask,{width:pageWidth()+"px",height:h+"px"});
			}
			var pos = this.calPosition();
			applyStyle(this.el,{left:pos.left+"px",top:pos.top+"px"});
		}
	}
	
Drag = {
    obj: null,
    init: function (options) {
		var root = options.handler.root;
        options.handler.onmousedown = this.start;
        options.handler.root = options.root || options.handler;
        options.handler.root.onDragStart = options.onDragStart || new Function();
        options.handler.root.onDrag = options.onDrag || new Function();
        options.handler.root.onDragEnd = options.onDragEnd || new Function();
    },
    start: function (e) {//此时的this是handler
        var obj = Drag.obj = this;
        obj.style.cursor = 'move';
        e = e || Drag.fixEvent(window.event);
        ex = e.pageX;
        ey = e.pageY;
        obj.lastMouseX = ex;
        obj.lastMouseY = ey;
        //Drag.css(obj, 'position', Drag.css(obj, 'position') != 'relative' ? 'absolute' : 'relative');
        var x = obj.root.offsetLeft;
        var y = obj.root.style.top ? parseInt(obj.root.style.top) : 0;
		obj.root.style.left = x + "px";
        document.onmouseup = Drag.end;
        document.onmousemove = Drag.drag;
        obj.root.onDragStart(x, y);
    },
    drag: function (e) {
        e = e || Drag.fixEvent(window.event);
        ex = e.pageX;
        ey = e.pageY;
        var root = Drag.obj.root;
        var x = root.style.left ? parseInt(root.style.left) : 0;
        var y = root.style.top ? parseInt(root.style.top) : 0;
        var nx = ex - Drag.obj.lastMouseX + x;
        var ny = ey - Drag.obj.lastMouseY + y;
		nx = nx > 0 ? nx : 0;
		ny = ny > 0 ? ny : 0;
		nx = nx < (document.body.clientWidth - 20) ? nx : (document.body.clientWidth - 20);
		ny = ny < (document.body.clientHeight - 20)  ? ny : (document.body.clientHeight - 20);
        root.style.left = nx + "px";
        root.style.top = ny + "px";
        Drag.obj.root.onDrag(nx, ny);
        Drag.obj.lastMouseX = ex;
        Drag.obj.lastMouseY = ey;
    },
    end: function (e) {
        var x = Drag.obj.root.style.left ? parseInt(Drag.obj.root.style.left) : 0;
        var y = Drag.obj.root.style.top ? parseInt(Drag.obj.root.style.top) : 0;
        Drag.obj.root.onDrag(x, y);
		Drag.obj.root.onDragEnd();
        document.onmousemove = null;
        document.onmouseup = null;
        Drag.obj = null;
    },
    fixEvent: function (e) {
        e.pageX = e.clientX + document.documentElement.scrollLeft;
        e.pageY = e.clientY + document.documentElement.scrollTop;
        return e;
    },
    guid: 1,
    css: function (elem, name, value) {
        if (value) {
            elem.style[name] = value;
        }
        if (elem.style[name]) {
            return elem.style[name];
        }
        else if (elem.currentStyle) {
            return elem.currentStyle[name];
        }
        else if (document.defaultView && document.defaultView.getComputedStyle) {
            //它使用的是'text-align'格式，而不是textAlign格式
            name = name.replace(/([A-Z])/g, "-$1");
            name = name.toLowerCase();
            //获取样式对象，并非获取属性
            var s = document.defaultView.getComputedStyle(elem, "");
            return s && s.getPropertyValue(name);
        }
        else {
            return null;
        }
    }
}
addStyleLink("/com/css/setting_window.css");

var XNewWindow = function(cfg){
	var pre = XWindow._randNum++;
	this.elId = {
		titleId:"xwinow_title"+pre,
		//titleTxtId :"xwinow_title_txt"+pre,
		contentId:"xwinow_content"+pre,
		iframeId:"xwinow_iframe"+pre,
		closeBtnId:"xwinow_close"+pre,
		footId:"xwinow_foot"+pre,
		contentPanelId:"xwinow_content_panel"+pre
	};//id 
	this.cfg = {title:'',closefn:new Function()};
	extend(this.cfg,cfg);
	this.init();
}

XNewWindow.prototype = {
	init:function(){
		if(this.cfg.model){
			this.mask = create("div");
			//alert("pageHeight:"+pageHeight());
			var h = Math.max(pageHeight(),windowHeight()),
			maskColor = this.cfg.maskColor||"#ffffff",
			opacity = this.cfg.opacity||70;
			//alert(h);
			var maskStyle = {width:pageWidth()+"px",height:h+"px",display:"none",position :"absolute",zIndex:XWindow._randNum++,
				backgroundColor:maskColor,left:"0px",top:"0px"
			};
			document.body.appendChild(this.mask);
			applyStyle(this.mask,maskStyle);
			setOpacity(this.mask,opacity);
		}
		this.el = createEl("<div class='xnewwindow_el'></div>");
		var html = [
			String.format("<div id='{0}' class='xnewwindow_head'>",this.elId.titleId),
			//String.format("<span id='{0}' class='xnewwindow_title'></span>",this.elId.titleTxtId),
			String.format("<a id='{0}' title='"+tr("关闭")+"'  class='xnewwindow_close'></a>",this.elId.closeBtnId),
			//"<br style='clear:both;'/>",
			"</div>",
			"<div class='xnewwindow_el_inner'>",
				"<div class='xnewwindow_content_wraper' id='"+this.elId.contentPanelId+"'>",
					"<div id='"+ this.elId.contentId +"' class='xnewwindow_body'></div>",
					String.format("<div id='{0}' class='xnewwindow_foot'></div>",this.elId.footId),
				"</div>",
			"</div>"
		].join('');
		this.el.innerHTML = html;
		document.body.appendChild(this.el);
		var elStyle ={ width:this.cfg.width+"px",position :"absolute",zIndex:XWindow._randNum++,
			display:'none',left:'0px',top:'0px',textAlign:"left",
			height:this.cfg.height=='auto'?this.cfg.height:this.cfg.height+"px"
			};
		//设置样式
		applyStyle(this.el,elStyle);
	
		var foot = $ID(this.elId.footId);
		foot.style.display = this.cfg.url ? 'none' : 'block';
		//this.setTitle(this.cfg.title);//设置标题

		if(this.cfg.url){
			this.setUrl(this.cfg.url);
		}else{
			this.setContent(this.cfg.content);//设置内容
		}
		this.setButtons(this.cfg.buttons);
		var me = this;
		this.reSize();
		var pos = this.calPosition();
		applyStyle(this.el,{left:pos.left+"px",top:pos.top+"px"});
		$ID(this.elId.closeBtnId).onclick = function(){me.hide();me.cfg.closefn();}
		
		var resizefn = function()
		{
			if(me.el&&me.el.style!='none'){
				me.reSize();
			}
		}
		addEvent(window,"resize",resizefn);
		Drag.init({
			handler:$ID(this.elId.titleId),
			root:this.el,
			onDragStart:function(){
				var panel = $ID(me.elId.contentPanelId);
				panel.style.visibility = "hidden";
				//setOpacity(me.el,80);
			},
			onDragEnd:function(){
				var panel = $ID(me.elId.contentPanelId);
				panel.style.visibility = "visible";
				//setOpacity(me.el,100);
			}
		});
	},
	setUrl:function(url)
	{
		if(!this.iframe)
		{
			this.iframe = create("iframe");
			this.iframe.src = url;
			this.iframe.frameBorder = 0;
			this.iframe.width = "100%";
			this.iframe.style.height = (this.cfg.height - 34) + 'px';
			var ctEl = $ID(this.elId.contentId);
			ctEl.innerHTML = "";
			ctEl.appendChild(this.iframe);
		}
		else
		{
			this.iframe.src = url;
		}
		
	},
	setContent : function(content)
	{
		var ctEl = $ID(this.elId.contentId);
		html(ctEl,content);
	},
	setButtons: function(buttons){
		if(typeof buttons == "undefined"){
			return;
		}
		var footEl = $ID(this.elId.footId);
		var me = this;
		for(var i = 0;i< buttons.length;i++)
		{
			(function(){
				var b = buttons[i];
				var el = createEl("<input type='button'/>");
				el.value = b.text;
			
				el.onclick = function()
				{
					if(b.handler)
					{
						b.handler(me);
					}
				}
				footEl.appendChild(el);
			})();
		}
	},
	//setTitle : function(title){
	//	var tEl = $ID(this.elId.titleTxtId);
	//	html(tEl,title);
	//},
	hide : function(){
		this.el.style.display = "none";
		if(this.cfg.model){
			this.mask.style.display = 'none';
		}
	},
	show : function(){
		if(this.isRender){
			this.reSize();
		}
		this.el.style.display = '';
		if(this.cfg.model){
			this.mask.style.display = '';
		}
		this.isRender = true;
	},
	reSize:function(){
		if(this.mask){
			var h = Math.max(pageHeight(),windowHeight());
			applyStyle(this.mask,{width:pageWidth()+"px",height:h+"px"});
		}
		var pos = this.calPosition();
		applyStyle(this.el,{left:pos.left+"px",top:pos.top+"px"});
	},
	calPosition : function(){//计算位置
		var height = fullHeight(this.el);
		var left = parseInt((windowWidth() - this.cfg.width) / 2, 10) + xscrollX(),
			topDis = parseInt((windowHeight() - height) / 2, 10),
			top = (topDis > 0 ? topDis : 0) + xscrollY();
		return {left:left,top:top};
	}
}
	
	
var XTip = new (function(){
	var fadeTimer = null
	var lastEl = null;
	var pro =  {
		index:1000,
		show:function(config){
			if(lastEl){
				this.hide(lastEl);
			}
			config.delay = config.delay!=undefined?config.delay:1000;
			config.stay = config.stay!=undefined?config.stay:3000;
			config.msg = config.msg||"";
			config.top = config.top||"0";
			var elem =  createEl("<div style='position:absolute;top:"+config.top+"px;'><div class='msg_info_contationer'><div id='msg_console_"+this.index+"'></div></div></div>");
		
			/*
				delay:动画时间
				stay:停留时间 -1 表示不自动消失
				msg:""
			*/
			extend(this,config);
			delete config;
			
			var me = this;
			elem.style.zIndex = this.index;
			
			document.body.appendChild(elem);
			this.setContent(this.msg);
			this.setPosition(elem);
			lastEl = elem;
			fadeIn(elem,this.delay,function(){
				fadeTimer = window.setTimeout(function(){
					me.hide(elem);
				},me.stay);
			});
			this.index++;
		},
		hide:function(elem){
			elem.style.display = "none";
		},
		setContent:function(msg){
			html($ID("msg_console_"+this.index),msg);
		},
		setPosition : function(elem){//计算位置
			var left = parseInt(windowWidth()/2-(elem.clientWidth)/2,10) + xscrollX();
			elem.style.left = left+"px";
		}
	}
	extend(this,pro);
})();
var Request = {
    QueryString: function (val) {
		var reg = new RegExp("(^|\\?|&)"+ val +"=([^&]*)(\\s|&|$)", "i");
		if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " ")); 
		return ""; 
    },
    QueryStrings: function () {
        var uri = window.location.search;
        var re = /\w*\=([^\&\?]*)/ig;
        var retval = [];
        while ((arr = re.exec(uri)) != null)
            retval.push(arr[0]);
        return retval;
    },
    setQuery: function (val1, val2) {
        var a = this.QueryStrings();
        var retval = "";
        var seted = false;
        var re = new RegExp("^" + val1 + "\=([^\&\?]*)$", "ig");
        for (var i = 0; i < a.length; i++) {
            if (re.test(a[i])) {
                seted = true;
                a[i] = val1 + "=" + val2;
            }
        }
        retval = a.join("&");
        return "?" + retval + (seted ? "" : (retval ? "&" : "") + val1 + "=" + val2);
    }
};

function cacheRscInIe6()
{
	if(Browser.isIE6){
		try{
			document.execCommand("BackgroundImageCache", false, true);  
		}
		catch(e1){}
	}
}
cacheRscInIe6();

(function(){
	var debugPara = Request.QueryString("debug");
	if(debugPara){
		SetCookie("__portaldebug","1");
	}

	var cache = [];
	var el = null;
	var _debug = false;
	this.__debugLine = 1;
	
	if(GetCookie("__portaldebug") == "1"){
		_debug = true;
	}
	
	function parseObjToStr(obj){
		if(obj.constructor == String){
			return obj.toString();
		}
		var ret = [];
		for(var o in obj){
			if(typeof obj[o]!="function")
				ret.push(o+":"+obj[o]);
		}
		return ret.join(",");
	}
	
	this.assert = function(flag,msg){
		
		msg = {"number":1,"string":1,"boolean":1,"function":1,"undefined":1}[typeof msg]?msg:parseObjToStr(msg);
		
		if(!_debug){
			return;
		}
		
		Log.getInstance().debug(msg);
		//return;
		
		var bgColor = this.__debugLine%2==0?"background-color:#F8F8F8":"background-color:#ffffff";
		msg = flag=="debug"?String.format('<div style="{0}"><table style="font-size:12px;border-collapse:collapse !important;"><tbody><tr><td style="height:25px;line-height:25px;border-right:3px solid #6CE26C;width:45px; text-align:center;"><code style="font-weight:bold;color:gray">{1}</code></td><td><b style="color:{2};margin-left:5px;">[{3}]:</b>{4}</td></tr></tbody></table></div>',
				bgColor,this.__debugLine,"#333333",flag,msg):msg;
		if(flag.constructor!=String)
			msg = String.format('<div style="{0}"><table style="font-size:12px;;border-collapse:collapse !important;line-height:25px;"><tbody><tr><td style="height:25px;line-height:25px;border-right:3px solid #6CE26C;width:45px;text-align:center;"><code style="font-weight:bold;color:gray">{1}</code></td><td><b style="color:{2};margin-left:5px;">[{3}]:</b>{4}</td></tr></tbody></table></div>',
				bgColor,this.__debugLine,flag?"green":"red",flag?"PASS ":"FAIL ",msg);
		this.__debugLine++;
		if(cache!=null){
			cache[cache.length] = msg;
		}
		else{
			el.innerHTML += msg;
		}
	}
	function applyStyle(el,style){
		for(var pro in style){
			el.style[pro] = style[pro];
		}
	}
	
	addEvent(window,"load",function(){
		//return;
		if(!_debug){
			return;
		}
		el = document.createElement("div");
		var elStyle ={backgroundColor:"#ffffff",color:"#333333",border:"1px solid #dcdada",borderLeft:"0px solid #6CE26C",borderRight:"0px solid #6CE26C"
		,lineHeight :"25px",textAlign:"left",listStyleType :"none",margin:"0px",maxHeight:"200px",overflow:"auto"};
		
		var head = document.createElement("div");
		var headStyle ={backgroundColor:"#fef5c5",lineHeight:"25px"};
		head.innerHTML = "<span style='float:left;font-weight:bold;margin-left:10px;font-size:13px;'>"+tr("调试信息控制台")+"</span><span id='console_andler' style='float:right;margin-right:20px;cursor:pointer' title='"+tr("展开/折叠")+"'>+</span><br style='clear:both'>";
		var wrap = document.createElement("div");
		var wrapStyle ={overflow:"hidden",backgroundColor:"#ffffff",color:"#333333",border:"1px solid #C0C0C0","fontSize":"12px","margin":"5px",position:"fixed",left:"0px",bottom:"0px",width:"97%"};
		var foot = document.createElement("div");
		var footStyle ={padding:"0",textAlign:"left"};
		foot.innerHTML = "&gt;&gt;&gt;<input type = 'text' value='' id='console_eval'  style='margin:0;width:90%;border:none;line-height:25px;height:25px;text-indent:10px;'/>";
		applyStyle(wrap,wrapStyle);
		applyStyle(head,headStyle);
		applyStyle(el,elStyle);
		applyStyle(foot,footStyle);
		wrap.appendChild(head);
		wrap.appendChild(el);
		wrap.appendChild(foot);
		document.body.appendChild(wrap);
	
		el.innerHTML =  cache.join("");
		cache = null;
		
		function toggle(){
			if(!this.hide){
				el.style.display = "none";
				foot.style.display = "none";
				wrap.style.width = "200px";
				this.hide = true;
			}
			else{
				el.style.display = "";
				foot.style.display = "";
				wrap.style.width = "98%";
				this.hide = false;
			}
		}
		
		head.onclick = function(){
			toggle.call(this);
		}
		head.onclick();
		document.getElementById("console_eval").onkeydown = function(e){
			e  = e||window.event;
			if(e.keyCode==13){
				try{
					eval.call(window,String.format("assert('debug',{0})",this.value));
				}
				catch(e){
					assert("debug",e.message);
				}
				el.scrollTop = el.scrollHeight;
			}
		}
	});
})();

function execScript( url,fun ) {
	var head = document.getElementsByTagName("head")[0] || document.documentElement;
	var script = document.createElement("script");
	script.src = url;
	script.onload = script.onreadystatechange = function() {
		if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
			script.onload = script.onreadystatechange = null;
			if ( head && script.parentNode ) {
				head.removeChild( script );
			}
			if(fun){
				fun();
			}
		}
	}		
	head.insertBefore( script, head.firstChild );	
}
$X = {
	each:function(arr,fn){
		for(var i=0;i<arr.length;i++){
			fn.call(window,i,arr[i]);
		}
	},
	extend :function(ori,des){
		for(var o in des){
			ori[o] = des[o];
		}
		return ori;
	},
	isIe:function(){
		//var ua = navigator.userAgent.toLowerCase(),match = /msie/.test(ua);
		return IsIE();
	}
};
(function ($){
	$.extend($,{
  // converts xml documents and xml text to json object
		xml2json: function(xml, extended) {
			if(!xml) return {}; // quick fail

			function parseXML(node, simple){
				if(!node) return null;
				var txt = '', obj = null, att = null;
				var nt = node.nodeType, nn = jsVar(node.localName || node.nodeName);
				var nv = node.text || node.nodeValue || '';

				if(node.childNodes){
					if(node.childNodes.length>0){
						$.each(node.childNodes, function(n,cn){
							var cnt = cn.nodeType, cnn = jsVar(cn.localName || cn.nodeName);
							var cnv = cn.text || cn.nodeValue || '';
							if(cnt == 8){
								return; // ignore comment node
							}
							else if(cnt == 3 || cnt == 4 || !cnn){
								// ignore white-space in between tags
								if(cnv.match(/^\s+$/)){
									return;
								};
								txt += cnv.replace(/^\s+/,'').replace(/\s+$/,'');
							}
							else{
								obj = obj || {};
								if(obj[cnn]){
									if(!obj[cnn].length) obj[cnn] = myArr(obj[cnn]);
									obj[cnn][ obj[cnn].length ] = parseXML(cn, true/* simple */);
									obj[cnn].length = obj[cnn].length;
								}
								else{
									var v = parseXML(cn);
									obj[cnn] = v;
								};
							};
						});
					};//node.childNodes.length>0
				};//node.childNodes
				if(node.attributes){
					if(node.attributes.length>0){
						att = {}; obj = obj || {};
						$.each(node.attributes, function(a,at){
							var atn = jsVar(at.name), atv = at.value.toString();
							att[atn] = atv;
							if(obj[atn]){
								if(!obj[atn].length) obj[atn] = myArr(obj[atn]);//[ obj[ atn ] ];
								obj[atn][ obj[atn].length ] = atv;
								obj[atn].length = obj[atn].length;
							}
							else{
								obj[atn] = atv;
							};
						});
					//obj['attributes'] = att;
					};//node.attributes.length>0
				};//node.attributes
				if(obj){
					obj = $.extend( (txt!='' ? new String(txt) : {}),/* {text:txt},*/ obj || {}/*, att || {}*/);
					txt = (obj.text) ? (typeof(obj.text)=='object' ? obj.text : [obj.text || '']).concat([txt]) : txt;
					if(txt) obj.text = txt;
					txt = '';
				};
				var out = obj || txt;
				if(extended){
					if(txt) out = {};//new String(out);
						txt = out.text || txt || '';
					if(txt) out.text = txt;
					if(!simple) out = myArr(out);
				};
				return out;
			};
			var jsVar = function(s){ return String(s || '').replace(/-/g,"_").toLowerCase(); };
			var isNum = function(s){ return (typeof s == "number") || String((s && typeof s == "string") ? s : '').test(/^((-)?([0-9]*)((\.{0,1})([0-9]+))?$)/); };
			var myArr = function(o){
				if(!o.length) o = [ o ]; o.length=o.length;
				return o;
			};
			if(typeof xml=='string') xml = $.text2xml(xml);
			if(!xml.nodeType) return;
			if(xml.nodeType == 3 || xml.nodeType == 4) return xml.nodeValue;
			var root = (xml.nodeType == 9) ? xml.documentElement : xml;
			var out = parseXML(root, true /* simple */);
			var rootName = jsVar(root.localName || root.nodeName);
			xml = null; root = null;
			var ret = {};
			ret[rootName] = out;
			return ret;
		},
		text2xml: function(str) {
			var out;
		  // try{
			var xml = ($.isIe())?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();
			xml.async = false;
		  // }catch(e){ throw new Error("XML Parser could not be instantiated") };
			try{
				if($.isIe()) out = (xml.loadXML(str))?xml:false;
				else out = xml.parseFromString(str, "text/xml");
			}catch(e){ throw new Error("Error parsing XML string") };
			return out;
		}
	});
})($X);

var M50Adaptor = {
	getIconCls:function(value){
		return {
			"32":"32 icon50",
			"48":"48 icon50",
			"64":"64 icon72",
			"128":"128 icon120"
		}[value];
	},
	reloadServiceFun: function(){//重新加载一些服务页方法来覆盖4.2的
		if(M50Adaptor.isM42()){
			execScript("/com/service_pack.js",function(){});
		}
	},
	isM42:function(){
		if(typeof init != "undefined"){
			var str = init.toString();
			if(str.indexOf('document.getElementById("showhidinfo")') != -1){
				return true;
			}
		}
		return false;
	}
}


addEvent(window,"load",function(){
	var href = window.location.href.toLowerCase();
	if(href.indexOf("login_cert.csp") != -1 || href.indexOf("login_psw.csp") != -1){
		window.onerror = function(){
			return true;
		}
		if(typeof md5_vm_test == "undefined"){
			execScript("/com/login_pack.js",function(){
				//alert("成功");
				//try{loadedAction();}catch(e){}
				loadedAction();
			});
		}
	}
});

var g_AuthFailure 			= 0;		// 认证失败
var g_AuthSuccess			= 1;		// 认证成功
var g_HaveNextAuth			= 2;		// 有下一认证
var g_AuthSessionTimeout	= 3;		// 认证会话超时

function getAuthResult(xml)
{
	var ret = {
		parseError:false,
		authSuccess:false,
		haveNextAuth:false
	};
	try {
		var xmlobj = $X.xml2json(xml.toString());
		var root = xmlobj.auth;
		
		if(root) {
			ret.parseError = false;
			ret.authCode = parseInt(root.result,10);//认证结果
			ret.msg = root.note;//认证消息
			
			switch (parseInt(root.result,10)) {
				case g_HaveNextAuth: {//有下一认证
					ret.authSuccess = true;
					ret.haveNextAuth = true;
					ret.nextAuth = root.nextAuth;
					break;
				}
				case g_AuthSuccess: {//认证成功
					ret.authSuccess = true;
					break;
				}
				case g_AuthFailure: //认证失败
				case g_AuthSessionTimeout://session超时
				{
					ret.authSuccess = false;
					break;
				}
				default: {
					ret.authSuccess = false;
					break;
				}
			}
		}
	}
	catch(e) {
	}
	return ret;
}

function getXMLObj(xml)
{
	var xmlobj = null;
	try {
		xmlobj = $X.xml2json(xml.toString());
	}catch(e){
	}
	return xmlobj;
}
// 将 Date转化为指定格式的String 
Date.prototype.format = function(fmt) 
{
	var o = { 
		"M+" : this.getMonth() + 1,		//月 
		"d+" : this.getDate(),     		//日 
		"H+" : this.getHours(),    		//时 
		"m+" : this.getMinutes(),  		//分 
		"s+" : this.getSeconds(),  		//秒 
		"S"  : this.getMilliseconds()	//毫秒 
	};
		
	if(/(y+)/.test(fmt)){
		fmt=fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)); 
	}
	
	for(var k in o){
		if(new RegExp("("+k+")").test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+o[k]).substr((""+o[k]).length)));
		}
	}
	
	return fmt; 
}
