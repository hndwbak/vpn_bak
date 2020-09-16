
/* 
 语言转换函数 
 移植自M5.3EN, 修改了Cookie设置(为各平台一致,单独language字段,不再使用COOKIE集)
 2014-11-18 by xgx 
*/
(function(){
	var languageList = ['zh_CN', 'en_US'];	//语言列表
	var defaultLanguage = 'en_US';		//默认语言
	var isIE = /(msie\s|trident.*rv:)([\w.]+)/.test(navigator.userAgent.toLowerCase());
	var formatArgsStore, locationStore;
	//语言包使用的是HTML语法格式，需转换成JavaScript String格式
	var jsString = (function(){
		var rs = [/&quot;/g, /&lt;/g, /&gt;/g, /&amp;/g];
		return function(str){
			return String(str).replace(rs[0], '"').replace(rs[1], '<').replace(rs[2], '>').replace(rs[3], '&');
		}
	})();
	
	//HTML代码中存在<br>等情况，需要转换成HTML String格式
	var htmlKey = (function(){
		var rs = [/&/g, /</g, />/g, /"/g];
		return function(str){
			return String(str).replace(rs[0], '&amp;').replace(rs[1], '&lt;').replace(rs[2], '&gt;').replace(rs[3], '&quot;');
		}
	})();
	
	//HTML中存在&amp;nbsp;等情况的转义，需要转换成&nbsp;
	var htmlString = (function(){
		var rs = [/&lt;/g, /&gt;/g, /&amp;/g];
		return function(str){
			return String(str).replace(rs[0], '<').replace(rs[1], '>').replace(rs[2], '&');
		}
	})();
	
	/*支持扩展语言包变量 window.LanguageExpand 示例：window.LanguageExpand = {
			zh_CN: {
				'Key1': 'Value1',
				'Key2': 'Value2'
			}
		}
	*/
	function _init(){
		if(!window.LANG){
			window.LANG = {};
		}
		if(window.LanguageExpand && typeof window.LanguageExpand == 'object'){
			var pack = window.LanguageExpand[window.language];
			if(pack && typeof pack == 'object'){
				for(var prop in pack){
					if(pack.hasOwnProperty(prop)){
						window.LANG[prop] = pack[prop];
					}
				}
			}
			delete window.LanguageExpand;
		}
	}
	//输出JavaScript多语言文字
	window.tr = function(json_key){
		_init();
		var result = window.LANG[json_key];
		if(result == null && json_key.length > 16){	//编写Key，前8个字符+后8个字符
			result = window.LANG[json_key.substr(0, 8) + '+' + json_key.substr(json_key.length - 8)];
		}
		if(result == null){
			result = json_key;
		}
		result = result.replace(/\{#[\d]+\}/g, '');
		if(arguments.length > 1){
			var values = Array.prototype.slice.call(arguments, 1);
			return jsString(result.replace(/\{(\d+)\}/g, function(m, i){
				return values[i] == null ? '' : values[i];
			}));
		}else{
			return jsString(result);
		}
	}
	//输出HTML多语言文字（主要是放弃处理转义符）
	window.htmltr = function(json_key){
		_init();
		var html_key = htmlKey(json_key),
			result = window.LANG[html_key];
		if(result == null && html_key.length > 16){	//编写Key，前8个字符+后8个字符
			result = window.LANG[html_key.substr(0, 8) + '+' + html_key.substr(html_key.length - 8)];
		}
		if(result == null){
			result = json_key;
		}
		result = result.replace(/\{#[\d]+\}/g, '');
		if(arguments.length > 1){
			var values = Array.prototype.slice.call(arguments, 1);
			return htmlString(result.replace(/\{(\d+)\}/g, function(m, i){
				return values[i] == null ? '' : values[i];
			}));
		}else{
			return htmlString(result);
		}
	}
	//格式化字符串
	window.format = function(str){
		if(arguments.length > 1){
			var values = Array.prototype.slice.call(arguments, 1);
			return str.replace(/\{(\d+)\}/g, function(m, i){
				return values[i] == null ? '' : values[i];
			});
		}else{
			return str;
		}
	}
	//内部函数，处理自定义HTML属性输出
	function _setLang(){
		if(document.body){
			var bodyClass = document.body.className;
			//去除其他语言的classname
			for(var i=0, len=languageList.length; i<len; i++){
				bodyClass = bodyClass.replace(languageList[i],'');
			}
			bodyClass += (' ' + window.language);
			document.body.className = bodyClass;
		}
		var els = document.getElementsByTagName('*'),
			nameArr = ['html', 'value', 'title', 'alt'],
			_els = [];
		for(var i=0, len = els.length; i<len; i++){	//注意：getElementsByTagName('*')返回的是可变列表，必需先转成数组
			_els[i] = els[i];
		}
		for(var i=0, len = _els.length; i<len; i++){
			var el = _els[i];
			for(var j=0, jlen = nameArr.length; j<jlen; j++){
				var name = nameArr[j],
					_name = '_' + name,
					_formatArgsName = _name + 'FormatArgs',
					_index = 0,
					_el = null,
					args = null,
					text = null,
					formatArgsEl = null;
				if(el.getAttribute(_name)){
					if(el.getAttribute(_formatArgsName)){
						args = formatArgsStore[el.getAttribute(_formatArgsName)];	//正常的字符串，可以用变量声明
						if(args == null){
							formatArgsEl = document.getElementById(el.getAttribute(_formatArgsName));	//带换行的字符串，请使用元素声明
							if(formatArgsEl && formatArgsEl.childNodes.length > 0){
								args = [];
								_index = 0;
								for(var x=0, xlen = formatArgsEl.childNodes.length; x<xlen; x++){
									_el = formatArgsEl.childNodes[x];
									if(_el && _el.tagName){
										args[_index] = _el.innerHTML;
										_index++;
									}
								}
							}
						}
					}
					if(args != null){
						if(Object.prototype.toString.apply(args) === '[object Array]'){
							text = htmltr.apply(window, [el.getAttribute(_name)].concat(args));
						}else{
							text = htmltr(el.getAttribute(_name), args);
						}
					}else{
						text = htmltr(el.getAttribute(_name));
					}
					if(name === 'html'){
						el.innerHTML = text;
					}else{
						el.setAttribute(name, text);
					}
				}
			}
		}
		//设置title，兼容IE
		var title = document.getElementById('titleInnerHTML');
		if(title){
			document.title = tr(title.innerHTML);
		}
	}
	//获取URL参数
	function _request(name){
		if(!locationStore){
			var search = window.location.search.substr(1),
				store = {},
				joinKey = '&',
				equalKey = '=',
				i = 0,
				len = search.length;
			while(i < len){
				var index = search.indexOf(joinKey, i),
					key,
					value,
					equalIndex = -1,
					item;
				if(index !== -1){
					item = search.substr(i, index - i);
					i = index + joinKey.length;
				}else{
					item = search.substr(i);
					i = search.length;
				}
				equalIndex = item.indexOf(equalKey);
				if(equalIndex !== -1){
					key = item.substr(0, equalIndex);
					value = item.substr(equalIndex + equalKey.length);
					try{
						store[key.toLowerCase()] = decodeURIComponent(value);
					}catch(ex){
						store[key.toLowerCase()] = value;
					}
				}
			}
			locationStore = store;
		}
		return !name ? locationStore : locationStore[String(name).toLowerCase()];
	}
	/*
		@ formatArgs 格式化参数，示例：{
										a: ['<a href="">', '</a>'],
										b: ['<span>', '</span>']
									}
	*/
	window.setLang = function(formatArgs){
		formatArgsStore = formatArgs || {};
		if(_getCookie('language') && !window.LANG){	//延时处理
			if(window.attachEvent){
				window.attachEvent('onload', _setLang);
			}else{
				window.addEventListener('load', _setLang, false);
			}
		}else{
			_setLang();
		}
	}
	//切换语言language: zh_CN, en_US...
	window.toLang = function(language){
		if(!window.LANG_RELOAD){
			var baseUrl = window.location.pathname;
			if(baseUrl.indexOf('login_token.csp') !== -1){
				baseUrl = '/por/login_psw.csp';
			}
			if(window.location.search.length > 1){
				var data = _request(),
					temp = [];
				for(var j in data){
					if(data.hasOwnProperty(j)){
						if(j !== 'language'){
							temp.push(j + '=' + encodeURIComponent(data[j]));
						}
					}
				}
				temp.push('language=' + language);
				window.location.href = baseUrl + '?' + temp.join('&');
			}else{
				window.location.href = baseUrl + '?language=' + language;
			}
		}else{
			_setCookie('language', language, new Date(2999,1,1), '/', null, true);
			window.location.reload();
		}
	}
	function _getCookie(name){
		var arg = name + '=',
			alen = arg.length,
			clen = document.cookie.length,
			ret = '',
			i = 0;
		while (i < clen) {
			var j = i + alen;
			if (document.cookie.substring(i, j) === arg) {
				var index = document.cookie.indexOf(';', j);
				if (index === -1) {
					index = clen;
				}
				ret = unescape(document.cookie.substring(j, index));
			}
			i = document.cookie.indexOf(' ', i) + 1;
			if (i === 0) {
				break;
			}
		}
		return ret;
	}
	function _setCookie(name, value){
		var argv = arguments;
		var argc = arguments.length;
		var expires = (argc > 2) ? argv[2] : null;
		var path = (argc > 3) ? argv[3] : '/';
		var domain = (argc > 4) ? argv[4] : null;
		var secure = (argc > 5) ? argv[5] : false;
		document.cookie = name + "=" + escape(value) + ((expires === null) ? "" : ("; expires=" + expires.toGMTString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
	}
	if(!window.DISABLE_LANGUAGE){	//标记用于por/logout.tml不需要读取语言环境，要不然会有bug
		var language = _request('language');
		//var debugger_msg = [];
		if(!language){
			//debugger_msg.push('1、无URL参数，走Cookie检查！');
			language = _getCookie('language');
		}
		//只有在登陆页面，IE才走这个流程
		if(!language && isIE){
			//debugger_msg.push('2、Cookie不存在，IE下走控件方式！');
			var obj = null;
			try{
				obj = new ActiveXObject('CSClientManagerPrj.CSClientManager.1');
				//debugger_msg.push('3、控件创建成功！');
			}catch(ex){
				obj = null;
				//debugger_msg.push('3、检查创建失败！');
			}
			if(obj){
				try{
					var _lang = String(obj.doQueryService('QUERY LANG'));
					if(_lang !== ''){
						_lang = _lang.deSerialize();
						if(_lang.argument && (_lang.argument === 'zh_CN' || _lang.argument === 'en_US')){
							language = _lang.argument;
							//debugger_msg.push('4、通过控件读取语言成功！');
						}
					}
				}catch(ex){
					language = null;
					//debugger_msg.push('4、通过控件读取语言失败！');
				}
			}
			obj = null;
		}
		if(!language){
			//debugger_msg.push('5、通过浏览器读取语言！');
			language = String(window.navigator.language || window.navigator.systemLanguage || window.navigator.userLanguage || window.navigator.browserLanguage).toLowerCase();
			switch(language){
				case 'zh-cn':
					language = 'zh_CN'; break;
				case '': //获取不到语言的时候根据版本选择语言
					if(window.LANG_VERSION && window.LANG_VERSION.isInternational) {
						language = 'en_US';
					} else {
						language = 'zh_CN'; 
					}
					break;	
				default:
					language = defaultLanguage; break;
			}
		}
		//debugger_msg.push('6、语言读取为' + language);
		//根据语言列表选择语言, cookie传来的值不可信任
		var languageName = defaultLanguage;
		for(var i=0, len=languageList.length; i<len; i++){
			if(languageList[i] === language){
				languageName = languageList[i];
				break;
			}
		}
		
		window.language = languageName;
		_setCookie('language', languageName, new Date(2999,1,1), '/', null, true);
		/* //统一为单独cookie 不再同步 2014-11-18 by xgx
		if(perCookie.getBaseCookie('language')){	//ios同时可能存在两个Cookie,需要同步
			perCookie.setBaseCookie('language', window.language);
		}
		*/
		if(languageName !== 'zh_CN'){
			document.write(['<script src="/com/lang/language.', languageName, '.json"><\/script>'].join(''));
		}
		//alert(debugger_msg.join('\r\n'));
	}
})();
/*end M6.8 EN*/