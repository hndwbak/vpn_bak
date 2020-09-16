
if(isMordernIE()){
	window.location.href = "/com/mode_warn.html";
}

function showCheckMsg(msg)
{
	var con = $ID("msg_info_con");
	if(con)
	{
		document.body.removeChild(con);
	}

	var con = create("div");
	con.id = "msg_info_con";
	var img = create("img");
	img.src = "/com/images/prompt/prompt.png";
	var elem = create("div");
	elem.id = "msg_info_prompt";
	var elem_text = create("div");
	elem_text.id = "msg_info_text";
	var conStyle = {position:"absolute", left:"2px", top:"20px", width:"500px", zIndex:"19998"};
	var imgStyle = {position:"absolute", left:"5%", top:"0px", zIndex:"19999"};
	var pptStyle = {position:"absolute", left:"25%", top:"0px", width:"100%",
			lineHeight:"20px", borderBottom:"#ccc 1px dotted", padding:"8px 0px 3px 5px", zIndex:"20000", fontSize:"18px", fontWeight:"bold"};
	var textStyle = {position:"absolute", left:"25%", top:"30px", width:"100%",
			lineHeight:"24px",padding:"10px 0px 3px 6px", textAlign:"left",zIndex:"20001",fontSize:"12px"};
	for(var pro in conStyle)
	{
		con.style[pro] = conStyle[pro];
	}
	for(var pro in imgStyle)
	{
		img.style[pro] = imgStyle[pro];
	}
	for(var pro in pptStyle)
	{
		elem.style[pro] = pptStyle[pro];
	}
	for(var pro in textStyle)
	{
		elem_text.style[pro] = textStyle[pro];
	}
	elem.innerHTML = tr("提示");
	elem_text.innerHTML = msg;
	document.body.appendChild(con);
	var cont = $ID("msg_info_con");
	cont.appendChild(img);
	cont.appendChild(elem);
	cont.appendChild(elem_text);
}
function hideCheckMsg(){
	var con = $ID("msg_info_con");
	if(con)
	{
		document.body.removeChild(con);
	}
	var textEl = $ID("msg_info_text");
	if(textEl)
	{
		document.body.removeChild(textEl);
	}
}
function create(elem) 
{
    return document.createElementNS ?
      document.createElementNS('http://www.w3.org/1999/xhtml', elem) :
      document.createElement(elem);
}

//level：0-100
function setOpacity(elem, level) {
    if (elem.filters) 
	{
        elem.style.filter = 'alpha(opacity=' + level + ')';
    }
    else 
	{
        elem.style.opacity = level / 100;
    }
}

function fadeIn(elem) {
    setOpacity(elem, 0);
    for (var i = 0; i <= 150; i += 5)
	{
        (function ()
		{
            var pos = i;
            setTimeout(function () 
			{
                setOpacity(elem, pos);
            }, (pos + 1) * 10);   //因为是同一时间定时，所有定时器同一时间启动，当pos==100时时长1010
        }
		)();
    }
} 

function OutputObject()
{
	var elem = create("div");
	elem.innerHTML = '<object classid="CLSID:D05678D4-B66E-4269-A556-18E7B1FF7E7A" codebase="/com/win/Deal64SysPrj.CAB#Version=1,0,0,2" 	width=100% height=10% 	name="Deal64SysObj" style="visibility:hidden;"></object>';
	document.body.appendChild(elem);
}

function disableLoginEl()
{
	var eles = ["log0","log1","svpn_name","svpn_password", "logButton"];
	for(var i = 0,len = eles.length;i<len;i++)
	{
		var el = $ID(eles[i]);
		if(el)
		{
			//el.style.disabled = true;
			el.disabled = true;
			if(el.tagName === 'A'){
				el.href = 'javascript:void(0)';
			}
		}
	}
}

/**
*登录页用到的方法
*/
function CheckDeal64Sys(type)
{
	var Obj = null, version = 0;
	try
	{
		Obj = new ActiveXObject("Deal64SysPrj.Deal64Sys.1");
		try{
			version = Obj.IsDllVersionEqual('1, 0, 0, 2');
		}catch(ex){
			version = 0;
		}
		if(!version){
			window.setTimeout("CheckDeal64Sys('" + type + "')", 200);
			return;
		}
	}
	catch(e)
	{
		window.setTimeout("CheckDeal64Sys('" + type + "')", 200);
		return;
	}
	var r = Obj.Create32IeProcess(window.location.href);
	if(!r)
	{
		hideCheckMsg();
		//onCheck64Error('启动32位IE失败，请手动启动，32位IE程序路径：“c:\\Program Files (x86)\\Internet Explorer\\iexplore.exe”!');
		return;
	}
	if (type === 'login') {
		disableLoginEl();
	}
	document.title = tr('--64位IE浏览器--');
	onCheck64Error(tr('系统已为您启动了32位IE，请使用32位IE进行操作，您可以手动关闭本窗口。'));
	//window.location = 'https://' + window.location.host + '/por/logout.csp?toClose=1';
	//Close();
}

function InitFor64(type)
{
	if (Browser.is64 && Browser.isIE)
	{
		var Obj, version = 0;
		try
		{
			Obj = new ActiveXObject("Deal64SysPrj.Deal64Sys.1");
			try{
				version = Obj.IsDllVersionEqual('1, 0, 0, 2');
			}catch(ex){
				version = 0;
			}
			if(!version){
				bodyMask.show();
				onCheck64Error(tr("您使用的是64位IE，正在安装64位处理控件...；&lt;br/&gt;如果没有看到安装提示或者无法安装，原因可能如下：&lt;br/&gt;1.浏览器开启了增强保护模式，请选择IE&quot;工具&quot;菜单中&quot;Internet选项&quot;，然后在该弹出框中的&quot;高级&quot;标签，并将列表中&quot;安全&quot;部分中的&quot;启用增强保护模式&quot;的勾选取消"));	// **luyi** 提示升级控件
				OutputObject();
				window.setTimeout("CheckDeal64Sys('" + type + "')", 200);
				return;
			}
		}
		catch(e){
			bodyMask.show();
			onCheck64Error(tr("您使用的是64位IE，正在安装64位处理控件...；&lt;br/&gt;如果没有看到安装提示或者无法安装，原因可能如下：&lt;br/&gt;1.浏览器开启了增强保护模式，请选择IE&quot;工具&quot;菜单中&quot;Internet选项&quot;，然后在该弹出框中的&quot;高级&quot;标签，并将列表中&quot;安全&quot;部分中的&quot;启用增强保护模式&quot;的勾选取消"));	// **luyi** 提示安装控件
			OutputObject();
			window.setTimeout("CheckDeal64Sys('" + type + "')", 200);
			return;
		}
		bodyMask.show();
		onCheck64Error(tr('您使用的是64位IE，正在自动跳转，请稍后...'));
		var r = Obj.Create32IeProcess(window.location.href);
		if(!r) {
			hideCheckMsg();
			//onCheck64Error('启动32位IE失败，请手动启动，32位IE程序路径：“c:\\Program Files (x86)\\Internet Explorer\\iexplore.exe”!');
			return;
		}
		if (type === 'login') {
			disableLoginEl();
		}
		document.title = tr('--64位IE浏览器--');
		onCheck64Error(tr('系统已为您启动了32位IE，请使用32位IE进行操作，您可以手动关闭本窗口。'));
		//window.location = 'https://' + window.location.host + '/por/logout.csp?toClose=1';
		//Close();
	}
}
/*
*服务页用到的方法
*/
function check64OnSvrPage(){
	var Obj = null;
	try{
		Obj = new ActiveXObject("CSClientManagerPrj.CSClientManager.1");
		var flag = Obj.IsX64Sys;
		if(flag)
		{
			onCheck64Error(tr('您使用的是64位系统，如果手动启用IE或C/S资源客户端，请使用相应的32位程序；&lt;br/&gt;系统32位进程目录：“C:\\Windows\\SysWOW64\\”；默认安装32位程序目录：“C:\\Program Files(x86)\\”!'));
		}
		return flag;
	}
	catch(e)
	{
		//onCheck64Error('您使用的是64位系统，请使用32位的IE或C/S资源客户端程序；系统32位进程目录：“C:\\Windows\\SysWOW64\\”；默认安装32位程序目录：“C:\\Program Files(x86)\\”!')
		return false;
	}
}
function onCheck64Error(msg){
	showCheckMsg(msg);
}

var checkSupport64 = function () {
	if (!navigator.cpuClass) {
		navigator.cpuClass = Browser.is64 ? 'x64' : 'x86';
	}
	return function () {
		if (Browser.is64 && !Browser.isIE) {
			return false;
		}
		return true;
	}
} ();

var bodyMask = (function(){
	var el;
	function getEl(){
		if(!el){
			el = document.createElement('div');
			el.style.background = 'url(/com/images/setting_bg.png) #dbdee3 repeat-x';
			el.style.width = '101%';
			el.style.minWidth = "500px";
			el.style.height = '100%';
			el.style.position = 'absolute';
			el.style.top = '0px';
			el.style.left = '0px';
			el.style.display = 'none';
			el.style.zIndex = '1000';
			document.body.appendChild(el);
		}
		return el;
	}
	return {
		show: function(){
			getEl().style.display = 'block';
		},
		hide: function(){
			getEl().style.display = 'none';
		}
	}
})();