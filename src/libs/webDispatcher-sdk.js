import axios from 'axios'
import CryptoJS from 'crypto-js'
//调度接口
// var dsUrl = 'http://192.168.5.222:803/ds';
var dsUrl = 'http://di.pocradio.com:5080/ds';
var ajax = new XMLHttpRequest();
//webSocket服务端
//var wip = '127.0.0.1';
// var wip = '192.168.5.222';
var wip = '139.224.117.109';
var wPort = 8031;
//webSocket
var webSocket = null;
//心跳
var HBInterval = null,
  HBTimeout = 120 * 1000;
//登录回调
var loginResp = null,
  loginInterval;
//切换群组回调
var changeResp = null,
  changeInterval;
//创建临时群组回调
var createTempGrpResp = null,
  createTempGrpInterval;
//解除临时群组回调
var removeTempGroupResp = null,
  removeTempGroupInterval;
//编辑临时群组
var editTempGroupResp = null,
  editTempGroupInterval;
//查询临时群组回调
var queryTempGroupInterval = null,
  queryTempGroupResp;
//接收通知
var noticeResp = null,
  getNoticeInterval;
//发送短信回调
var sendSMSResp = null,
  sendSMSInterval;
//接收短信
var smsResp = null,
  receiveSMSInterval;
//获取GPS
var gpsResp = null,
  receiveGPSInterval;
//通话设置
var callSetResp = null,
  callSetInterval;
//ptt状态
var pttSendStauts = null,
  pttResp = null,
  pttRespInterval;
//接收语音
var pttMsID = null,
  pttNameResp = null,
  isReceiveVoice = false,
  getPttNameInterval;
//收到语音
var voiceBuffer = [],
  isHup = false,
  isPtt = false,
  isPlay = false,
  playInterval, isHupInterval;
//保存语音
var useSaveBuffer = [],
  saveVoiceResp = null,
  saveVoiceInterval;
//speex编解码器
var speexCodec = null;
//获取服务器回调
var getServerInfoResp = null,
  getServerInfoInterval;
//获取群组回调
var getGroupResp = null,
  getGroupInterval;
//获取成员回调
var getMsResp = null,
  getMsInterval;
var msId, msPwd, token; // 用户信息
var isDev = false; //是否调试模式
var errorLogin = false; //是否登录失败或重复登录

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
    var sip = '192.168.5.222',
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
      sendToServer(map);
    }

    //接收到消息的回调方法
    webSocket.onmessage = function (event) {
      var data = eval('(' + decrypt(event.data) + ')');
      doReceive(data);
    }

    //连接关闭的回调方法
    webSocket.onclose = function () {
      if (isDev)
        console.log("webSocket close");
      setTimeout(function () {
        //掉线重连
        if (!errorLogin) {
          console.log("reconnect...");
          errorLogin = false;
          login(msId, msPwd, function (data) {
            console.log(data);
          });
        }
      }, 3000);
    }

    //连接发生错误的回调方法
    webSocket.onerror = function () {
      if (isDev)
        console.log("webSocket error");
    }

    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
      webSocket.close();
    }

    //返回结果定时器
    loginInterval = setInterval(function () {
      if (loginResp != null) {
        //清除定时器
        window.clearInterval(loginInterval);
        //执行回调方法
        if (callback && typeof (callback) === "function")
          callback(loginResp);
        //清除结果
        loginResp = null;
      }
    }, 100);
  })
}

//发送给webSocketServer
function sendToServer(map) {
  //if (webSocket) {
  webSocket.send(JSON.stringify(map));
  // } else {
  //   console.log("webSocket disconn!");
  // }
}

//处理指令
function doReceive(data) {
  switch (data.cmd) {
    case 'LOGIN':
      loginResp = data;

      if (data.code == 0) { //登录成功
        sendHB(); //获取心跳
        window.clearInterval(HBInterval);
        HBInterval = setInterval(sendHB, HBTimeout); //维持心跳
        getToken(); //获取token
      } else {
        errorLogin = true;
      }
      break;
    case 'HB':
      if (HBTimeout != data.hb * 1000) { //更新心跳间隔
        HBTimeout = data.hb * 1000;
        window.clearInterval(HBInterval);
        HBInterval = setInterval(sendHB, HBTimeout);
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
    case 'EDITTEMPGROUP_RESP':
      editTempGroupResp = data;
      break;
    case 'QUERYMEMBER_RESP':
      queryTempGroupResp = data;
      break;
    case 'NOTICE':
      noticeResp = data;

      if (data.type == 7) { //重复登录
        errorLogin = true;
      }
      break;
    case 'VOICE':
      handleVoice(data);
      break;
    case 'VOICE_RESP':
      pttSendStauts = data.code;
      pttResp = data;
      break;
    case 'HUP':
      handleHup();
      break;
    case 'SMS':
      smsResp = data;
      break;
    case 'SMS_RESP':
      sendSMSResp = data;
      break;
    case 'GPS':
      gpsResp = data;
      break;
    case 'CALL_SET_RESP':
      callSetResp = data;
      break;
  }
}

//发送心跳
function sendHB() {
  var map = {};
  map['cmd'] = 'HB';
  sendToServer(map);
}

//切换群组
function switchGroup(gid, callback) {
  var map = {};
  map['cmd'] = 'SWITCHGROP';
  map['gid'] = gid;
  sendToServer(map);

  //返回结果定时器
  changeInterval = setInterval(function () {
    if (changeResp != null) {
      //清除定时器
      window.clearInterval(changeInterval);
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(changeResp);
      //清除结果
      changeResp = null;
    }
  }, 100);
}

//创建临时群组
function createTempGroup(idCount, midOrGid, callback) {
  var map = {};
  map['cmd'] = 'CREATETEMPGROUP';
  map['idCount'] = idCount;
  map['midOrGid'] = midOrGid;
  sendToServer(map);

  //返回结果定时器
  createTempGrpInterval = setInterval(function () {
    if (createTempGrpResp != null) {
      //清除定时器
      window.clearInterval(createTempGrpInterval);
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(createTempGrpResp);
      //清除结果
      createTempGrpResp = null;
    }
  }, 100);
}

//解除临时群组
function removeTempGroup(type, callback) {
  var map = {};
  map['cmd'] = 'REMOVETEMPGROUP';
  map['type'] = type;
  sendToServer(map);

  //返回结果定时器
  removeTempGroupInterval = setInterval(function () {
    if (removeTempGroupResp != null) {
      //清除定时器
      window.clearInterval(removeTempGroupInterval);
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(removeTempGroupResp);
      //清除结果
      removeTempGroupResp = null;
    }
  }, 100);
}

//编辑临时群组
function editTempGroup(type, idCount, mids, callback) {
  var map = {};
  map['cmd'] = 'EDITTEMPGROUP';
  map['type'] = type;
  map['idCount'] = idCount;
  map['mids'] = mids;
  sendToServer(map);

  //返回结果定时器
  editTempGroupInterval = setInterval(function () {
    if (editTempGroupResp != null) {
      //清除定时器
      window.clearInterval(editTempGroupInterval);
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(editTempGroupResp);
      //清除结果
      editTempGroupResp = null;
    }
  }, 100);
}

//查询临时群组
function queryTempGroup(callback) {
  var map = {};
  map['cmd'] = 'QUERYMEMBER';
  map['type'] = 1;
  sendToServer(map);

  //返回结果定时器
  queryTempGroupInterval = setInterval(function () {
    if (queryTempGroupResp != null) {
      //清除定时器
      window.clearInterval(queryTempGroupInterval);
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(queryTempGroupResp);
      //清除结果
      queryTempGroupResp = null;
    }
  }, 100);
}

//接收通知
function receiveNotice(callback) {
  //返回结果定时器
  window.clearInterval(getNoticeInterval);
  getNoticeInterval = setInterval(function () {
    if (noticeResp != null) {
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(noticeResp);
      //清除结果
      noticeResp = null;
    }
  }, 10);
}

//发送短信
function sendSMS(mid, msName, msg, callback) {
  var map = {};
  map['cmd'] = 'SMS';
  map['mid'] = mid;
  map['msName'] = msName;
  map['msg'] = msg;
  sendToServer(map);

  //返回结果定时器
  sendSMSInterval = setInterval(function () {
    if (sendSMSResp != null) {
      //清除定时器
      window.clearInterval(sendSMSInterval);
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(sendSMSResp);
      //清除结果
      sendSMSResp = null;
    }
  }, 100);
}

//接收短信
function receiveSMS(callback) {
  //返回结果定时器
  window.clearInterval(receiveSMSInterval);
  receiveSMSInterval = setInterval(function () {
    if (smsResp != null) {
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(smsResp);
      //清除结果
      smsResp = null;
    }
  }, 100);
}

//获取GPS
function receiveGPS(callback) {
  //返回结果定时器
  window.clearInterval(receiveGPSInterval);
  receiveGPSInterval = setInterval(function () {
    if (gpsResp != null) {
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(gpsResp);
      //清除结果
      gpsResp = null;
    }
  }, 100);
}

//通话设置
function callSet(gid, mid, type, callback) {
  var map = {};
  map['cmd'] = 'CALL_SET';
  map['gid'] = gid;
  map['mid'] = mid;
  map['callType'] = type;
  sendToServer(map);

  //返回结果定时器
  callSetInterval = setInterval(function () {
    if (callSetResp != null) {
      //清除定时器
      window.clearInterval(callSetInterval);
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(callSetResp);
      //清除结果
      callSetResp = null;
    }
  }, 100);
}

//是否正在ptt
function isPtting() {
  return isPtt;
}

//开始ptt
function pttStart(callback) {
  if (!isDoor) {
    if (isDev)
      console.log("start ptt");
    isDoor = true;
    sRecorder.startRecord();

    //返回结果定时器
    pttRespInterval = setInterval(function () {
      if (pttResp != null) {
        //清除定时器
        window.clearInterval(pttRespInterval);
        //执行回调方法
        if (callback && typeof (callback) === "function")
          callback(pttResp);
        //清空结果
        pttResp = null;
      }
    }, 10);
  }
}

//结束ptt
function pttStop() {
  if (isDoor) {
    if (isDev)
      console.log("end ptt");
    sRecorder.endRecord(); //停止录音
    window.clearInterval(pttRespInterval); //停止ptt失败回调线程
    isDoor = false;
  }
}

//接收语音
function receiveVoice(callback) {
  isReceiveVoice = true;

  //返回结果定时器
  window.clearInterval(getPttNameInterval);
  getPttNameInterval = setInterval(function () {
    if (pttNameResp != null) {
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(pttNameResp);
      //清除结果
      pttNameResp = null;
    }
  }, 10);
}

//收到语音
function handleVoice(data) {
  var voice = data.data;
  if (isDev)
    console.log("recevice voice:", voice);

  //检验数据
  if (voice.length < 20)
    return;

  //是否接收语音
  if (isReceiveVoice) {
    //检查是否没有收到挂断指令
    var pttTime = 0;
    window.clearInterval(isHupInterval);
    isHupInterval = setInterval(function () {
      pttTime++;
      if (pttTime >= 3) {
        if (isHup == false) {
          isHup = true;
          sPlayer.endPlay();
          window.clearInterval(isHupInterval);
        }
      }
    }, 1000);

    //收到新的ptt
    if (voiceBuffer.length == 0) {
      pttMsID = data.pttId;
      pttNameResp = data.pttName;
      isHup = false;
      isPtt = true;
    }

    //Array转Uint8Array
    var intVoice = new Uint8Array(voice.length);
    for (let i = 0; i < intVoice.length; i++) {
      intVoice[i] = voice[i];
    }
    //console.log(intVoice);

    //speex解码
    if (speexCodec == null)
      initSpeex();
    var pcmBuffer = speexCodec.decode(intVoice);
    //console.log(pcmBuffer);

    //加入缓冲区
    inputUseSaveBuffer(pcmBuffer, false);

    //缓存4帧后播放
    if (!isPlay && voiceBuffer.length > 640) {
      sPlayer.startPlay();
    }
  }
}

//收到挂断
function handleHup() {
  isHup = true;
}

//保存语音
function saveVoice(callback) {
  //返回结果定时器
  window.clearInterval(saveVoiceInterval);
  saveVoiceInterval = setInterval(function () {
    if (saveVoiceResp != null) {
      //执行回调方法
      if (callback && typeof (callback) === "function")
        callback(saveVoiceResp);
      //清除结果
      saveVoiceResp = null;
    }
  }, 100);
}

//获取服务器信息
function getServerInfo(mid, callback) {
  ajax.open('get', dsUrl + '/pub/login?uid=' + mid);
  ajax.send();
  ajax.onreadystatechange = function () {
    if (ajax.readyState == 4) {
      if (ajax.status == 200) {
        let data = eval("(" + ajax.responseText + ")");
        getServerInfoResp = data;
      } else {
        let data = {};
        data['code'] = "503";
        getServerInfoResp = data;
      }
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
  }, 100);
}

//获取token
function getToken() {
  ajax.open('get', dsUrl + '/user?uid=' + msId + '&auth=' + (hex_md5(msId + msPwd)).toUpperCase());
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
  ajax.open('get', dsUrl + '/data/grps?auth=' + token + '&cid=' + msId);
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
  }, 100);
}

//获取成员列表
function getMsList(gid, callback) {
  ajax.open('get', dsUrl + '/data/clients?auth=' + token + '&cid=' + msId + '&gid=' + gid);
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
  }, 100);
}

//调试日志开关
function openDevLog(status) {
  isDev = status;
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

//////////////////////////////////////////////////语音模块////////////////////////////////////////////////////

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var aContext = new AudioContext();
var sRecorder, sPlayer, isDoor = false;

//加入用于保存的语音缓冲区
var inputUseSaveBuffer = function (buffer, myVoice) {
  for (let i = 0; i < buffer.length; i++) {
    useSaveBuffer.push(buffer[i]);

    if (!myVoice) { //不是自己的语音
      voiceBuffer.push(buffer[i]);
    }
  }
}

//返回用于保存语音
var returnSaveBuffer = function (id) {
  let data = sPlayer.encodeWav(useSaveBuffer);
  let map = {};
  map['msId'] = id;
  map['voice'] = data;
  saveVoiceResp = map;
  //sPlayer.playWav(data); //播放录音
  useSaveBuffer = []; //清空用于保存的语音

  var playAudio = (buffer) => {
    console.log(new Date().getSeconds() + ":" + new Date().getMilliseconds());

    //===============直接播流===================
    // var nowBuffer = aBuffer.getChannelData(0);
    // nowBuffer.set(buffer);
    // var source = aContext.createBufferSource();
    // source.buffer = aBuffer;
    // source.connect(aContext.destination);
    // source.onended = playNextBuffer;
    // source.start(0);

    //==================转wav再播====================
    var reader = new FileReader();
    reader.readAsArrayBuffer(new Blob([sPlayer.encodeWav(buffer)], {
      type: 'audio/wav'
    }));
    reader.onload = function (e) {
      aContext.decodeAudioData(reader.result, function (buffer) {
        var source = aContext.createBufferSource();
        source.buffer = buffer;
        source.connect(aContext.destination);
        source.onended = playNextBuffer;
        source.start(0);
      }, function (e) {
        console.log("Failed to decode the file");
      });
    }
  }

  var playNextBuffer = () => {
    if (useSaveBuffer.length == 0)
      return;

    var playBuff = [];
    if (useSaveBuffer.length >= 640) {
      for (var i = 0; i < 640; i++) {
        playBuff.push(useSaveBuffer.shift());
      }
      playAudio(playBuff);
      playBuff = [];
    } else {
      if (useSaveBuffer.length > 0) {
        playAudio(useSaveBuffer);
        useSaveBuffer = [];
      }
    }
  };

  //playNextBuffer();
}

//录音模块
var SRecorder = function (stream) {
  var audioInput; //录音节点
  var recorder = aContext.createScriptProcessor(1024, 1, 1); //录音缓冲区大小，输入通道数，输出通道数
  var reSampler = new Resampler(aContext.sampleRate, 8000, 1, 2048); //重置采样率

  var audioData = {
    audioBuffer: [], //录音缓冲区
    audioOffset: 0, //偏移量
    operateLength: (16 * aContext.sampleRate / 8) / 50, //操作长度 48k = 1920
    send: function () {
      var sendInterval = setInterval(function () {
        //ptt失败
        if (pttSendStauts != null) {
          sRecorder.endRecord(); //停止录音
          window.clearInterval(sendInterval); //结束发送线程
          pttSendStauts = null; //更新ptt状态
          audioData.audioBuffer = []; //清空录音缓冲区
          audioData.audioOffset = 0; //重置偏移量
          return;
        }

        //ptt结束
        if (!isDoor && ((audioData.audioOffset + 1) * audioData.operateLength) > (audioData.audioBuffer.length)) {
          window.clearInterval(sendInterval); //结束发送线程
          audioData.audioBuffer = []; //清空录音缓冲区
          audioData.audioOffset = 0; //重置偏移量
          returnSaveBuffer(msId); //返回保存用于的语音
          //发送挂断指令
          var map = {};
          map['cmd'] = 'HUP';
          sendToServer(map);
          return;
        }

        var startOffset = audioData.audioOffset * audioData.operateLength;
        var endOffset = (audioData.audioOffset + 1) * audioData.operateLength;
        var subAduio = audioData.audioBuffer.slice(startOffset, endOffset);
        //console.log(subAduio);

        //重置采样率
        var reSampleBuffer = reSampler.resampler(subAduio);
        //console.log(reSampleBuffer);

        //放进缓冲区，用于保存
        inputUseSaveBuffer(reSampleBuffer, true);

        //Float32Array转Int16Array
        var refillBuffer = new Int16Array(320);
        for (var i = 0; i < reSampleBuffer.length; ++i) {
          refillBuffer[i] = Math.ceil(reSampleBuffer[i] * 32768);
        }
        //console.log(refillBuffer);

        //speex编码
        if (speexCodec == null)
          initSpeex();
        var encodeBuffer = speexCodec.encode(refillBuffer);
        //console.log(encodeBuffer);

        //发送语音包
        var strData = encodeBuffer[0].join(",");
        var map = {};
        map['cmd'] = 'VOICEPAGE';
        map['data'] = strData;
        sendToServer(map);

        //偏移量递增
        audioData.audioOffset++;
      }, 40);
    }
  }

  //音频采集
  recorder.onaudioprocess = function (e) {
    var tempBuff = e.inputBuffer.getChannelData(0);
    if (isDev)
      console.log("record data:", tempBuff);
    for (let i = 0; i < tempBuff.length; i++) {
      audioData.audioBuffer.push(tempBuff[i]);

      //录音缓冲区长度满足操作长度
      if (audioData.audioBuffer.length == audioData.operateLength) {
        audioData.send();
      }
    }
  }

  //开始录音
  this.startRecord = function () {
    audioInput = aContext.createMediaStreamSource(stream);
    audioInput.connect(recorder);
    recorder.connect(aContext.destination);
  }

  //停止录音
  this.endRecord = function () {
    audioInput.disconnect();
    recorder.disconnect();
  }
}

//播放模块
var SPlayer = function () {
  var aBuffer = aContext.createBuffer(1, 320, 8000); //通道数，播放缓冲区大小，采样率

  var audioData = {
    voiceOffset: 0 //偏移量
  }

  this.playWav = function (data) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(new Blob([data], {
      type: 'audio/wav'
    }));
    reader.onload = function (e) {
      aContext.decodeAudioData(reader.result, function (buffer) {
        var source = aContext.createBufferSource();
        source.buffer = buffer;
        source.connect(aContext.destination);
        source.start(0);
      }, function (e) {
        console.log("Failed to decode the file");
      });
    }
  }

  this.encodeWav = function (pcmBuffer) {
    var sampleRate = 8000; //输出采样率
    var sampleBits = 16; //输出采样位数
    var dataLength = pcmBuffer.length * (sampleBits / 8);
    var buffer = new ArrayBuffer(44 + dataLength);
    var data = new DataView(buffer);
    var channelCount = 1; //单声道
    var offset = 0;
    var writeString = function (str) {
      for (var i = 0; i < str.length; i++) {
        data.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    // 资源交换文件标识符
    writeString('RIFF');
    offset += 4;
    // 下个地址开始到文件尾总字节数,即文件大小-8
    data.setUint32(offset, 36 + dataLength, true);
    offset += 4;
    // WAV文件标志
    writeString('WAVE');
    offset += 4;
    // 波形格式标志
    writeString('fmt ');
    offset += 4;
    // 过滤字节,一般为 0x10 = 16
    data.setUint32(offset, 16, true);
    offset += 4;
    // 格式类别 (PCM形式采样数据)
    data.setUint16(offset, 1, true);
    offset += 2;
    // 通道数
    data.setUint16(offset, channelCount, true);
    offset += 2;
    // 采样率,每秒样本数,表示每个通道的播放速度
    data.setUint32(offset, sampleRate, true);
    offset += 4;
    // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
    data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true);
    offset += 4;
    // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
    data.setUint16(offset, channelCount * (sampleBits / 8), true);
    offset += 2;
    // 每样本数据位数
    data.setUint16(offset, sampleBits, true);
    offset += 2;
    // 数据标识符
    writeString('data');
    offset += 4;
    // 采样数据总数,即数据总大小-44
    data.setUint32(offset, dataLength, true);
    offset += 4;
    // 写入采样数据
    if (sampleBits == 8) {
      for (var i = 0; i < pcmBuffer.length; i++ , offset++) {
        var s = Math.max(-1, Math.min(1, pcmBuffer[i]));
        var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
        val = parseInt(255 / (65535 / (val + 32768)));
        data.setInt8(offset, val, true);
      }
    } else {
      for (var i = 0; i < pcmBuffer.length; i++ , offset += 2) {
        var s = Math.max(-1, Math.min(1, pcmBuffer[i]));
        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    }

    return data;
  }

  //开始播放
  this.startPlay = function () {
    isPlay = true;

    playInterval = setInterval(function () {
      var playLength = 640;

      if (isHup && (audioData.voiceOffset + 1) * playLength > voiceBuffer.length) {
        sPlayer.endPlay();
        return;
      }

      if ((audioData.voiceOffset + 1) * playLength <= voiceBuffer.length) {
        var subVoice = voiceBuffer.slice(audioData.voiceOffset * playLength, (audioData.voiceOffset + 1) * playLength);
        //console.log(subVoice);

        //pcm转wav
        var wavData = sPlayer.encodeWav(subVoice);
        //console.log(wavData);

        //实时播放wav
        sPlayer.playWav(wavData);

        //实时播放pcm
        // var nowBuffering = aBuffer.getChannelData(0);
        // nowBuffering.set(subVoice);
        // var source = aContext.createBufferSource();
        // source.connect(aContext.destination);
        // source.buffer = aBuffer;
        // source.start(0);

        //偏移量递增
        audioData.voiceOffset++;
      }
    }, 80)
  }

  //结束播放
  this.endPlay = function () {
    if (isDev)
      console.log("end play");
    window.clearInterval(playInterval); //停止播放线程
    isPtt = false; //更新Ptt状态
    isPlay = false; //更新播放状态
    voiceBuffer = []; //清空接收的语音
    audioData.voiceOffset = 0; //重置偏移量
    returnSaveBuffer(pttMsID); //返回保存用于的语音
  }
}

// 新增=========================================================================
var SRecorder_get = function (callback) {
  if (callback) {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
          audio: true
        }).then((stream) => {
          var rec = new SRecorder(stream);
          hasRightOfMicro = true // 新增
          callback(rec);
        }).catch(() => {
          hasRightOfMicro = false
          callback()
        })
    } else {
      hasRightOfMicro = false
      // alert("getUserMedia not supported");
      callback()
    }
  }
}

//初始化speex编解码器
var initSpeex = function () {
  speexCodec = new Speex({
    quality: 3
  })
}

//初始化
var initVoiceModule = function () {
  //初始化录音模块
  SRecorder_get(function (rec) {
    sRecorder = rec;
  })
  //初始化播放模块
  sPlayer = new SPlayer();
}

initVoiceModule();

var hasRightOfMicro = false


function getGroupsList() {
  return axios({
    url: `${dsUrl}/data/grps?auth=${token}&cid=${msId}`
  })
}

function getMemberList(gid) {
  return axios({
    url: `${dsUrl}/data/clients?auth=${token}&cid=${msId}&gid=${gid}`
  })
}

function getRecorder () {
  return new Promise ((resolve, reject) => {
    SRecorder_get(function (rec) {
      sRecorder = rec;
      if (!hasRightOfMicro) {
          reject()
      } else {
        resolve()
      }
    });
  })
}

export {
  login,
  getGroupsList,
  getMemberList,
  switchGroup,
  createTempGroup,
  removeTempGroup,
  isPtting,
  pttStart,
  pttStop,
  webSocket,
  receiveNotice,
  receiveVoice,
  saveVoice,
  token,
  queryTempGroup,
  sendSMS,
  receiveSMS,
  receiveGPS,
  hasRightOfMicro,
  getRecorder,
  callSet,
  getMsList,
  editTempGroup
}