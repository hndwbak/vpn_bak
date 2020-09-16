var jreData = [];

// 如果不是IE，加入这个
if(!Browser.isIE){
	document.write("<script type=\"text/javascript\" charset='utf-8' src=\"/com/deployJava.js\"><\/scr"+"ipt>");
}

var E_OK = 1,E_FAIL  = 1 << 1, E_UNKNOWN = 1 << 2,E_PENDING = 1 << 3,E_NO_RIGHT = 1 << 4,E_REPAIR     = 1 << 5;  //OK//Fail//Unknown//Running//No permiss//Repaire
var E_INSTALL = 1 << 6,E_UNINSTALL  = 1 << 7,E_UPDATE = 1 << 8,E_RESTART_IE = 1 << 9,E_RELOGIN = 1 << 10;     //Install //UnInstall//UPdate//Restart IEcon
var DKEY_DISABLE = 0,DKEY_ENABLE_V2 = 1 << 0,DKEY_ENABLE_V3 = 1 << 1;
var DKEY_ENABLE_BOTH = DKEY_ENABLE_V2 | DKEY_ENABLE_V3;
var INST_COMP = 4;

var DKEY_HAVE_UNKNOWN   = -1;
var DKEY_HAVE_NONE      = DKEY_DISABLE;
var DKEY_HAVE_V2        = DKEY_ENABLE_V2;
var DKEY_HAVE_V3        = DKEY_ENABLE_V3;
var DKEY_HAVE_BOTH      = DKEY_ENABLE_BOTH; 


var DKEY_READY_INSTALL_CSCM  = "100"; //It's going to install CSCM.
var DKEY_INSTALLCSCM_OR_CREATEERR = "200";//== 200 means MSCM install or create object error

//DLL索引
var ID_CSCM      = 0;
var ID_EPND      = ID_CSCM + 1;
var ID_IEHELPER  = ID_EPND + 1;
var ID_CLIENTNSP = ID_IEHELPER + 1;
var ID_PROXYIE   = ID_CLIENTNSP + 1;
var ID_SSOCLIENT = ID_PROXYIE + 1;
var ID_COMPINSP  = ID_SSOCLIENT + 1;
var ID_HARDID    = ID_COMPINSP + 1;
var ID_SDDN      = ID_HARDID + 1;
var ID_HTP		 = ID_SDDN + 1; 
var ID_SUPERSERVICE = ID_HTP + 1;
var ID_SUPEREXE = ID_SUPERSERVICE + 1;
var ID_NDDKEYV3 =  ID_SUPEREXE + 1;
var ID_NDDKEYV2 = ID_NDDKEYV3  + 1;
 
var ID_SINFORUI =  ID_NDDKEYV2 +1;
var ID_SVPNJOBBER = ID_SINFORUI + 1;
//var ID_SVPNHTPDEV = ID_SVPNJOBBER+1;

//var ID_SANGFORSDUI 	= ID_SVPNHTPDEV + 1;
var ID_SANGFORSDUI 	= ID_SVPNJOBBER + 1;
var ID_SANGFORSD	= ID_SANGFORSDUI + 1;
var ID_DETOUR		= ID_SANGFORSD + 1;
var ID_MAC_CSCM		= ID_DETOUR + 1;

var ID_DLL_MAX  = ID_MAC_CSCM + 1;
//DLL index

var ID_NAME     = 0;
var ID_VER      = ID_NAME + 1;
var ID_FILE     = ID_VER + 1;
var ID_PROGID   = ID_FILE + 1;
var ID_CODEBASE = ID_PROGID + 1;
var VERSION_MAC_CSLIENT = "7.1.301.35534";

var G_DLLS = new Array(ID_DLL_MAX+1);

G_DLLS[ID_CSCM]      = ["<%COM_CSCM_NAME%>", "0,0,0,0", "CSClientManagerPrj.dll", "CSClientManagerPrj.CSClientManager.1", "/com/win/CSClientManagerPrj.CAB"];
G_DLLS[ID_IEHELPER]  = ["<%COM_IEHELPER_NAME%>", "0,0,0,0",  "SangforBHO.dll", "SangforBHO.SangforHelper.1", "/com/win/SangforBHO.CAB"];
G_DLLS[ID_SUPEREXE] = ["SuperExe",   "7,1,0,0"," "," ", "/com/win/SuperExeInstaller.exe"];
G_DLLS[ID_SSOCLIENT] = ["<%COM_SSO_NAME%>",   "0,0,0,0",  "SSOClientPrj.dll", "SSOClientPrj.Web2Client.1", "/com/win/SSOClientPrj.CAB"];
G_DLLS[ID_MAC_CSCM] = ["MacCscm",   "6.3.0.0",  "", "", "/com/EasyConnectPlugin.dmg"];

var g_ProxyieObj = null,g_SsoObj= null,g_CscmObj  = null,g_IEHelperObj = null;
var g_bNeedIstallCSCM = false;
var g_IpSupportState = "0";
var g_AppSupportState = "0";
var g_onlyUseWebSvr = "";
var pageHref = window.location.href;


/* 
    页面状态管理 
    在cookie中写入状态
*/
PageStateManager = new (function(){
	this.setState = function(state){
		Cookie.setCookie("page_state",state);
	}
	this.getState = function(){
		return Cookie.getCookie("page_state");
	}
	this.inGetRcByService = function(){//安装控件中
		this.setState("getrc");
	}
	this.inIstCtrl = function(){//安装控件中
		this.setState("istctrl");
	}
	this.inUpdateCtrl = function(){//更新控件中
		this.setState("updatectrl");
	}
	this.inStartService = function(){//启动服务中
		this.setState("startservice");
	}
	this.inStarted = function(){//已启动
		this.setState("started");
	}
	this.isStarted = function(){
		//return false;
		return this.getState() == "started";
	}

	var state = Cookie.getCookie("page_state");
	if(state==null){
		this.setState("started");
	}
})();




/*
 * Judge Administator
 * @param cscmObj ClientManager object
 * @return Administator return true，otherwise return false
 */
function IsAdminAccount(cscmObj)
{
	var admin = 0x220;
	return cscmObj.loginAccountType == admin;
}
/*
 * Judge super administrtor
 * @param cscmObj ClientManager object
 * @return super administrator retur true，otherwise return false
 */
function IsPowerUserAccount(cscmObj)
{
	var powerUser = 0x223;
	return cscmObj.loginAccountType == powerUser;
}

/////////////////////////////////////////
// component install function
/////////////////////////////////////////
/*
 * @param cscmObj   ClientManager object
 *        codebase  CAB path
 *        file     DLL file
 * @return success reutr true,otherwise return false
 */
function InstallDllByCAB(cscmObj, codebase, file)
{
	var url = GetHostPath(codebase);
	try{		
		return 1 == cscmObj.InstallClientInetComCAB(url, file);
	}
	catch(e){
		return false;
	}
}


function GetHostPath(path)
{
	var loc = window.location;
	return loc.protocol + "//" + loc.host + path;
}
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


//是否在安全桌面中
function isInSecDesktop(){
	if(g_CscmObj&&IsIE()){
		return !!parseInt(g_CscmObj.IsRunInSD,10);
	}
	return false;
}

/*
 * Install Client Manager
 * return

 */
function InstallCSCM()
{
	g_NoPrompt = true;
	g_bNeedIstallCSCM = true;
	try{
		var url = window.location.href;
		Cookie.setCookie("lastPage",url);
	}catch(ex){}
	window.location.href = "/com/installCSCM.html";
}
/*
 * Update Client Manager
 * @return CSCM No install return E_INSTALL
 *         No permiss return E_NO_RIGHT
 *         Uninstall Fail retur E_UNINSTALL
 *         Install Fail retur E_FAIL
 *         Success return E_OK
 */
function UpdateCSCM(){
	
	var codeBase   = G_DLLS[ID_CSCM][ID_CODEBASE];
	var progid     = G_DLLS[ID_CSCM][ID_PROGID];
	var progFile = G_DLLS[ID_CSCM][ID_FILE];
	if(g_CscmObj == null)
	{
		g_CscmObj = CreateObject(progid);
	}
	if( g_CscmObj == null )
	{
		return E_INSTALL;
	}
	
	var isHaveNoRight = !IsAdminAccount(g_CscmObj);
	//1，0，0，19之前的版本是不支持提升权限的，所以都需要管理员权限安装
	var cscmVersion = g_CscmObj.SelfVersion;
	var compareVersion = g_CscmObj.CompareVersion(cscmVersion,"1,0,0,19");	
	var compareOldVersion = g_CscmObj.CompareVersion(cscmVersion,"4,3,0,0");	
	if ( isHaveNoRight  && compareVersion < 0 )//没有权限并且1,0,0,19之前的CSCM，直接返回没有权限
	{
		return E_NO_RIGHT;
	}
	
	//1,0,0,19之后的版本
	var IsOldServiceOk = false;
	var IsServiceOk = false;
	if ( isHaveNoRight )//没权限的情况下
	{
		//sinfor版本的控件

		if( compareOldVersion < 0)
		{
			IsOldServiceOk = g_CscmObj.IsServiceOK;
			if(IsOldServiceOk != true)
			{
				return E_NO_RIGHT;
			}
		}
		else//sangfor版本的控件
		{
			IsServiceOk = g_CscmObj.IsServiceOK;
			if(IsServiceOk == false)
			{
				IsOldServiceOk = g_CscmObj.IsOldServiceOK;
			}
			if(IsServiceOk == false && IsOldServiceOk  == false)
			{
				return E_NO_RIGHT;
			}
		}
		
		var ret = g_CscmObj.BeforeLogin;
		var downloadUrl = GetHostPath(G_DLLS[ID_SUPEREXE][ID_CODEBASE]);
	  ret = g_CscmObj.SetDownloadExeURL(downloadUrl);
	  if(MakeSuperExeOKWhenUpdateCscm(g_CscmObj,IsServiceOk) == false)
	  {
	  	return E_FAIL;
	  }
	}
	
	//卸载原来的cscm，但会将注册表信息一起删除掉，那么新注册的也没有了 
	//获取原来的CSCM
	var oldguid = g_CscmObj.CLSIDFromProgID(progid);
	var oldpath = g_CscmObj.DllPathByGUID(oldguid);
	//var ret = g_CscmObj.UnregisterDll(oldpath);
	g_CscmObj.BeforeLogin;
	
	if(compareOldVersion < 0)//从sinfor的控件升级被安装到了sinfor目录
	{
		var progid = "SangforUpdate.Update.1";
		var codepath = "/com/win/SangforUpdate.CAB";
		var comfile = "SangforUpdate.dll";
		
		if(!InstallDllByCAB(g_CscmObj, codepath, comfile ))//下载过渡用的控件来安装cscm
		{
			return E_FAIL;
		}
		
	  var SangforUpdateObj = CreateObject(progid);
		if(SangforUpdateObj == null)
		{
			return E_FAIL;
		}
		var downloadUrl = GetHostPath(codeBase);
		SangforUpdateObj.SetDownloadExeURL(downloadUrl);
		var url = GetHostPath(codeBase);
		SangforUpdateObj.InstallComponet(url,progFile);
		SangforUpdateObj = null;
	}
	else
	{
		if( !InstallDllByCAB(g_CscmObj, codeBase, progFile) )
		{
			return E_FAIL;
		}
	}
	
	g_CscmObj = null;
	return E_OK;
}



/*
 * Make IEHelper Ok
 * @param cscmObj ClientManagerobject
 * @return success return true，otherwise return false
 */
function MakeIEHelperOK(cscmObj)
{
	var progid         = G_DLLS[ID_IEHELPER][ID_PROGID];
	
	g_IEHelperObj = null;
	g_IEHelperObj = CreateObject(progid);
	if(g_IEHelperObj != null)
		return true;
	else
		return false;
}

function StopAll()
{
	SetCookie("haveLogin", "0");
	DisableSso();
	if(!g_CscmObj)
		return;
	try{
		doConfigure("STOP ALL");
	}catch(e){
		
	}
}

function EnableAppSupport(fn,failure)
{
	fn = fn||new Function();
	failure = failure||new Function();
	isRuning = getAppSupportState();
	if(isRuning){
		fn();
		return;
	}
	if(!g_CscmObj){
		failure();
		return;
	}
	var isException = false;
	try{
		doConfigure("CONF ENABLE TCP");//1成功，0正在操作，-1异常
		assert("debug","CONF ENABLE TCP");
		setInter(function(timer){
			if(isException){
				timer.cancel = true;
				failure();
				return;
			}
			var state = doQueryService("QUERY QSTATE TCP");
			
			assert("debug","查询结果:"+state);
			if(state==""){
				timer.cancel = true;
				failure();
				return;
			}
			state = state.deSerialize().note.toString();
			if((state == ServerState.STATUS_START_SUCCESS || state == ServerState.STATUS_STARTED)){
				timer.cancel = true;
				//alert("启动了");
				fn();
			}
			else if(state == ServerState.STATUS_START_FAILED){
				timer.cancel = true;
				//alert('启动不了');
				failure();
			}
		},500);
	}catch(e){
		failure();
		assert("debug","启动异常:"+e.message);
		isException = true;
	}
}

function setAppSupportState(running)
{
	g_AppSupportState = (running ? "1" : "0");
}

function getAppSupportState()
{
	return g_AppSupportState == "1";
}

/*
 * Start IP Service
 * @return success return true，otherwise return false
 */
function EnableIpSupport(fn,failure)
{
	fn = fn||new Function();
	failure = failure||new Function();
	isRuning = getIpSupportState();
	if(isRuning){
		fn();
		return;
	}
	if(!g_CscmObj){
		failure();
		return ;
	}
	var isException = false;
	try{
		
		doConfigure("CONF ENABLE L3VPN");//1成功，0正在操作，-1异常
		assert("debug","CONF ENABLE L3VPN");
		setInter(function(timer){
			if(isException){
				timer.cancel = true;
				return;
			}
			var state = doQueryService("QUERY QSTATE L3VPN");
			assert("debug","查询结果:"+state);
			if(state==""){
				timer.cancel = true;
				failure();
				return;
			}
			state = state.deSerialize().note.toString();
			if((state == ServerState.STATUS_START_SUCCESS || state == ServerState.STATUS_STARTED)){
				timer.cancel = true;
				fn();
			}
			else if(state == ServerState.STATUS_START_FAILED){
				//alert('启动不了');
				timer.cancel = true;
				failure();
			}
			//alert(state);
		},500);
	}catch(e){
		assert("debug","启动异常"+e.message);
		failure();
		isException = true;
	}
}

function setIpSupportState(running)
{
	g_IpSupportState = (running ? "1" : "0");
}

function getIpSupportState()
{
	return g_IpSupportState == "1";
}

function isVista()
{
	var agent = navigator.userAgent;
	return agent.indexOf("Windows NT 6") != -1?true:false;
}

function IsCanUseSso()
{
	if(getOsVersion() < Win32_2000)
		return false;
	else
		return true;
}




function MakeSsoOK()
{	
	var ssoProgid = G_DLLS[ID_SSOCLIENT][ID_PROGID];
	if(ControlManager.getState("SSOModule") == ControlsSetupStatus.SETUPSUCESS){
		if(!(g_SsoObj = ReLoadBHO(ssoProgid,"SSOClientPrj.SSOClientBHO.1"))){
			return false;
		}
	}
	if(g_SsoObj = CreateObject(ssoProgid)){
		return true;
	}
	else{
		return false;
	}
}
/*
	在enablesso方法里有调到
*/
function ConfigSso()
{	
	if(g_SsoObj == null)
			return false;
	g_SsoObj.SetLocaleInfo("<%MSG_SSO_Client_Prj%>");
	g_SsoObj.Login();
	g_SsoObj.setUserInfo(g_SsoUsername, g_SsoUserpwd);
	g_SsoObj.SetTimeout(g_SsoTimeout * 1000);
	for(key in SinforSSOData.row[0])
	{
		var rc = SinforGetRcById(key);
		if(rc!=null && (IsBS(rc[RC_SVC]) || rc["type"] == RC_WEB))
		{
			var flag = 0;

			//CFQ Modify
			var use_ub = rc["attr"];
			if((use_ub&1<<3) != 0)
			{
				flag = 1;
			}
			
			g_SsoObj.SetBsSSOConfig(SinforSSOData.row[0][key]['data'], pageHref , rc["type"], flag);
		}
	}
	g_SsoObj.SetBsConfigEnd();
	g_SsoObj.SetHandleInfo();
	return true;	
}

//braveboy，这里要处理切换到单点登录负载均衡资源的时候，安装CSCM控件的情况。
function EnableSso(isBalance)
{
	if( !(
			g_CscmObj
			&&IsCanUseSso()
			&&MakeSsoOK()
			&&ConfigSso()
		)
	){
		return false;
	}
	return true;
}

function DisableSso()
{
	try{
		if(g_SsoObj != null){
			g_SsoObj.StopSSO();
		}
		else{
			var progid = G_DLLS[ID_SSOCLIENT][ID_PROGID];
			var ssoClient = CreateObject(progid);
			ssoClient.StopSSO();
		}
		g_IsSsoEnabled = 0;
	}
	catch(e){}
}



var g_SDDNStopTimes = 0;




function IsUsingDkey()
{
	var UsingDkey_value = GetCookie("UsingDkey");
	if( UsingDkey_value == "1"|| UsingDkey_value == "2"){
		return 1;
	}

	return 0;	
}

function MakeSuperExeOKWhenUpdateCscm(cscmObj,IsServiceOk)
{
	var bSuccess = false;
	var ret = CheckSuperExe(cscmObj);
	if(ret != E_INSTALL && ret != E_UPDATE)
	{
		return true;
	}
	//安装和升级尝试3次，可能会被杀毒软件拦截，多尝试几次
	for(var i = 0 ; i < 3 && bSuccess == false; i++)
	{
		if(ret == E_INSTALL)
		{
			InstallSuperExe(cscmObj,IsServiceOk);
		}
		else
		{
			UpdateSuperExe(cscmObj,IsServiceOk);
		}
		
		//检查是否正确安装，M4.3之前安装superexe存在问题
		//权限提升服务中UpdateSuperExe还未安装完成，就返回了
		//所以这里只能循环检查一下了
		for(var j = 0 ; j < 10 ; j++)
		{
			ret = CheckSuperExe(cscmObj);
			if(ret != E_INSTALL && ret != E_UPDATE)
			{
				bSuccess = true;
				break;
			}
			try
			{
				cscmObj.Sleep(1000);
			}
			catch(e)
			{
			}
		}
	}
	
	return bSuccess;
}



function CheckSuperExe(cscmObj)
{
	var requireVer = G_DLLS[ID_SUPEREXE][ID_VER];
	return CheckSuperExeVersion(cscmObj,requireVer);
}

function CheckSuperExeVersion(cscmObj, requireVersion)
{
	var ver = cscmObj.SuperExeVersion;
	return ver == requireVersion ? E_OK : E_UPDATE;
}

function InstallSuperExe(cscmObj,IsServiceOk)
{
	var downloadUrl = GetHostPath(G_DLLS[ID_SUPEREXE][ID_CODEBASE]);
	if(IsServiceOk == false) 
	{
		return 0 !=  cscmObj.UpdateSuperExe(downloadUrl, "");
	}
	else
	{
		return 0 !=  cscmObj.UpdateSuperExe(downloadUrl, "Sangfor");
	}
}

function UpdateSuperExe(cscmObj,IsServiceOk)
{
	var downloadUrl = GetHostPath(G_DLLS[ID_SUPEREXE][ID_CODEBASE]);
	if(IsServiceOk == false) 
	{
		return 0 !=  cscmObj.UpdateSuperExe(downloadUrl, "");
	}
	else
	{
		return 0 !=  cscmObj.UpdateSuperExe(downloadUrl, "Sangfor");
	}
}

//panwc added end <--
//ccm add for clear ssl state
function ClearSslState()
{
	if(	!IsIE() 
		|| !g_CscmObj
		|| !MakeIEHelperOK(g_CscmObj)
		)
		return false;
	try{	
		g_IEHelperObj.ClearSslState();
	}catch(e){
		
	}
	return true;
}

function checkReLoginEx()
{
	if(g_CscmObj == null)
		return false;
	var isReLogin =  g_CscmObj.checkRelogin(GetCookie("TWFID"));
	if(isReLogin == 0){
		window.location = "/com/warning.html";
		return true;
	}
	return false;	
}




/******************宏定义 开始************************/
var ID_JAVA_ENV = "ENV",ID_APPLET_DIV = "appletzone";//JAVA环境提示,JAVA CSCM Object所在DIV
//重登录检查类型
var RG_RELOGIN = 0,RG_OK = 1,RG_REFRESH = -1,TIMER_APPLET_INIT = 1000; //重登录,未登录,刷新页面,Applet版CSCM控件安装检查定时器间隔。
    
//日志类型
var LOG_INFO = 1;
var LOG_WARNING = 1 + LOG_INFO;
var LOG_ERR = 1 + LOG_WARNING;
var LOG_DEBUG = 1 + LOG_ERR;
var g_IsRefresh = false;
//查询结果类型
var QR_TIMEOUT = -1,QR_FAILE = 0,QR_SUC = 1;		//超时,失败,成功

/******************全局变量定义************************/  
var g_localDbg = false,g_CscmObj = null,g_isAppletReady = false,g_isAppletFailed = false;         //本地调试开关,CSCM控件,CSCM版Applet是否已经安装好
ServerState = {
	STATUS_STARTING : "17",	
	STATUS_START_SUCCESS : "18",
	STATUS_START_FAILED : "19",
	STATUS_STARTED : "20",			//服务已经启动
	STATUS_STOPPING : "21",		//正在停止服务
	STATUS_STOP_SUCCESS : "22",	//停止服务成功
	STATUS_STOP_FAILED :"23",		//停止服务失败
	STATUS_STOPPED : "24",			//服务已经停止
	STATUS_INITING : "25",			//正在初始化
	STATUS_INIT_SUCCESS : "26",		//初始化成功
	STATUS_INIT_FAILED : "27",		//初始化失败
	STATUS_SCACHE_MOVING : "28",		//正在移动文件
	STATUS_SCACHE_MOVE_SUCCESS :"29",	//移动文件成功
	STATUS_SCACHE_MOVE_FAILED :"30",	//移动文件失败
	STATUS_SCACHE_CLEAN_SUCCESS : "31",  //清空流缓存成功
	STATUS_SCACHE_CLEAN_FAILED : "32"	//清空流缓存失败

}
/*
typedef enum ControlsSetupStatus
{
	INPROCESS = 0 ,//正在检查和安装
	SETUPFAILD,//安装失败
	SETUPSUCESS,//安装成功
	ISUPTODATE,//已经是最新的控件
	SETUPERROR,	//跨平台需要使用的，保留
	HAVENOPOWER,//没有权限
	USERCANCEL,//用户取消
	DOWNLOADFAILD//下载失败
	以下为提示
	DOWNLOADFAILD：下载控件失败，请检查您的网络是否正常
HAVENOPOWER：权限不够，请使用管理员权限登录VPN
USERCANCEL：用户取消下载，控件安装失败
SETUPFAILD：安装控件失败，可能安装过程被本地防火墙和杀毒软件拦截，请先关闭防火墙和杀毒软件
}CONTROLSETUPSTATUS;
	*/

//控件安装更新的状态
ControlsSetupStatus = {
	INPROCESS : "0",
	SETUPFAILD : "1",
	SETUPSUCESS : "2",
	ISUPTODATE : "3",
	UPDATE_SETUPERROR : "4",//给java专用的
	HAVENOPOWER: "5",//没有权限
	USERCANCEL: "6",//用户取消
	DOWNLOADFAILD: "7",//下载失败
	ANOTHERISRUNNING: "8",//已经有一个升级程序在运行
	RESOURCEEXHAUSTION: "9",//系统资源不足
	INVALIDPARAM:'10',
	UNKOWNERR: "11"//未知错误
};

//控件检查的名称
ControlCheckName = {
	HARDID:"HARDID",
	SECURITYCHECK:"SECURITYCHECK",
	TCP:"TCP",
	L3VPN:"L3VPN"
}
ControlIstState = {//控件是否已装过,true表示已安装，false表示没有安装
	TCP:true,
	L3VPN:true,
	SECURITYCHECK:true,
	HARDID:true
}

/*
	当前启用了中间人攻击
*/
function useProxy(){
	if(g_CscmObj&&isWin()&&IsIE()){
		var ProxyRet = g_CscmObj.CheckProxySetting;
		if( ProxyRet == 0 ){
			return true;
		}
	}
	return false;
}

//只使用WEB服务
function onlyUseWebSvr(){
	Cookie.clearCookie();
	SetCookie("webonly","1");
	SetCookie("allowlogin","1");
	
	//var href = 
	var host = window.location.href;
	href = "/por/service.csp?ignore=1";
	
	if(host.indexOf("por/hardid.csp")!="-1"){
		href = "login_hid.csp?ignore=1";
	}
	else if(host.indexOf("por/security_check.csp")!="-1"){
		href = "login_psw.csp?ignore=1";
	}
	window.location.href = href;
}

function directToLogout(){
	try{window.location = SFfixurl("/por/logout.csp");g_CscmObj.logout();}catch(e){}
}



/*
	功能：显示提示
	参数：isFloat 是否浮层方式显示
 */	
function showAppletIst(isFloat){
	if(!window.isAppendJreStyle){
		addStyleLink("/com/css/jre.css");
		isAppendJreStyle = true;
	}	
	function getJreLink(){
		var href = tr("JRE 安装包");
		if(isWin()){
			href = String.format('<a href="{0}" target="_blank">{1}</a>', link["Windows"], tr("Windows 平台安装包"));
		}
		if(isLinux()){
			href = String.format('<a href="{0}" target="_blank">{1}</a>', link["Linux"], tr("Linux 平台安装包"));
		}
		if(isMac()){
			href = String.format('<a href="{0}">{1}</a>', link["Mac"], tr("Mac OS X 平台安装包"));
		}
		if (isWin() && Browser.isChrome) {
			href = '<a href="/com/win/SangforECPluginInstaller.exe" target="_blank">'+tr("Windows 平台 chrome安装包")+'</a>';
		};
		return href;
	}
	
	var os = isWin()?"Windows":isLinux()?"Linux":"Mac";
	var link = {"Windows":"http://update1.sangfor.net/sslupdate/jre/jre-for-windows.exe","Linux":"http://update1.sangfor.net/sslupdate/jre/jre-for-linux.bin","Mac":G_DLLS[ID_MAC_CSCM][ID_CODEBASE]};
	
	if(!isMac()){
		var help_link = window.language === 'zh_CN' ? '/com/help/' : '/com/help_en/';
		var showInfo = [
			'<div class="content">',
			'<h2>'+tr('登录失败，可能有以下原因：')+'</h2>',
			'<ul>',
				'<li>'+tr('未安装 JRE 或 JRE 版本过低'),
					'<p>'+tr('请根据您当前的操作系统选择下载安装')+'</p>',
					'<p><img src="/com/images/download.ico">&nbsp;'+getJreLink()+'</p>',
					'<p><img src="/com/images/link.ico">&nbsp;<a href="http://www.java.com/zh_CN/download/manual.jsp" target="_blank">'+tr('其他操作系统')+'</a></p>',
				'</li>',
				'<li>'+tr('未设置浏览器与 JRE 关联'),
					'<p><a href="' + help_link + '" target="_blank">'+tr('查看在线帮助')+'</a></p>',
				'</li>',
				'<li>'+tr('控件证书信任失败'),
					'<p>'+tr('请重新登录，在弹出的证书信任框中点 “确认”、“信任”、“不阻止” 或 “运行” 按钮')+'</p>',
				'</li>',
				'<li>'+tr('Applet 测试'),
					'<p>'+tr('您能看到下面 Applet 的界面吗？如果显示不正常，提示 “不活跃插件”、“已阻止的插件” 或 “需要安装 Java 才能显示此内容” 等，请点击一下！')+'<p>',
					'<p><applet id="SFTestApplet" name="SFTestApplet" width="200" height="200" code="com.sangfor.ssl.Smiley.class" codebase="." archive="/com/smiley.jar" mayscript></applet></p>',
				'</li>',
			'</ul>',
			'</div>'].join('');
	}else{
		var showInfo = [
		'<div class="content">',
		'<h2>'+tr('登录失败，可能有以下原因：')+'</h2>',
		'<ul>',
			'<li>'+tr('未安装浏览器控件 或 浏览器控件版本过低'),
				'<p>'+tr('请您下载安装')+'</p>',
				'<p><img src="/com/images/download.ico">&nbsp;'+getJreLink()+'</p>',
			'</li>',
			'<li>'+tr('控件证书信任失败'),
				'<p>'+tr('请重新登录，在弹出的证书信任框中点 “确认”、“信任”、“不阻止” 或 “运行” 按钮')+'</p>',
			'</li>',
		'</ul>',
		'</div>'].join('');	
	}

	if(isWin() && Browser.isChrome){
		var showInfo = [
			'<div class="content">',
			'<h2>'+tr('登录失败，可能有以下原因：')+'</h2>',
			'<ul>'
		]

		if (parseFloat(Browser.chromeVersion)<36) {
			showInfo = showInfo.concat([
				'<li>'+tr('chrome版本问题'),
					'<p>'+tr('您的chrome版本为{0}，如果版本低于36，请安装36版本以上chrome', Browser.chromeVersion)+' </p>',
				'</li>'
			])
		};

		showInfo = showInfo.concat([
			'<li>'+tr('未安装浏览器控件,请您下载安装以下控件后,重启浏览器登陆'),
				'<p><img src="/com/images/download.ico">&nbsp;'+getJreLink()+'</p>',
			'</li>',
			'<li>'+tr('控件被禁用'),
				'<p>'+tr('请在浏览器输入chrome://plugins/,进入插件列表,启用插件SangforECPlugin')+'</p>',
			'</li>',
			'</ul>',
			'</div>'
		]);

		showInfo = showInfo.join('');
	}


	document.title = tr('提示');
	if (isFloat) {
		addStyleLink('/com/css/common.css');
		var showInfo = [
			'<div class="content">',
			'<h2>'+tr('登录失败')+'</h2>',
			'<ul>'
		]
		var fileFix = window.language === 'zh_CN' ? '' : '_en';
		showInfo = showInfo.concat([
			'<li>'+tr('检测到sslvpn插件已被浏览器禁用，请按以下步骤开启'),
			'<p>'+tr('1.点击地址栏右侧位置的拦截插件标记')+'<br>'+tr('2.选择始终允许插件选项')+'<br>'+tr('3.点击完成')+'<br><img src=\'/com/images/plug_stop1' + fileFix + '.png\'></p>',
			'</li>',
			'</ul>',
			'</div>'
		]);
		showInfo = showInfo.join('');

		var maskForPlug = document.createElement('div');
		maskForPlug.innerHTML = '<div class="container"><div class="alert">'+showInfo+'</div></div>';
		maskForPlug.id="maskForPlug";
		maskForPlug.style.width = "100%";
		maskForPlug.style.height = "100%";
		maskForPlug.style.position = "fixed";
		maskForPlug.style.left = "0";
		maskForPlug.style.top = "0";
		maskForPlug.style.zIndex = "999999999"
		maskForPlug.style.background="#FAFAFA";
		document.body.appendChild(maskForPlug);

	}else{
		addScript('/com/common.js');
		addScript('/com/component.js');
		addStyleLink('/com/css/common.css');
		if(!document.body){
			document.body = document.createElement('body');		
		}	
		document.body.innerHTML = '<div class="container"><div class="alert">'+showInfo+'</div></div>';
	}
	
}



/*
	显示帮助页面，会把页面全部替换掉
 */
function showHelpWin(title,link,content){
	if(!window.isAppendHelpStyle){
		addStyleLink("/com/css/help_win.css");
		isAppendHelpStyle = true;
	}
	var explain = "";
	if(content){
		explain = [
			'<p class="error" style="width:300px">'+content+'</p>'
		].join('');
		 
	}
	document.title = tr('提示');
	addScript('/com/common.js');
	addScript('/com/component.js');
	addStyleLink('/com/css/common.css');
	if(!document.body){
		document.body = document.createElement('body');		
	}	
	document.body.innerHTML = [
		'<div class="container">',
		'<div class="alert">',
			'<div class="content">',
				'<h2>'+title+'</h2>',
				explain,
			'</div>',
		'</div>',
		'</div>'
	].join('');
}

//singleton对象
var ControlManager = new (function(){

	/*
		检查更新的过程
	 */
	this.update = function(type,fn,failure){
		var flag  = IsRefreshPage()||!g_CscmObj
		// console.log("flag="+flag+" 需要更新控件");
		if(flag){
			fn();
			return;
		}
		// Mac 系统只检查版本号，不检查更新		
		doConfigure("SET LANG " + (window.language === 'zh_CN' ? 'zh_CN' : 'en_US'));
		if(isMac()){
			ret = g_CscmObj.CheckAndUpdateControls(type);//通知检查更新
			if(new String(ret)=="1"){
				fn();
			}else{
				showAppletIst();
			}
			return;
		}
		
		var me = this;

		if(IsIE() || (isWin() && Browser.isChrome) ){
			try{
				assert("debug","开始检查IE代理...");
				var ProxyRet = g_CscmObj.CheckProxySetting;
				if( ProxyRet == 0 ){
					assert("debug","开始测试IE代理服务器...");
					var TestRet = g_CscmObj.TestProxyServer;
					if( TestRet == 0 ){
						showHelpWin(tr("代理服务器"),"#",tr("无法通过代理服务器的身份验证。"));
						PageStateManager.inStarted();//标记页面当前状态
						return ;
					}
				}
				
				var proxyMsg = {
					"2":tr("无法启用IE代理\n\n原因：当前IE代理启用了自动配置脚本"),
					"3":tr("无法启用IE代理\n\n原因：不支持自动检测设置，服务可能会失效"),
					"4":tr("无法启用IE代理\n\n原因：没有为http或https指定代理服务器"),
					"6":tr("无法启用IE代理\n\n原因：当前HTTP代理服务器与HTTPS代理服务器设置不一致")
				};
				//ProxyRet==5 是排除列表，不用给出提示
				
				if(proxyMsg[ProxyRet.toString()]){
					//if(proxyMsg[ProxyRet.toString()]){
						alert(proxyMsg[ProxyRet.toString()]);
					//}
					onlyUseWebSvr();
					return;
				}
			}
			catch(e)
			{}
		}
		
		assert("debug","开始通知检查更新");
		//alert(g_CscmObj.CheckAndUpdateControls(type));
		g_xmlRCCnf = window.g_xmlRCCnf||"";
		g_xmlSysCnf = window.g_xmlSysCnf||"";
		
		var ret,
			ctlVersion = post_http("/com/WindowsModule.xml?rnd=" + Math.random(), null, "GET"); //控件版本信息
		if(!Browser.isIE&&isWin()){//windows 上非ie浏览器
			ret = g_CscmObj.doXmlConfigure(ctlVersion);//for 控件下发版本信息
		}
		if(Browser.isIE || (isWin() && Browser.isChrome) ){
            // 获取当前版本
			var cscmVersion = g_CscmObj.GetSelfVersion;
			if(cscmVersion){
                //通知检查更新控件,下发一系列配置
				ret	= g_CscmObj.CheckAndUpdateControls(type,g_xmlRCCnf,g_xmlSysCnf,ctlVersion);
			}
			else{
				ret	= g_CscmObj.CheckAndUpdateControls(type,g_xmlRCCnf,g_xmlSysCnf);
			}
		}
		else{
			ret = g_CscmObj.CheckAndUpdateControls(type);//通知检查更新
		}
		//var ret = g_CscmObj.CheckAndUpdateControls(type);//通知检查更新
		//alert("abc:"+ret);
		//alert(ret.constructor);
		assert(ret,"通知检查更新成功");

		var msg = {};
		msg[ControlsSetupStatus.SETUPFAILD] = {
			title:tr("检查和更新控件失败"),
			content:tr("1、请先关闭防火墙和杀毒软件"),
			link:"#"
		};
		msg[ControlsSetupStatus.UPDATE_SETUPERROR] = {
			title:tr("检查和更新控件失败"),
			content:tr("1、先关闭防火墙和杀毒软件"),
			link:"#"
		};
		msg[ControlsSetupStatus.USERCANCEL] = {
			title:tr("用户取消下载，控件安装失败"),
			content:tr("1、请关闭浏览器后重新登录"),
			link:"#"
		};
		msg[ControlsSetupStatus.HAVENOPOWER] = {
			title:tr("权限不够"),
			content:tr("1、使用管理员权限登录VPN"),
			link:"#"
		};
		msg[ControlsSetupStatus.DOWNLOADFAILD] = {
			title:tr("下载控件失败"),
			content:tr("1、检查您的网络是否正常&lt;br /&gt;2、如果使用IE代理，请检查代理用户名/密码是否正确"),
			link:"#"
		};
		msg[ControlsSetupStatus.RESOURCEEXHAUSTION] = {
			title:tr("系统资源不足"),
			content:tr("1、重新启动电脑"),
			link:"#"
		};
		msg[ControlsSetupStatus.INVALIDPARAM] = {
			title:tr("参数错误"),
			content:"",
			link:"#"
		};
		var waittime = 500;
		if (Browser.isIE || (isWin() && Browser.isChrome))
		{
			waittime = 100;
		}
		var process = "";
		if(new String(ret)=="1"){
			setInter(function(timer){
				try{
					process = g_CscmObj.doQueryService("QUERY CONTROLS UPDATEPROCESS");//查总进度
					process = new String(process).deSerialize().note.toString();
					//alert("process"+process);
					// console.log("更新状态："+process);
					if(process == ControlsSetupStatus.ANOTHERISRUNNING){
						var ret1 = g_CscmObj.CheckAndUpdateControls(type,g_xmlRCCnf,g_xmlSysCnf);//通知检查更新
						return;
					}
				}
				catch(e1){
					assert("debug","更新过程中错误:"+e1.message);
					PageStateManager.inStarted();//标记页面当前状态
					timer.cancel = true;
					try{window.location = SFfixurl("/por/logout.csp");g_CscmObj.logout();}catch(e){}
				}
				var error = (process == ControlsSetupStatus.SETUPFAILD||
					process == ControlsSetupStatus.USERCANCEL||
					process == ControlsSetupStatus.HAVENOPOWER||
					process == ControlsSetupStatus.DOWNLOADFAILD||
					process == ControlsSetupStatus.RESOURCEEXHAUSTION||
					process == ControlsSetupStatus.INVALIDPARAM
				);
				
				if(process == ControlsSetupStatus.UPDATE_SETUPERROR||
				   (IsIE()&&error) || 
				   (Browser.isChrome&&error) ){//跨平台上更新控件失败了
					PageStateManager.inStarted();//标记页面当前状态
					timer.cancel = true;
					if(isWin()){
						var infor = msg[process];
						showHelpWin(infor.title,infor.link,infor.content);
					}
					else{
						showHelpWin(tr("安装失败"),"#",tr("控件无法下载或提升权限失败。"));
					}
					return;	
				}
				assert("debug","检查安装进度中,返回值:"+process);

                //更新完成
				if(process == ControlsSetupStatus.SETUPSUCESS||process == ControlsSetupStatus.ISUPTODATE){
					timer.cancel = true;
					assert("debug","更新安装成功");
					// console.log("更新安装成功");
                    // 如果是ie
					if(IsIE()){
						var state = me.getState("CSCMModule");//cscm发升了升级
						if(state == ControlsSetupStatus.SETUPSUCESS){
						//如果cscm控件5.0后发生了更新就重新设置配置信息给新控件
							g_CscmObj = CreateObject(G_DLLS[ID_CSCM][ID_PROGID]);
							CscmManager.configure();
							if(!CscmManager.handleSession()){
								return;
							}
							var chkProxy = g_CscmObj.CheckProxySetting;
							if(typeof setConfigToClient!="undefined"){
								setConfigToClient();
							}
						}
					}else if(Browser.isChrome){
                        //cscm发升了升级
                        //通过g_CscmObj.doQueryService("QUERY CONTROLS SangforECPluginModule")查看总进度,如果他返回2代表成功
                        var state = me.getState("SangforECPluginModule");
                        if(state == ControlsSetupStatus.SETUPSUCESS){
                            //如果cscm控件5.0后发生了更新就重新设置配置信息给新控件
                            // g_CscmObj = CreateObject(G_DLLS[ID_CSCM][ID_PROGID]);
                            // 开始实现更新插件,这样会刷新页面
                            window.navigator.plugins.refresh(true);
                            // 加上返回，保证他不会往下走
                            return;
                        }
                    }
					fn(process);
				}
				
			},waittime);
		}
		else{
			process = g_CscmObj.doQueryService("QUERY CONTROLS UPDATEPROCESS");//查总进度
			process = new String(process).deSerialize().note.toString();
			var errorInfo = msg[process];
			if(errorInfo){
				showHelpWin(errorInfo.title , errorInfo.link , errorInfo.content);
			}
			else{
				showHelpWin(tr("控件更新检查失败"),"#",tr("请关闭浏览器后重新登录。"));
			}
			//directToLogout();
		}
	};
	this.getState = function(controlName){//得到控件状态
		var state = g_CscmObj.doQueryService("QUERY CONTROLS "+controlName);//查总进度
		state = new String(state).deSerialize().note.toString();
		
		return state;
	};
});




function CreateObject(progid)
{
	var obj = null;
	try{
		obj = new ActiveXObject(progid);
	}
	catch(e){
		obj = null;
	}
	return obj;
}

function updateIeCscm(){//升级到5.0以上的控件
	assert("debug","开始从5.0以下版本升级");
	var ret = UpdateCSCM();

	if(ret == E_OK){
		var progid = G_DLLS[ID_CSCM][ID_PROGID];
		g_CscmObj = CreateObject(progid);
		while(typeof g_CscmObj.doQueryService=="undefined"){
			g_CscmObj = null;
			g_CscmObj = CreateObject(progid);
		}
	}
}

function createIeCscm(autoIst){//autoIst是否自动安装
	var progid = G_DLLS[ID_CSCM][ID_PROGID];
	// 创建插件对象
	g_CscmObj = CreateObject(progid);
	if(g_CscmObj == null){
		if(autoIst){
			PageStateManager.inStarted();//标记页面当前状态
			InstallCSCM();
		}
		return;
	}
	var needUpdate = false;
	if(g_CscmObj.SelfVersion!==undefined){
		needUpdate = true;
		assert("debug","控件为5.0以下版本");
	}
	else{
		assert("debug","控件为5.0以上版本");
	}
	if(needUpdate){
		var flag = g_CscmObj.reloginEx;
		if(flag.toString() != "0"){
			GotoWarning();
			return;
		}
		updateIeCscm();
	}
}

//非win平台 检查控件是否已安装
function queryCtrIsIst(){
	
	var temp =  doQueryService ("QUERY INSTALLMODULE SERVICE");
	assert("debug","控件手动安装结果");
	assert("debug",temp);
	temp = temp==""?false:temp.deSerialize().note=="1";
	if(!temp){
		return false;
	}
	return true;
}
//win平台 检查控件是否已安装
function queryWinCtrlIsIst(controlName){
	var flag  = true;
	if(controlName.trim()==""){
		return true;
	}
	names = controlName.split("|");
	for(var i = 0 ; i<names.length;i++){
		var temp = doQueryService(String.format("QUERY AUTOINSTALLMODULE {0}",names[i]));
		assert("debug","控件手动安装结果");
		assert("debug",temp);
		temp = temp==""?false:temp.deSerialize().note=="1";
		ControlIstState[names[i]] = temp;
		assert("debug",ControlIstState);
		if(!temp){
			flag =  false;
		}
	}
	return flag;
}

function controlIstCheck(controlName){//手动安装下控件检查,true表示已安装，false表示没有安装
	var result = null;
	assert("debug","收到的要验证的控件:"+controlName);
	var flag = true;
	return isWin()?queryWinCtrlIsIst(controlName):queryCtrIsIst();
}

/*
	判断chrome插件是否存在
 */
function checkChromePluginsIsExist()
{
	
    var p = window.navigator.plugins;
    var end = window.navigator.plugins.length;
    var i;
    for (i = 0; i < end; i++)
    {
        if (p[i].name == "SangforECPlugin")
        {
            return true;
        }
    }
    if (i == end)
    {
        return false;
    }
    
}

// CscmManager singleton对象
// edit by yuanxin 2014/9/1
var CscmManager = new (function(){

	// fn 回调执行函数
	// isChkRelogin 一般为true
	this.createCscm = function(fn,isChkRelogin,cfg){
		//创建cscm isIst是否须要安装
		if(g_CscmObj||GetCookie("ignore_cscm").toString()=="1"){
			fn({needIst:false});
			return;
		}

		// 是否已经登录 默认为true
		isChkRelogin = typeof isChkRelogin == "undefined" ? true : isChkRelogin;

		// 自动安装，默认为true
		var autoIst = (cfg && cfg.autoIst);
		autoIst = autoIst==undefined ? true : autoIst;

		if(typeof autoIst=="string"){
			autoIst = parseInt(autoIst,10);
		}
		autoIst = !!autoIst;
		
		//值可能是TCP|L3VPN
		var chkCtlName =  cfg && cfg.ctlName ? cfg.ctlName : "",
			reloginFn = cfg&&cfg.reloginFn || new Function();//重登录时要做的
			mustIstCscm =  cfg&&cfg.mustIstCscm || false;
		
		this.isServicePage = (cfg&&cfg.servicePage)||false;
		
		var isAppletCreated = false,//applet标签是否已经创建
		    me = this,
		    tryTimes = 0,
		    maxTimes = 32;
		var isMacCscmCreated = false;
		var isChromeCreated = false;
		
		// 如果是linux下的opera，增加时间
		if(isLinux()&&Browser.isOpera){
			maxTimes = 48;
		}

		// setInter 循环计时器 
		// 如果是ie下的话，时间为0，其他的是1500
		// timer.cancel = true;为结束定时器
		setInter(function(timer){
            // 如果是IE
			if(IsIE()){
				timer.cancel = true;
				assert("debug","开始创建ie cscm控件");
				createIeCscm(autoIst||mustIstCscm);
				if(!autoIst&&g_CscmObj==null){//如果为手动安装
					fn({needIst:true});//needIst表示需要手动安装
					return;
				}
				assert("debug","创建ie cscm控件成功");
			}
			// 如果是mac，但是这个只支持safari，不支持chrome
			else if(isMac()){
				if(!Browser.isSafari){
					timer.cancel = true;
					showHelpWin(tr("浏览器检查失败"), "#", tr("不支持该浏览器，请切换到Safari浏览器访问。"));
					return;
				}
				if(tryTimes>maxTimes){
					timer.cancel = true;
					showAppletIst();//显示安装macCscm
					return;
				}
				if(!isMacCscmCreated){
					isMacCscmCreated = true;
					me.createMacCscm();
					assert("debug","开始安装mac Cscm控件");
				}
				assert("debug","尝试安装的次数:"+tryTimes);
				var isMacReady = me.isMacCscmReady();
				assert(isMacReady,"mac Cscm控件安装完成");
				if(isMacReady == E_OK){//macCscm已准备好
					timer.cancel = true;
					g_CscmObj = document.SFBsMac;
				}else if(isMacReady == E_FAIL || ((isMacReady == (E_FAIL | E_PENDING)) && tryTimes>=15)){
					timer.cancel = true;
					showAppletIst();//显示安装macCscm
					return;
				}else{
					tryTimes++;
				}
			}

			// 加一个逻辑，判断是谷歌浏览器，
			else if(Browser.isChrome){

				// 判断控件是否已经加载
				if(!isChromeCreated){
					isChromeCreated = true;
					me.createChromeCscm();
					// console.log("chrome Cscm控件安装完成");
				}
				// 判断是否准备好，这样得知道控件是通过什么判断的

				// 如果插件不存在，跳到提示页面，
				if ( !checkChromePluginsIsExist() ) {
					// console.log("插件不存在");
					// 显示提示信息
					showAppletIst();
					timer.cancel = true;
					return;
					
				}else{

					// 插件ok，有可能给阻止，所以在这里等待判断

					// 判断插件是否启用
					var isChromeReady = me.isChromeCscmReady()

					// 如果插件准备好了，就刷新一下页面
					if(isChromeReady == E_OK){//macCscm已准备好
						timer.cancel = true;
						g_CscmObj = document.getElementById("SFChrome");
						if (document.getElementById("maskForPlug")) {
							document.body.removeChild(document.getElementById("maskForPlug"));
							// 这里要删除样式
							var links = document.getElementsByTagName("link");
							for (var i = 0; i < links.length; i++) {
								// 如果存在common.css话，删掉
								if(/common\.css/.test(links[i].href)){
									document.head.removeChild(links[i]);
								}
							};
							document.title= tr("欢迎访问SSL VPN");
						};
						
					}
					// 如果还是检测不到插件，插件就被阻止了，显示浮层提示用户插件给阻止了
					else{
						if (!document.getElementById("maskForPlug")) {
							showAppletIst(true);
						};
						
					}

				}
			}
			else{
				//jreData = [];//test
				if(jreData.length==0){
					timer.cancel = true;
					showAppletIst();//显示安装jre -applet
					return;
				}
				var isEnable = me.isEnableApplet();
				assert(isEnable,"支持applet控件");
				if(!isEnable){//不支持java applet
					timer.cancel = true;
					return;
				}
				else{
					if(!isAppletCreated){
						isAppletCreated = true;
						me.createAppletCscm();
						assert("debug","开始安装applet控件");
					}
					
					if((tryTimes>maxTimes)||g_isAppletFailed){
						timer.cancel = true;
						showAppletIst();//显示安装jre -applet
						return;
					}
					assert("debug","尝试安装的次数:"+tryTimes);
					var isReady = me.isAppletReady();
					assert(isReady,"applet控件安装完成");
					if(isReady){//applet已准备好
						timer.cancel = true;
						g_CscmObj = document.SFBsApplet;
					}
					else{
						tryTimes++;
					}
				}
			}

			if(g_CscmObj){
				timer.cancel = true;
				assert("debug","开始配置控件参数");
				try{
					var relogin = me.configure(isChkRelogin);//isChkRelogin这个参数用来标识是否跳转到登录页
					if(relogin){
						reloginFn();
						return;
					}
					assert("debug","参数配置完成");
					if(!me.handleSession()){
						return;
					}
				}
				catch(e){
					assert("debug","参数配置失败:"+e.message);
				}
				if(!autoIst){
					if(!controlIstCheck(chkCtlName)){
						fn({needIst:true});
						return;
					}
				}
				fn({needIst:false});
			}
		},Browser.isIE?0:1500);
	};
	this.isEnableApplet = function(){//浏览器是否支持applet
		return true;
		//return this.javaEnabled = this.javaEnabled||navigator.javaEnabled();
	};
	this.isAppletReady = function(){//applet是否已准备好，并可以调用
		/*if(isMac()&&Browser.isSafari){
			if(this.isAppletReady.callCount>=2){//callCount的变量作用在于，如果立刻调用doQueryService方法在mac safari上会导致浏览器卡死
				if(document.SFBsApplet.doQueryService){
					return true;
				}
				//alert(2);
				return false;
			}
			this.isAppletReady.callCount++;
			return false;
		}
		else{
			return g_isAppletReady;
		}*/
		return g_isAppletReady||top.g_isAppletReady;
	};
	this.isAppletReady.callCount = 0;
	this.createAppletCscm = function(){//是否已创建了applet标签
		function createParaStr(name,value){
			return "<param name=\""+name+"\" value=\""+value+"\">";
		}
		var divApplet = CreateDiv(ID_APPLET_DIV),applet_type = 0;
		
		if(Browser.isFirefox||(Browser.isOpera&&isWin())) {
			applet_type = 1; // <embed> in Netscape, Opera and Mozilla
		} 
		var loc = this.getLocation();
		var host = loc.host,port = loc.port;
		assert("debug",host);
		assert("debug",port);
		if(applet_type == 1) {
			var s = String.format('<embed height="1" width="1" codebase_lookup="false" filedebug="false" java_arguments="-Djnlp.packEnabled=true" legacy_lifecycle="true" code="com.sangfor.ssl.bscm.BsApplet.class" archive="/com/browser.jar" codebase="." {0} {1} name="SFBsApplet" id="SFBsApplet" pluginspage="https://java.sun.com/javase/downloads/index.jsp" type="application/x-java-applet;version=1.5">',
			this.isServicePage?'servicepage="true" ':"",'svpnhost="'+host+'" svpnport="'+port+'" ');//这个地方不要把s加入调用assert，html在中间会有问题
			divApplet.innerHTML = s;
		} else {
			/*var attributes = {
				code:'com.sangfor.ssl.bscm.BsApplet.class',codebase:'.',
				width:"0",height:"0",
				archive:'/com/browser.jar',
				id:'SFBsApplet',
				name:'SFBsApplet',
				mayscript:"mayscript"
			};
			var parameters = {
				svpnhost:host,
				svpnport:port
			};
			if(this.isServicePage){
				parameters.servicepage = true;
			}
			var appletTag = document.createElement("applet");
			
			for (var attribute in attributes) {
				appletTag.setAttribute(attribute,attributes[attribute]);
			}

			if (parameters != 'undefined' && parameters != null) {
				for (var parameter in parameters) {
					var param = document.createElement("PARAM");
					param.setAttribute("name",parameter);
					param.setAttribute("value",parameters[parameter]);
					appletTag.appendChild(param);
				}
			}*/
			
			var params = [createParaStr("svpnhost",host),createParaStr("svpnport",port),createParaStr("filedebug","false")];
			if(this.isServicePage){
				params[params.length] = createParaStr("servicepage","true");
			}
			
			// Safari 5.1 width="0" height="0" 修改为 width="1" height="1"
			var appletHtml = '<applet id="SFBsApplet" name="SFBsApplet" width="1" height="1" code="com.sangfor.ssl.bscm.BsApplet.class" codebase="." archive="/com/browser.jar" mayscript>'+params.join("")+'</applet>';
			
			var _div = create("div");
			_div.innerHTML = appletHtml;
			if(document.body.firstChild){
				document.body.insertBefore(_div,document.body.firstChild);
			}
			else{
				document.body.appendChild(_div);
			}
			
			//以下代码是对Mac OS 10.7x出现的Applet控件卡屏的问题，当禁用Java插件后，界面会出现卡屏。luyi and lpt
			var ua = window.navigator.userAgent,
				macVar = ua.match(/\(Macintosh;.+?([0-9_]+).+?\)/);
			if(macVar != null){
				macVar = Number(macVar[1].replace('_', '.').replace(/_/g, ''));
				if(!isNaN(macVar) && macVar >= 10.7){	//10.7是系统版本号，不是魔数，别乱整。
					if(_div.offsetHeight > 1){
						var _f = document.createDocumentFragment();
						_f.appendChild(_div);
					}
				}
			}
			
			//document.body.appendChild(appletTag);
		} 
	};
	this.isMacCscmReady = function(){
		var obj = document.getElementById("SFBsMac");
		if(!obj){
			return E_FAIL;
		}else if(!obj.PluginVersion){
			return (E_FAIL | E_PENDING);
		}else if(obj.PluginVersion == G_DLLS[ID_MAC_CSCM][ID_VER]){
			if(g_isAppletReady || top.g_isAppletReady){
				return E_OK;//准备ok
			}else if(g_isAppletFailed || top.g_isAppletFailed){
				return E_FAIL;//准备失败
			}else{
				return E_PENDING;
			}
		}else{
			return E_FAIL;//版本号匹配失败
		}
	};

	// 判断谷歌的插件是否已经启用
	this.isChromeCscmReady = function(){
		var obj = document.getElementById("SFChrome");
		// 对象存在，能获取版本
		if(obj && obj.GetSelfVersion){
			// console.log(obj.GetSelfVersion);
			return E_OK;
		}else{
			return E_FAIL;//版本号匹配失败
		}
	}
	this.createMacCscm = function(){//是否已创建了applet标签
		var divApplet = CreateDiv("maczone");
		var loc = this.getLocation();
		var host = loc.host,port = loc.port;
		assert("debug",host);
		assert("debug",port);
		var s = String.format('<embed height="1" width="1"  {0} {1} name="SFBsMac" id="SFBsMac" type="application/x-easyconnect-plugin" width="1" height="1" allowScriptAccess="always" pluginSpage="{2}">',
		this.isServicePage?'servicepage="true" ':"", 'svpnhost="'+host+'" svpnport="'+port+'" ', G_DLLS[ID_MAC_CSCM][ID_CODEBASE]);//这个地方不要把s加入调用assert，html在中间会有问题
		divApplet.innerHTML = s;
	};

	// add by yuanxin
	// 创建谷歌浏览器的插件,仿照createMacCscm
	this.createChromeCscm = function(){
		var divApplet = CreateDiv("chromezone");
		var loc = this.getLocation();
		var host = loc.host,port = loc.port;
		assert("debug",host);
		assert("debug",port);
		//这个地方不要把s加入调用assert，html在中间会有问题
		var s = String.format('<embed height="1" width="1" name="SFChrome" id="SFChrome" type="application/x-npECPlugin" width="1" height="1" allowScriptAccess="always">');
		divApplet.innerHTML = s;
	}

	this.configure = function(isGoToWaring){
		
		var loc = this.getLocation();
		
		assert("debug","start SET SERVADDR");
		var ret = doConfigure("SET SERVADDR " + loc.host + " " + loc.port);
		var configStr = isWin()?"SET CSCLIENT 7,1,0,0 /com/win/SangforUD.exe":(isLinux()?"SET CSCLIENT 6.0.0.0 /com/cross/install-linux.sh":"SET CSCLIENT " + VERSION_MAC_CSLIENT + " /com/EasyConnectPlugin.dmg");
		assert("debug","end SET SERVADDR");
		
		assert("debug","start SET LANG");
		ret = doConfigure("SET LANG " + (window.language === 'zh_CN' ? 'zh_CN' : 'en_US'));
		assert("debug","end SET LANG");
		
		assert("debug","start SET CSCLIENT");
		ret = doConfigure(configStr);
		assert("debug","end SET CSCLIENT");
		
		assert("debug","start SET BROWSER");
		ret = doConfigure("SET BROWSER "+getBroserType());
		assert("debug","end SET BROWSER");
		
		assert("debug","start checkReLogin");
		var relogin = checkReLogin(isGoToWaring);
		assert("debug","end checkReLogin");
		return relogin;
		
	};
	this.handleSession = function(){
		if(g_IsRefresh){//刷新时设置cookie
			assert("debug","刷新页面，并重设TWFID");
			var flag = querySession();
			if(!flag){
				if(isMac()){
					showAppletIst();
				}else{
					showHelpWin(tr("控件更新检查失败!"),"#",tr("请关闭浏览器后重新登录。"));
				}
				//directToLogout();
			}
			return flag;
		}
		else{
			setSession();
		}
		return true;
	};
	this.getLocation = function(){
		var url = location.href;
		var regExp=/^(((https?)|(ftp)):\/\/)?([^:\/]+)(:(\d+))?([^:]*)?$/i,protocol="",host="",port="",subforder="";
		if(regExp.test(url)){
			protocol = url.replace(regExp,"$2").toUpperCase(),host  = url.replace(regExp,"$5"),port = url.replace(regExp,"$7"),subforder = url.replace(regExp,"$8");
			port = port==""&&(protocol=="HTTP"||protocol=="HTTPS")?(protocol=="HTTP"?80:443):port;
		}
		return {host:host,port:port};
	};
})();

function querySession(){
	var sid = doQueryServiceBlock("QUERY QSESSIONID");
	sid = sid.deSerialize().argument.toString();
	if(sid=="-1"){//异常了
		return false;
	}
	if(sid!="SangforDefaultValue" && sid.trim()!=""){
		SetCookie("TWFID",sid);
	}
	else{
		setSession();
	}
	return true;
}

function setSession(){
	var twfid = GetCookie("TWFID");
	assert("debug","配置TWFID");
	if(twfid == "SangforDefaultValue"){
		twfid = "-1";
	}
	ret = doConfigure("SET TWFID " + twfid);
}
function setIsAppletReady()
{
	g_isAppletReady=true;
}
function setIsAppletFailed()
{
    g_isAppletFailed = true;
    // 里面设置一个变量
    // 标识Applet失败，如证书框点取消
}
/** 
    *判断当前加载是不是刷新页面行为
	*param:none;
     *retvalue:no return value
**/
function IsRefreshPage()
{
	return g_IsRefresh; 
}
/** 
    *跳转到重登录警告页面。
	*param:noen;
     *retvalue:no return value
**/
function GotoWarning()
{
	PageStateManager.inStarted();//标记页面当前状态
	window.location = "/com/warning.html";
}

function checkReLogin(goToWaring)
{
	goToWaring = goToWaring=== undefined?true:goToWaring;
    var cscmObj  = g_CscmObj;
    if(!cscmObj)
    {
      
        return false;
    }
    var chkRet = null;
   
    chkRet = cscmObj.checkRelogin(GetCookie("TWFID"));
		//alert("esc"+chkRet);
    switch(chkRet){
        case RG_RELOGIN:
			if(goToWaring){
				GotoWarning();
			}
            return true;
        case RG_OK:
            return false;
        case RG_REFRESH:
            g_IsRefresh  = true;
            return false;
            break;
        default:return false;
    }
}

/** 
*重新加载BHO控件
*param 
domId[String] :  要输出的信息。
bhoId[String] : 模块名称，使用LOG_INFO、LOG_WARNING、LOG_ERR、LOG_DEBUG几类日志
*retvalue[object]:成功返回重新加载后的activex对象，否则返回false。
**/
function ReLoadBHO(domId,bhoId)
{
	var domObject = CreateObject(domId);
	if(domObject != null)
	{
		try{
			var bhoObject = null;
			if((bhoObject = CreateObject(bhoId)) != null);
				domObject.LoadBHO(document,bhoObject);
			return domObject;
		}catch(e){}
	}
	return false;
}


