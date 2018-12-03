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
// //接收语音
var pttId = null,
    pttName = null,
    isReceive = false,
    getPttNameInterval;
//收到语音
var voiceBuffer = [],
    isHup = false,
    isPtt = false,
    isPlaying = false,
    playInterval, isHupInterval;
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
//调试模式
var isDev = false;
//登录失败或重复登录
var errorLogin = false;
//语音模块
var sRecorder, door = false;
//调度接口
var _url = 'http://192.168.5.222:803/ds';
//var _url = 'http://di.pocradio.com:5080/ds';
var ajax = new XMLHttpRequest();
//webSocket服务端
// var wip = '127.0.0.1';
var wip = '192.168.5.222';
//var wip = '139.224.117.109';
var wPort = 8031;

//调整兼容
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var audioContext = window.AudioContext || window.webkitAudioContext;

var SRecorder = function (stream) {
    var aContext = new audioContext();
    var audioInput = aContext.createMediaStreamSource(stream);
    var recorder = aContext.createScriptProcessor(1024, 1, 1); //录音缓冲区大小，输入通道数，输出通道数

    //实例化speex编码器
    var codec = new Speex({
        quality: 3
    });
    //重置采样率
    var resampler = new Resampler(aContext.sampleRate, 8000, 1, 2048);

    var audioData = {
        audioBuffer: [], //语音缓存
        audioOffset: 0, //偏移量
        useSaveBuffer: [], //用于保存的语音
        inputUseSaveBuffer: function (buffer) {
            for (let i = 0; i < buffer.length; i++) {
                this.useSaveBuffer.push(buffer[i]);
            }
        },
        inputSaveBuffer: function (id) {
            let map = {};
            map['msId'] = id;
            let data = this.encodeWav(this.useSaveBuffer);
            map['voice'] = data;
            saveBuff = map;
            //this.playWav(data);
            this.useSaveBuffer = [];
        },
        send: function () {
            var sendInterval;
            var sendLength = (16 * aContext.sampleRate / 8) / 50;

            sendInterval = setInterval(function () {
                if (!door && ((audioData.audioOffset + 1) * sendLength) > (audioData.audioBuffer.length)) {
                    window.clearInterval(sendInterval);
                    audioData.audioBuffer = [];
                    audioData.audioOffset = 0;
                    audioData.inputSaveBuffer(msId);
                    //发送挂断指令
                    var map = {};
                    map['cmd'] = 'HUP';
                    webSocket.send(JSON.stringify(map));
                    return;
                }

                //重置采样率
                var resSampleBuffer = resampler.resampler(audioData.audioBuffer.slice(audioData.audioOffset * sendLength, (audioData.audioOffset + 1) * sendLength));
                //console.log(resSampleBuffer);
                audioData.inputUseSaveBuffer(resSampleBuffer);

                //Float32Array转Int16Array
                var refillBuffer = new Int16Array(320);
                for (var i = 0; i < resSampleBuffer.length; ++i) {
                    refillBuffer[i] = Math.ceil(resSampleBuffer[i] * 32767);
                }
                //console.log(refillBuffer);

                //speex编码
                var encodeBuffer = codec.encode(refillBuffer);
                //console.log(encodeBuffer);

                //发送语音包
                var strData = encodeBuffer[0].join(",");
                var map = {};
                map['cmd'] = 'VOICEPAGE';
                map['data'] = strData;
                webSocket.send(JSON.stringify(map));

                //偏移量递增
                audioData.audioOffset++;
            }, 40);
        },
        encodeWav: function (pcmBuffer) {
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
                for (var i = 0; i < pcmBuffer.length; i++, offset++) {
                    var s = Math.max(-1, Math.min(1, pcmBuffer[i]));
                    var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    val = parseInt(255 / (65535 / (val + 32768)));
                    data.setInt8(offset, val, true);
                }
            } else {
                for (var i = 0; i < pcmBuffer.length; i++, offset += 2) {
                    var s = Math.max(-1, Math.min(1, pcmBuffer[i]));
                    data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }
            }

            return data;
        },
        playWav: function (data) {
            // console.log(data);
            var reader = new FileReader();
            reader.readAsArrayBuffer(new Blob([data], {
                type: 'audio/wav'
            }));
            reader.onload = function (e) {
                aContext.decodeAudioData(reader.result, function (buffer) {
                    var audioBufferSouceNode = aContext.createBufferSource();
                    audioBufferSouceNode.buffer = buffer;
                    audioBufferSouceNode.connect(aContext.destination);
                    audioBufferSouceNode.start(0);
                }, function (e) {
                    console.log("Failed to decode the file");
                });
            }
        }
    };

    //音频采集
    recorder.onaudioprocess = function (e) {
        var tempBuff = e.inputBuffer.getChannelData(0);
        //console.log(tempBuff)
        for (let i = 0; i < tempBuff.length; i++) {
            audioData.audioBuffer.push(tempBuff[i]);
        }
        if (audioData.audioBuffer.length == 2048) {
            audioData.send();
        }
    }

    //开始录音
    this.start = function () {
        audioInput.connect(recorder);
        recorder.connect(aContext.destination);
    }

    //停止录音
    this.stop = function () {
        audioInput.disconnect();
        recorder.disconnect();
    }

    //播放
    this.play = function () {
        isPlaying = true;

        playInterval = setInterval(function () {
            var decodeLength = 40;
            if (isHup && (audioData.audioOffset + 1) * decodeLength > voiceBuffer.length) {
                sRecorder.stopPlay();
                return;
            }

            if ((audioData.audioOffset + 1) * decodeLength <= voiceBuffer.length) {
                var splVoice = voiceBuffer.slice(audioData.audioOffset * decodeLength, (audioData.audioOffset + 1) * decodeLength);
                //console.log(splVoice);

                //Array转Uint8Array
                var intVoice = new Uint8Array(splVoice.length);
                for (let i = 0; i < intVoice.length; i++) {
                    intVoice[i] = splVoice[i];
                }
                //console.log(intVoice);

                //speex解码
                var pcmBuffer = codec.decode(intVoice);
                //console.log(pcmBuffer);
                audioData.inputUseSaveBuffer(pcmBuffer);

                //pcm转wav
                var data = audioData.encodeWav(pcmBuffer);
                //console.log(data);

                //播放wav
                audioData.playWav(data);

                //偏移量递增
                audioData.audioOffset++;
            }
        }, 40)
    }

    //结束播放
    this.stopPlay = function () {
        window.clearInterval(playInterval);
        isPtt = false;
        isPlaying = false;
        voiceBuffer = [];
        audioData.audioOffset = 0;
        audioData.inputSaveBuffer(pttId);
        console.log("stop play");
    }
};

//获取麦克风权限
var SRecorder_get = function (callback) {
    if (callback) {
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                    audio: true
                },
                function (stream) {
                    var rec = new SRecorder(stream);
                    callback(rec);
                },
                function (error) {
                    alert("Not support microphones or no permissions!");
                })
        } else {
            alert("getUserMedia not supported");
        }
    }
}
SRecorder_get(function (rec) {
    sRecorder = rec;
});

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
        //sip = data.ip;
        //sPort = data.tport;

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
            if (isDev)
                console.log("webSocket close");

            //掉线重连
            if (!errorLogin) {
                setTimeout(function () {
                    if (isDev)
                        console.log("reconnect...");

                    login(msId, msPwd, function (data) {
                        if (isDev)
                            console.log(data);
                    });
                }, 3000);
            }
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

//处理指令
function doReceive(data) {
    switch (data.cmd) {
        case 'LOGIN':
            loginResp = data;

            if (data.code == 0) { //登录成功
                HBInterval = setInterval(sendHB, timeout); //维持心跳
                getToken(); //获取token
            } else {
                errorLogin = true;
                setTimeout(function () {
                    errorLogin = false;
                }, 3000);
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
        case 'QUERYMEMBER_RESP':
            queryTempGroupResp = data;
            break;
        case 'NOTICE':
            noticeResp = data;

            if (data.type == 7) { //重复登录
                errorLogin = true;
                setTimeout(function () {
                    errorLogin = false;
                }, 3000);
            }
            break
        case 'VOICE':
            handleVoice(data);
            break;
        case 'HUP':
            handleHup();
            break;
        case 'SMS_RESP':
            sendSMSResp = data;
            break;
        case 'SMS':
            smsResp = data;
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

//查询临时群组
function queryTempGroup(callback) {
    var map = {};
    map['cmd'] = 'QUERYMEMBER';
    map['type'] = 1;
    webSocket.send(JSON.stringify(map));

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

//发送短信
function sendSMS(mid, msName, msg, callback) {
    var map = {};
    map['cmd'] = 'SMS';
    map['mid'] = mid;
    map['msName'] = msName;
    map['msg'] = msg;
    webSocket.send(JSON.stringify(map));

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
    }, 500);
}

//接收短信
function receiveSMS(callback) {
    window.clearInterval(receiveSMSInterval);
    //返回结果定时器
    receiveSMSInterval = setInterval(function () {
        if (smsResp != null) {
            //执行回调方法
            if (callback && typeof (callback) === "function")
                callback(smsResp);
            //清除结果
            smsResp = null;
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
        sRecorder.start();
        door = true;
        if (isDev)
            console.log("recording...");
    }
}

//结束ptt
function pttStop() {
    if (door) {
        sRecorder.stop();
        door = false;
        if (isDev)
            console.log("stop record");
    }
}

//接收语音
function receiveVoice(callback) {
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
    if (isDev)
        console.log("recevice voice:", voice);

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

        //加入缓存区
        for (var i = 0; i < voice.length; i++) {
            voiceBuffer.push(voice[i]);
        }

        //缓存4帧后播放
        if (!isPlaying && voiceBuffer.length > 80) {
            sRecorder.play();
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

//调试日志开关
function openDevLog(status) {
    isDev = status;
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

function getGroupsList() {
  return axios({
    url: `${_url}/data/grps?auth=${token}&cid=${msId}`
  })
}

function getMemberList(gid) {
  return axios({
    url: `${_url}/data/clients?auth=${token}&cid=${msId}&gid=${gid}`
  })
}

import axios from 'axios'

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
  receiveSMS
}