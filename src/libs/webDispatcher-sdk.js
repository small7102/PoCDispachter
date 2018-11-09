import axios from 'axios'
import CryptoJS from 'crypto-js/crypto-js'
//webSocket
var webSocket = null;
//心跳
var HBInterval = null,
    timeout = 120 * 1000;
//登录回调
var loginResp = null,
    getLoginInterval;
//切换群组回调
var changeResp = null,
    getChangeInterval;
//创建临时群组回调
var createTempGrpResp = null,
    getGreateTempGrpInterval;
//解除临时群组回调
var removeTempGroupResp = null,
    getRemoveTempGroupInterval;
//接收通知
var noticeResp = null,
    getNoticeInterval;
// //接收语音
// var pttId = null,
//     pttName = null,
//     isReceive = false,
//     getPttNameInterval;
// //收到语音
// var voiceBuffer = [],
//     isHup = false,
//     isPtt = false,
//     isPlaying = false,
//     playInterval, isHupInterval;
//保存语音
var saveBuff = null,
    saveVoiceInterval;
//获取群组回调
var getGroupResp = null,
    getGroupInterval;
//获取成员回调
var getMsResp = null,
    getMsInterval;
//获取服务器回调
var getServerInfoResp = null,
    getServerInfoInterval;
//终端信息
var msId, msPwd, token;
//调度接口
// var _url = 'http://192.168.5.222:803/ds';
var _url = 'http://di.pocradio.com:5080/ds';
var ajax = new XMLHttpRequest();
//webSocket服务端
//var wip = '127.0.0.1';
//var wip = '192.168.5.222';
var wip = '139.224.117.109';
var wPort = 8031;

//语音模块
// var sRecorder, door = false;

//登录
function login(mid, pwd, callback) {
    getServerInfo(mid, function (data) {
        if (data.code != 0) {
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(data);
            return;
        }

        //终端当前服务器ip、端口
        var sip = '192.168.5.56',
            sPort = 9988;
        sip = data.ip;
        sPort = data.tport;

        //判断当前浏览器是否支持WebSocket
        if ('WebSocket' in window) {
            webSocket = new WebSocket("ws://" + wip + ":" + wPort + "/webSocket");
        } else {
            console.log('Not support webSocket');
        }

        //连接成功建立的回调方法
        webSocket.onopen = function (event) {
            //发送登录指令
            var map = {};
            map['cmd'] = 'LOGIN';
            map['ip'] = sip;
            map['port'] = sPort;
            map['mid'] = msId = mid;
            map['pwd'] = msPwd = pwd;
            webSocket.send(JSON.stringify(map));
        }

        //接收到消息的回调方法
        webSocket.onmessage = function (event) {
            var data = eval('(' + decrypt(event.data) + ')');
            doReceive(data);
        }

        //连接关闭的回调方法
        webSocket.onclose = function () {
            console.log("webSocket close");

            //掉线重连
            setTimeout(function () {
                console.log("reconnect...");
                login(msId, msPwd, function (data) {
                    console.log(data);
                });
            }, 3000);
        }

        //连接发生错误的回调方法
        webSocket.onerror = function () {
            console.log("webSocket error");

            //错误重连
            setTimeout(function () {
                console.log("reconnect...");
                login(msId, msPwd, function (data) {
                    console.log(data);
                });
            }, 3000);
        }

        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function () {
            webSocket.close();
        }

        //返回结果定时器
        getLoginInterval = setInterval(function () {
            if (loginResp != null) {
                //清除定时器
                window.clearInterval(getLoginInterval);
                //执行回调方法
                if (callback && typeof (callback) === "function")
                    callback(loginResp);
                //清除结果
                loginResp = null;
            }
        }, 500);
    })
}

//维持心跳
function sendHB() {
    var map = {};
    map['cmd'] = 'HB';
    webSocket.send(JSON.stringify(map));
}

//切换群组
function switchGroup(gid, callback) {
    var map = {};
    map['cmd'] = 'SWITCHGROP';
    map['gid'] = gid;
    webSocket.send(JSON.stringify(map));

    //返回结果定时器
    getChangeInterval = setInterval(function () {
        if (changeResp != null) {
            //清除定时器
            window.clearInterval(getChangeInterval);
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(changeResp);
            //清除结果
            changeResp = null;
        }
    }, 500);
}

//创建临时群组
function createTempGroup(idCount, midOrGid, callback) {
    var map = {};
    map['cmd'] = 'CREATETEMPGROUP';
    map['idCount'] = idCount;
    map['midOrGid'] = midOrGid;
    webSocket.send(JSON.stringify(map));

    //返回结果定时器
    getGreateTempGrpInterval = setInterval(function () {
        if (createTempGrpResp != null) {
            //清除定时器
            window.clearInterval(getGreateTempGrpInterval);
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(createTempGrpResp);
            //清除结果
            createTempGrpResp = null;
        }
    }, 500);
}

//解除临时群组
function removeTempGroup(type, callback) {
    var map = {};
    map['cmd'] = 'REMOVETEMPGROUP';
    map['type'] = type;
    webSocket.send(JSON.stringify(map));

    //返回结果定时器
    getRemoveTempGroupInterval = setInterval(function () {
        if (removeTempGroupResp != null) {
            //清除定时器
            window.clearInterval(getRemoveTempGroupInterval);
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(removeTempGroupResp);
            //清除结果
            removeTempGroupResp = null;
        }
    }, 500);
}

//接收通知
function receiveNotice(callback) {
    window.clearInterval(getNoticeInterval);
    //返回结果定时器
    getNoticeInterval = setInterval(function () {
        if (noticeResp != null) {
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(noticeResp);
            //清除结果
            noticeResp = null;
        }
    }, 500);
}

//是否正在ptt
function isPtting() {
    return isPtt;
}

//开始ptt
function pttStart() {
    if (!door) {
        console.log(sRecorder)
        sRecorder.start();
        door = true;
        console.log("recording...");
    }
}

//结束ptt
function pttStop() {
    if (door) {
        sRecorder.stop();
        door = false;
        console.log("stop record");
    }
}

//接收语音
function receiveVoice(callback) {
  console.log('sdk1')
    window.clearInterval(getPttNameInterval);
    //返回结果定时器
    getPttNameInterval = setInterval(function () {
        if (pttName != null) {
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(pttName);
            //清除结果
            pttName = null;
        }
    }, 20);

    isReceive = true;
}

//收到语音
function handleVoice(data) {
    var voice = data.data;
    console.log(voice);

    //检验数据
    if (voice.length < 20)
        return;

    //是否接收语音
    if (isReceive) {
        //检查是否没有收到挂断指令
        var pttTime = 0;
        window.clearInterval(isHupInterval);
        isHupInterval = setInterval(function () {
            pttTime++;
            if (pttTime >= 3) {
                if (isHup == false) {
                    isHup = true;
                    sRecorder.stopPlay();
                    window.clearInterval(isHupInterval);
                }
            }
        }, 1000);

        //收到新的ptt
        if (voiceBuffer.length == 0) {
            pttId = data.pttId;
            pttName = data.pttName;
            isHup = false;
            isPtt = true;
        }

        //缓存4帧后播放
        if (!isPlaying && voiceBuffer.length > 80) {
            sRecorder.play();
        }

        //加入缓存区
        for (var i = 0; i < voice.length; i++) {
            voiceBuffer.push(voice[i]);
        }
    }
}

//收到挂断
function handleHup() {
    isHup = true;
}

//保存语音
function saveVoice(callback) {
    window.clearInterval(saveVoiceInterval);
    //返回结果定时器
    saveVoiceInterval = setInterval(function () {
        if (saveBuff != null) {
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(saveBuff);
            //清除结果
            saveBuff = null;
        }
    }, 100);
}

//处理指令
function doReceive(data) {
    switch (data.cmd) {
        case 'LOGIN':
            loginResp = data;

            if (data.code == 0) { //登录成功
                HBInterval = setInterval(sendHB, timeout); //维持心跳
                getToken(); //获取token
            }
            break;
        case 'HB':
            if (timeout != data.hb) { //更新心跳间隔
                timeout = data.hb * 1000;
                window.clearInterval(HBInterval);
                HBInterval = setInterval(sendHB, timeout);
            }
            break;
        case 'SWITCHGROP':
            changeResp = data;
            break;
        case 'CREATETEMPGROUP':
            createTempGrpResp = data;
            break;
        case 'REMOVETEMPGROUP':
            removeTempGroupResp = data;
            break;
        case 'NOTICE':
            noticeResp = data;
            break
        case 'VOICE':
            handleVoice(data);
            break;
        case 'HUP':
            handleHup();
            break;
    }
}

//获取token
function getToken() {
    ajax.open('get', _url + '/user?uid=' + msId + '&auth=' + (hex_md5(msId + msPwd)).toUpperCase());
    ajax.send();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var data = eval("(" + ajax.responseText + ")");
            token = data.desc;
        }
    }
}

//获取群组列表
function getGroupList(callback) {
    ajax.open('get', _url + '/data/grps?auth=' + token + '&cid=' + msId);
    ajax.send();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var data = eval("(" + ajax.responseText + ")");
            getGroupResp = data;
        }
    }

    //返回结果定时器
    getGroupInterval = setInterval(function () {
        if (getGroupResp != null) {
            //清除定时器
            window.clearInterval(getGroupInterval);
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(getGroupResp);
            //清除结果
            getGroupResp = null;
        }
    }, 500);
}

function getGroupsList() {
  return axios({
    url: `${_url}/data/grps?auth=${token}&cid=${msId}`
  })
}

//获取成员列表
function getMsList(gid, callback) {
    ajax.open('get', _url + '/data/clients?auth=' + token + '&cid=' + msId + '&gid=' + gid);
    ajax.send();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var data = eval("(" + ajax.responseText + ")");
            getMsResp = data;
        }
    }

    //返回结果定时器
    getMsInterval = setInterval(function () {
        if (getMsResp != null) {
            //清除定时器
            window.clearInterval(getMsInterval);
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(getMsResp);
            //清除结果
            getMsResp = null;
        }
    }, 500);
}

function getMemberList(gid) {
  return axios({
    url: `${_url}/data/clients?auth=${token}&cid=${msId}&gid=${gid}`
  })
}

//获取服务器信息
function getServerInfo(mid, callback) {
    ajax.open('get', _url + '/pub/login?uid=' + mid);
    ajax.send();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var data = eval("(" + ajax.responseText + ")");
            getServerInfoResp = data;
        }
    }

    //返回结果定时器
    getServerInfoInterval = setInterval(function () {
        if (getServerInfoResp != null) {
            //清除定时器
            window.clearInterval(getServerInfoInterval);
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(getServerInfoResp);
            //清除结果
            getServerInfoResp = null;
        }
    }, 500);
}

//关闭连接
function closeWebSocket() {
    if (webSocket != null) {
        webSocket.close();
        webSocket = null;
    }
}

//加密
function encrypt(msg) {
    var key = CryptoJS.enc.Utf8.parse("ZheShiYiGeMiYaoO");
    var srcs = CryptoJS.enc.Utf8.parse(msg);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

//解密
function decrypt(msg) {
    var key = CryptoJS.enc.Utf8.parse("ZheShiYiGeMiYaoO");
    var decrypt = CryptoJS.AES.decrypt(msg, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

export {
  login,
  getGroupList,
  getGroupsList,
  getMemberList,
  switchGroup,
  createTempGroup,
  removeTempGroup,
  isPtting,
  pttStart,
  pttStop,
  webSocket
}