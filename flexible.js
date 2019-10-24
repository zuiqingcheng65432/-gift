;(function(win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexible = {});
    var TIMEOUT = 300;

    if (metaEl) {
        console.warn('将根据已有的meta标签来设置缩放比例');
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);
        }
    } else if (flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
            if (maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
        }
    }

    if (!dpr && !scale) {
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1;
        }
        scale = 1 / dpr;
    }

    docEl.setAttribute('data-dpr', dpr);
    if (!metaEl) {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute(
            'content',
            'initial-scale=' + scale +
                ', maximum-scale=' + scale +
                ', minimum-scale=' + scale +
                ', user-scalable=no'
        );
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    function refreshRem() {
        var width = docEl.getBoundingClientRect().width;
        // 暂时不知道taobao限制540宽度的用意,去掉先
        if (width / dpr > 540) {
            width = 540 * dpr;
        }
        var rem = width / 10;
        docEl.style.fontSize = (rem < 60 ? rem : 60) + 'px';
        flexible.rem = win.rem = rem;
        
 //     为了解决本文bug，后加的几行代码-----开始
        // var h = Math.max(docEl.clientHeight, window.innerHeight || 0);
        // var w = Math.max(docEl.clientWidth, window.innerWidth || 0);
        // var width1 = w > h ? h : w;
        // width1 = width1 > 1500 ? 1500 : width1
        // var fz = ~~(width1*100000/100)/10000
        // doc.getElementsByTagName("html")[0].style.cssText = 'font-size: ' + fz +"px";
        // var realfz = ~~(+window.getComputedStyle(doc.getElementsByTagName("html")[0]).fontSize.replace('px','')*10000)/10000
        // if (fz !== realfz) {
        //     doc.getElementsByTagName("html")[0].style.cssText = 'font-size: ' + fz * (fz / realfz) +"px";
        //     // docEl.style.fontSize = fz * (fz / realfz) + 'px';  //跟上面那句代码一个意思，都行
        // }
        //     为了解决本文bug，后加的几行代码-----结束
    }
    refreshRem();


    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, TIMEOUT);
    }, false);

    window.addEventListener('pageshow', (e) => {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, TIMEOUT);
    }, false)

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }

    

    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function(d) {
        var val = parseFloat(d) * this.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val;
    };
    flexible.px2rem = function(d) {
        var val = parseFloat(d) / this.rem;
        if (typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val;
    };
})(window, window['lib'] || (window['lib'] = {}));



function addCookie(objName,objValue,objHours){//添加cookie
    var str = objName + "=" + escape(objValue);
    if(objHours > 0){//为0时不设定过期时间，浏览器关闭时cookie自动消失
        var date = new Date();
        var ms = objHours*3600*1000;
        date.setTime(date.getTime() + ms);
        str += "; expires=" + date.toGMTString()+";path=/";
    }
    document.cookie = str;
}

function getCookie(objName){//获取指定名称的cookie的值
    var arrStr = document.cookie.split("; ");
    for(var i = 0;i < arrStr.length;i ++){
        var temp = arrStr[i].split("=");
        if(temp[0] == objName) return unescape(temp[1]);
    }
}

function uniqueArray(data){
    data = data || [];
    var a = {};
    for (var i=0; i<data.length; i++) {
        var v = data[i];
        if (typeof(a[v]) == 'undefined'){
            a[v] = 1;
        }
    };
    data.length=0;
    for (var i in a){
        data[data.length] = i;
    }
    return data;
}

function getHostUrl(){
  var url = document.domain;
    return 'http://'+url;
}

/**
 *
 *
 * @param type
 * @param articleId
 * 发送书籍详情
 */
function sendArticleInfo(recid,wid) {
    var readflag = arguments[2] ? arguments[2] : "";
    var cid_index = arguments[3] ? arguments[3] : "";
    var chapter_count = arguments[4] ? arguments[4] : "";
    var bookname = arguments[5] ? arguments[5] : "";
    var image = arguments[6] ? arguments[6] : "";
    var update = arguments[7] ? arguments[7] : "";
    var author = arguments[8] ? arguments[8] : "";

    data = {'rec_id':recid,'recid':recid,wid:wid,'readflag':readflag};
    if(readflag==1){
        data = {'rec_id':recid,'recid':recid,wid:wid,'readflag':readflag,'cid_index':cid_index,'cic':chapter_count,'bn':bookname,'bp':image,'ud':update,'an':author};
    }
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getArticleInfo(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getArticleInfo##" + result;
    }
}

/**
 *
 * 打开二级页
 * @param url
 * @param data
 */

// 跳转到意见反馈页面
function openFeedBack(){
    if(/android/i.test(navigator.userAgent)) { //安卓
        JsAndroid.openFeedBack();
    }
    if(/ipad|iphone|mac/i.test(navigator.userAgent)){  //ios
        document.location = "objc://openFeedBack##";
    }
}

function sendPageUrl(url,share) {
    var host_url = getHostUrl();
    var shareurl = arguments[2] ? arguments[2] : "";
    var type = arguments[3] ? arguments[3] : 0;
    var pagefresh = arguments[4] ? arguments[4] : 0;
    var title = arguments[5] ? arguments[5] : 0;
    var desc = arguments[6] ? arguments[6] : 0;
    var image = arguments[7] ? arguments[7] : 0;
    var sharefresh = arguments[8] ? arguments[8] : 0;
    //暂时策略
    if(url.indexOf('?')>0){
        url = url +"&";
    }
    //data = {"path":url,"url":"http://mwww.boetech.cn/",'share':share,'shareurl':shareurl,'type':type};
    data = {"path":url,"url":host_url,'share':share,'shareurl':host_url+shareurl,'type':type,'pagefresh':pagefresh,'title':title,'desc':desc,'image':image,'sharefresh':sharefresh};
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getPageUrl(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getPageUrl##" + result;
    }
}


/**
 * 跳转到外部URL
 * @param url
 * @param domain
 * @param type
 */
function sendAdUrl(url, recid) {
    data = {"url":url,'rec_id':recid};
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getAdUrl(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        document.location = "objc://getAdUrl##" + result;
    }
}

/**
 *
 * 批量购买
 */
function sendOrderRespond(wid,from,count) {
    var data = {"wid":wid,"from": from,"count":count};
    console.log(data);
    var str = JSON.stringify(data);
    var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓
        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getOrderRespond(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getOrderRespond##" + returndata;
    }
}


/**
 *
 * 跳调到充值方式页面
 * @param path
 * @param from
 * @param to
 */
function sendChannelWay(path,channel,channel_type) {
    var data = {"path":path,"channel":channel,"channel_type":channel_type};
    console.debug(data);
    var str = JSON.stringify(data);
    var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getChannelWay(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getChannelWay##" + returndata;
    }
}


/**
 *
 * 充值
 * @param path
 * @param channel
 * @param channel_type
 * @param money
 */
function sendPayInfo(channel,channel_type,money,ruleid,iapid,activityId) {
    ruleid = arguments[3] ? arguments[3] : '';
    iapid = arguments[4] ? arguments[4] : '';
    activityId = arguments[5] ? arguments[5] : 0;
    var custom = {
        'rule_id':ruleid
    };

    var data = {"channel":channel,"channel_type":channel_type,'money':money,'rule_id':ruleid,'iapid':iapid,'custom':custom};
    var str = JSON.stringify(data);
    var returndata=base64_encode(utf16to8(str));

    if (/android/i.test(navigator.userAgent)) {//安卓
        
        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getPayInfo(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getPayInfo##" + returndata;
    }
}

/**
 *
 * IOS充值
 * @param channel
 * @param param
 * @param money
 */
function sendAppStore(channel,param,money,activityId) {
    activityId = arguments[3] ? arguments[3] : 0;
    var custom = {
        'activityId':activityId
    };

    var data = {"channel":channel,"param":param,'money':money,'custom':custom};
    var str = JSON.stringify(data);
    var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getAppStore(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getAppStore##" + returndata;
    }
}

/**
 *
 * 包月充值
 * @param path
 * @param channel
 * @param channel_type
 */
function sendMonthlyPayInfo(channel,channel_type,money,monthCount,ruleid,iapid) {
    monthCount = arguments[3] ? arguments[3] : '';
    ruleid = arguments[4] ? arguments[4] : '';
    iapid = arguments[5] ? arguments[5] : '';
    var custom = {
        'rule_id':ruleid
    };
    var data = {"channel":channel,"channel_type":channel_type,'rmb':money,'counts':monthCount,'iapid':iapid,'rule_id':ruleid,'custom':custom};
    var str = JSON.stringify(data);
    console.log(str);
    var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓
        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getMonthlyPayInfo(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getMonthlyPayInfo##" + returndata;
    }
}



/**
 *
 * 包月消费
 * @param path
 * @param channel
 * @param channel_type
 */
function sendMonthlyCostInfo(channel_type,money,monthCount,ruleid) {
    var data = {"counts":monthCount,"channel_type":channel_type,'money':money,'rule_id':ruleid};
    var str = JSON.stringify(data);
    var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getMonthlyCostInfo(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getMonthlyCostInfo##" + returndata;
    }
}

/**
 *
 * IOS包月充值
 * @param channel
 * @param param
 * @param money
 */
function sendMonthlyStore(channel,param,money) {
    var data = {"channel":channel,"param":param,'money':money};
    var str = JSON.stringify(data);
    var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓
        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getMonthlyStore(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getMonthlyStore##" + returndata;
    }
}

/**
 *
 * 查看作者
 * @param authorid
 */
function sendAuthorInfo(authorid) {
    var data = {"authorid":authorid};
    var str = JSON.stringify(data);
    var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓
        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getAuthorInfo(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getAuthorInfo##" + returndata;
    }
}


/**
 * 偏好设置
 */
function setPreference() {

    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getPreference();
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getPreference##";
    }
}

/**
 * 服务条款ＪＳ交互
 * @param url
 * @param data
 */
function sendPagePrivate(url,data) {
    var host_url = getHostUrl();
    //暂时策略
    if(url.indexOf('?')>0){
        url = url +"&";
    }
    console.log(url);
    data = {"path":url,"url":host_url};
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getPagePrivate(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getPagePrivate##" + result;
    }
}


function preventParentTouchEvent() {
    var data = {"path":""};
    var str = JSON.stringify(data);

    var returndata=base64_encode(utf16to8(str));
        console.debug(returndata);
    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.preventParentTouchEvent(returndata);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://preventParentTouchEvent##" + returndata;
    }
}


/**
 * 发起书籍限免投票
 * @param url
 * @param data
 */
function sendVoteOrSign(url,articleid,type) {
    //1为投票2为签到
    data = {"path":url,"url":"http://appapi.xiang5.com/","articleid":articleid,"type":type};
    console.debug(data);
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓

        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getVoteOrSign(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        document.location = "objc://getVoteOrSign##" + result;
        //document.location = "objc://getPageUrl##" + result;
        //console.debug("ios_out");
    }

}

function sendShareUrl(path,recid,type,shareUrl){
    var host_url = getHostUrl();
    var fresh = arguments[4] ? arguments[4] : 0;
    var title = arguments[5] ? arguments[5] : '';
    var desc = arguments[6] ? arguments[6] : '';
    var image = arguments[7] ? arguments[7] : '';
    params = {"path":path,"url":host_url,"data":recid,"type":type,"shareurl":host_url+shareUrl,"sharefresh":fresh,"title":title, "desc":desc, "image":image};
    result = JSON.stringify(params);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
    //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
    JsAndroid.getShareUrl(result);
  }
  if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
    document.location = "objc://getShareUrl##" + result;
    //document.location = "objc://getPageUrl##" + result;
    //console.debug("ios_out");
  }
}


function sendShopUrl(url) {
    data = {"url":url};
    console.debug(data);
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
        //window["JsAndroid"][cmd].apply(window.JsAndroid, param);
        JsAndroid.getShopUrl(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getShopUrl##" + result;
    }
}


/**
 * 跳转到登陆页
 * @param path
 * @param url
 */
function sendLoginUrl(path,url) {
    data = {"path":path,"url":url};
    console.debug(data);
    result = JSON.stringify(data);
    result = base64_encode(result);
    if(/android/i.test(navigator.userAgent)) { //安卓
        JsAndroid.getLoginUrl(result);
    }
    if(/ipad|iphone|mac/i.test(navigator.userAgent)){  //ios

        document.location = "objc://getLoginUrl##"+result;
    }
}


/**
 * 调起充值
 * @param path
 * @param device
 */
function sendRecharge(path,device) {
  data = {"path":path,"device":device};
  result = JSON.stringify(data);
  result = base64_encode(result);
  if(/android/i.test(navigator.userAgent)) { //安卓
    JsAndroid.getRecharge(result);
  }
  if(/ipad|iphone|mac/i.test(navigator.userAgent)){  //ios

    document.location = "objc://getRecharge##"+result;
  }
}



/**
 * 跳转到充值页面
 * @param path
 * @param url
 */
function sendRechargeUrl(path,url) {
    data = {"path":path,"url":url};
    console.debug(data);
    result = JSON.stringify(data);
    result = base64_encode(result);
    if(/android/i.test(navigator.userAgent)) { //安卓
        JsAndroid.getRechargeUrl(result);
    }
    if(/ipad|iphone|mac/i.test(navigator.userAgent)){  //ios

        document.location = "objc://getRechargeUrl##"+result;
    }
}

/**
 * 跳转到搜索页面
 * @param searchflag
 * @param searchstr
 */
function sendSearchUrl(searchflag,searchstr) {

    data = {'searchflag':searchflag,'searchstr':searchstr};
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getSearchUrl(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        document.location = "objc://getSearchUrl##" + result;
    }
}

/**
 * 服务器调用的按照安卓的进行调用
 * @param homeindex
 * @param pageindex
 */
function sendNativePageUrl(homeindex,pageindex) {
    android = {'homeindex':homeindex,'pageindex':pageindex};
    if(homeindex==0){
        var map = [2,1,0];
        pageindex = map[pageindex];
    }
    ios = {'homeindex':homeindex,'pageindex':pageindex};

    android = JSON.stringify(android);
    android = base64_encode(android);
    ios = JSON.stringify(ios);
    ios = base64_encode(ios);
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getNativePageUrl(android);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios

        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getNativePageUrl##" + ios;
    }
}

/**
 * 跳转原声排行榜
 * @param path
 * @param url
 */
function sendRankInfo(page_type,rank_type,cycle_type) {
    console.log(page_type,rank_type,cycle_type);
    data = {"page_type":page_type,"rank_type":rank_type,"cycle_type":cycle_type};
    result = JSON.stringify(data);
    result = base64_encode(result);
    if(/android/i.test(navigator.userAgent)) { //安卓
        JsAndroid.getRankInfo(result);
    }
    if(/ipad|iphone|mac/i.test(navigator.userAgent)){  //ios
        document.location = "objc://getRankInfo##"+result;
    }
}

/**
 * 书库筛选页面
 * @param searchflag
 * @param searchstr
 */
function sendLibraryInfo(psid,pname,order) {
    var sort_id = arguments[3] ? arguments[3] : -1;
    var is_finish = arguments[4] ? arguments[4] : -1;
    var is_vip = arguments[5] ? arguments[5] : -1;
    var word_total = arguments[6] ? arguments[6] : -1;
    data = {'parent_sortid':psid,'pname':pname,'sort_id':sort_id,'is_finish':is_finish,'is_vip':is_vip,'word_total':word_total,'order':order};
    // console.log(data);
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getLibraryInfo(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        //window["JsIOS"][cmd + ":"].apply(this, str, str1);
        document.location = "objc://getLibraryInfo##" + result;
    }
}

function endVideo() {
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.endVideo();
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        document.location = "objc://getTaskUrl##";
    }
}


// function md5str(data){
//     var {path,time,uid,token}=data;
//     var hashs = [
//         [0, 5, 9, 15, 22, 28],
//         [2, 8, 19, 25, 30, 31],
//         [20, 25, 31, 3, 4, 8],
//         [25, 31, 0, 9, 13, 17],
//         [29, 2, 11, 17, 21, 26],
//         [10, 15, 18, 29, 2, 3],
//         [5, 10, 15, 17, 18, 22],
//         [8, 20, 22, 27, 19, 21],
//     ];
//     var strs = token.substr(2, 1);
//     strs += token.substr(5, 1);
//     strs += token.substr(8, 1);
//     var code = parseInt(strs,16);
//     str1 = code % 8;
//     var arr = hashs[str1];
//     var m = null;
//     arr.forEach(v=>{
//         m+=token.substr(v,1);
//     })
//     data = {'path':path,'time':time,'uid':uid,'token':token};
//     var params = JSON.stringify(data);
//     params = base64_encode(params);
//     var finalstr=path+time+uid+params+m;
//     var str=$.md5(finalstr);
//     return finalstr;
// }




/**
 * 跳转任务
 */
function setTaskUrl() {
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getTaskUrl();
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        document.location = "objc://getTaskUrl##";
    }
}


/**
 *
 * banner图看轮播(安卓)
 */
function sendH5BannerInfo(yindex,top,height) {
    // var data = {"yindex":yindex,"height": height};
    // var str = JSON.stringify(data);
    // var returndata=base64_encode(utf16to8(str));
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getH5BannerInfo(yindex,top,height);
    }

}


// 支付宝返回成功失败状态
function setPayResult(status,msg) {
    data = {'status':status,'msg':msg};
    // console.log(data);
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getPayResult(result);
    }
    if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
        document.location = "objc://getPayResult##" + result;
    }
}

/**
 *
 * 友盟统计
 */
function sendMobclickAgent(key,position) {
    var param = {
        'position':position
    };
    data = {'key':key,'info':param};
    console.log(data);
    result = JSON.stringify(data);
    result = base64_encode(result);
    if (/android/i.test(navigator.userAgent)) {//安卓
        JsAndroid.getMobclickAgent(result);
    }
    // if (/ipad|iphone|mac/i.test(navigator.userAgent)) {//ios
    //     requestAnimationFrame(function(){
    //     　　document.location = "objc://getMobclickAgent##" + result;
    //     })
        
    // }

}






